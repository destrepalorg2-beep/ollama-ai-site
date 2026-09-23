/**
 * Getting out to api.telegram.org from a machine where it is blocked.
 *
 * The usual setup in Russia: the ISP blocks api.telegram.org, the user runs a
 * VPN client (Happ, v2rayN, Clash, Nekoray…) in "proxy" mode, and the browser
 * works because Windows hands it the system proxy setting. Node does not read
 * that setting, so it dials out directly and hits the block — the site loads,
 * the bot does not.
 *
 * So instead of asking the user to reconfigure anything, this module looks for
 * a way out on its own:
 *
 *   1. TG_PROXY from .env.local, if it is set.
 *   2. The Windows system proxy, read straight from the registry — that is the
 *      one the VPN client already configured for the browser.
 *   3. Any local proxy listening on the ports those clients commonly use.
 *   4. A plain direct connection.
 *
 * Each candidate is tried with a real getMe call, and the first one Telegram
 * answers wins. Nothing here is written to disk and no address is guessed at
 * runtime: a candidate is only used if something is actually listening.
 *
 * Written against node:net / node:tls / node:https rather than fetch, because
 * fetch cannot be told to tunnel through a proxy without pulling in a
 * dependency, and this bot has none.
 */

import net from "node:net";
import tls from "node:tls";
import https from "node:https";
import { execFile } from "node:child_process";

/** Long enough for a slow VPN hop, short enough that scanning stays quick. */
const CONNECT_TIMEOUT = 8000;

/** Hard ceiling on one candidate, whatever happens inside it. */
const ATTEMPT_MS = 15000;

/**
 * Give a promise a deadline it cannot outlive.
 *
 * request.setTimeout only arms once a socket has been handed to the request, so
 * a connection attempt that never produces a socket has no timer on it at all —
 * and the search sits there in silence with nothing to report. This is the
 * outer guarantee: every attempt ends, one way or another.
 */
function deadline(promise, ms) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(Object.assign(new Error("превышено время попытки"), { code: "ETIMEDOUT" })),
        ms,
      );
    }),
  ]);
}

/**
 * Ports the common Windows VPN/proxy clients listen on locally.
 * Happ and v2rayN default to 2080/10808, Clash to 7890, Shadowsocks to 1080.
 * Nothing is assumed: a port is only tried if something answers on it.
 */
const LOCAL_PORTS = [2080, 2081, 10808, 10809, 1080, 1081, 7890, 7891, 8080, 8888, 8889];

/* ── low-level dialling ───────────────────────────────────────────────────── */

/** Plain TCP, with a timeout that actually fires on a black-holed address. */
function tcp(host, port) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host, port });
    const onErr = (e) => {
      sock.destroy();
      reject(e);
    };
    sock.setTimeout(CONNECT_TIMEOUT, () => onErr(Object.assign(new Error("таймаут"), { code: "ETIMEDOUT" })));
    sock.once("error", onErr);
    sock.once("connect", () => {
      sock.setTimeout(0);
      sock.off("error", onErr);
      resolve(sock);
    });
  });
}

/**
 * SOCKS5 CONNECT, no authentication.
 *
 * Replies are buffered rather than read chunk-by-chunk: TCP is free to split or
 * coalesce them, and a handshake that assumes one packet per reply works on the
 * first try and mysteriously fails later.
 */
function socks5(proxyHost, proxyPort, dstHost, dstPort) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host: proxyHost, port: proxyPort });
    let buf = Buffer.alloc(0);
    let greeted = false;

    const cleanup = () => {
      sock.setTimeout(0);
      sock.off("data", onData);
      sock.off("error", onErr);
    };
    const fail = (msg) => {
      cleanup();
      sock.destroy();
      reject(new Error(msg));
    };
    const onErr = (e) => {
      cleanup();
      sock.destroy();
      reject(e);
    };

    function onData(chunk) {
      buf = Buffer.concat([buf, chunk]);

      if (!greeted) {
        if (buf.length < 2) return;
        if (buf[0] !== 0x05) return fail("SOCKS5: ответ не по протоколу");
        if (buf[1] === 0xff) return fail("SOCKS5: прокси требует логин и пароль");
        if (buf[1] !== 0x00) return fail(`SOCKS5: метод ${buf[1]} не поддерживается`);
        buf = buf.subarray(2);
        greeted = true;

        const host = Buffer.from(dstHost, "utf8");
        sock.write(
          Buffer.concat([
            Buffer.from([0x05, 0x01, 0x00, 0x03, host.length]),
            host,
            Buffer.from([(dstPort >> 8) & 0xff, dstPort & 0xff]),
          ]),
        );
        return;
      }

      // VER REP RSV ATYP ADDR PORT — length depends on the address type.
      if (buf.length < 5) return;
      if (buf[1] !== 0x00) return fail(`SOCKS5: прокси отказал (код ${buf[1]})`);
      const atyp = buf[3];
      const need = atyp === 0x01 ? 10 : atyp === 0x04 ? 22 : 4 + 1 + buf[4] + 2;
      if (buf.length < need) return;

      cleanup();
      resolve(sock);
    }

    sock.setTimeout(CONNECT_TIMEOUT, () => fail("SOCKS5: таймаут"));
    sock.on("error", onErr);
    sock.on("data", onData);
    sock.once("connect", () => sock.write(Buffer.from([0x05, 0x01, 0x00])));
  });
}

/** HTTP CONNECT tunnel — what an ordinary HTTP proxy offers for HTTPS. */
function httpConnect(proxyHost, proxyPort, auth, dstHost, dstPort) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host: proxyHost, port: proxyPort });
    let head = "";

    const cleanup = () => {
      sock.setTimeout(0);
      sock.off("data", onData);
      sock.off("error", onErr);
    };
    const fail = (msg) => {
      cleanup();
      sock.destroy();
      reject(new Error(msg));
    };
    const onErr = (e) => {
      cleanup();
      sock.destroy();
      reject(e);
    };

    function onData(chunk) {
      // latin1 keeps byte offsets honest while looking for the header break.
      head += chunk.toString("latin1");
      if (head.indexOf("\r\n\r\n") < 0) return;
      const code = Number(/^HTTP\/1\.[01] (\d{3})/.exec(head)?.[1] ?? 0);
      if (code !== 200) return fail(`HTTP-прокси ответил ${code || "непонятно"}`);
      cleanup();
      resolve(sock);
    }

    sock.setTimeout(CONNECT_TIMEOUT, () => fail("HTTP-прокси: таймаут"));
    sock.on("error", onErr);
    sock.on("data", onData);
    sock.once("connect", () => {
      let req =
        `CONNECT ${dstHost}:${dstPort} HTTP/1.1\r\n` + `Host: ${dstHost}:${dstPort}\r\n`;
      if (auth) req += `Proxy-Authorization: Basic ${Buffer.from(auth).toString("base64")}\r\n`;
      sock.write(req + "\r\n");
    });
  });
}

function dial(route, host, port) {
  if (route.kind === "socks5") return socks5(route.host, route.port, host, port);
  if (route.kind === "http") return httpConnect(route.host, route.port, route.auth, host, port);
  return tcp(host, port);
}

/**
 * An https.Agent that opens its sockets through `route`.
 *
 * Overriding createConnection is the supported way to slip a tunnel underneath
 * the normal HTTPS machinery — keep-alive, chunked bodies and redirects all
 * keep working, which is why this is built on https.request and not on a
 * hand-rolled HTTP parser.
 */
class TunnelAgent extends https.Agent {
  constructor(route) {
    super({ keepAlive: true, maxSockets: 4 });
    this.route = route;
  }

  createConnection(options, cb) {
    const host = options.host;
    const port = options.port || 443;
    dial(this.route, host, port).then(
      (raw) => {
        const secure = tls.connect({ socket: raw, servername: host });
        // Errors here surface on the request; without a listener Node treats an
        // early TLS failure as unhandled and kills the process.
        secure.once("error", () => raw.destroy());
        cb(null, secure);
      },
      (err) => cb(err),
    );
  }
}

/* ── requests ─────────────────────────────────────────────────────────────── */

/**
 * POST JSON, get JSON back.
 *
 * `timeoutMs` has to clear the long-poll window: getUpdates holds the
 * connection open for its full `timeout` before answering, and a request
 * timeout shorter than that turns normal waiting into an error every cycle.
 */
export function post(url, body, { agent, timeoutMs = 70000 } = {}) {
  const payload = JSON.stringify(body ?? {});
  const u = new URL(url);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        agent: agent ?? undefined,
      },
      (res) => {
        let text = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (text += c));
        res.on("end", () => {
          let json = {};
          try {
            json = JSON.parse(text);
          } catch {
            json = { ok: false, description: `не JSON (HTTP ${res.statusCode})` };
          }
          resolve({ status: res.statusCode, json });
        });
      },
    );

    req.setTimeout(timeoutMs, () =>
      req.destroy(Object.assign(new Error("таймаут запроса"), { code: "ETIMEDOUT" })),
    );
    req.on("error", reject);
    req.end(payload);
  });
}

/* ── finding a way out ────────────────────────────────────────────────────── */

/** Is anything listening on this local port? Kept short — it runs up to 11 times. */
function listening(port) {
  return new Promise((resolve) => {
    const sock = net.connect({ host: "127.0.0.1", port });
    const done = (v) => {
      sock.destroy();
      resolve(v);
    };
    sock.setTimeout(400, () => done(false));
    sock.once("connect", () => done(true));
    sock.once("error", () => done(false));
  });
}

/** The proxy Windows hands to the browser — set by the VPN client itself. */
function windowsProxy() {
  return new Promise((resolve) => {
    if (process.platform !== "win32") return resolve(null);
    execFile(
      "reg",
      ["query", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "/v", "ProxyServer"],
      { windowsHide: true, timeout: 4000 },
      (err, out) => {
        if (err) return resolve(null);
        const line = /ProxyServer\s+REG_SZ\s+(.+)/i.exec(out || "");
        if (!line) return resolve(null);
        // Either "host:port" or "http=h:p;https=h:p;socks=h:p".
        const one = /(?:^|;)\s*(?:https?=)?([^;=\s]+:\d+)/i.exec(line[1].trim());
        resolve(one ? one[1] : null);
      },
    );
  });
}

/** "socks5://user:pass@host:1080" / "http://host:8080" / "host:8080" */
function parse(spec, note) {
  const m = /^(?:(socks5?|https?):\/\/)?(?:([^@/]+)@)?([^:/]+):(\d+)$/i.exec(spec.trim());
  if (!m) return [];
  const [, scheme, auth, host, port] = m;
  const where = note ? `${note} ${host}:${port}` : `${host}:${port}`;
  const socks = { kind: "socks5", host, port: +port, auth, label: `SOCKS5 ${where}` };
  const http = { kind: "http", host, port: +port, auth, label: `HTTP-прокси ${where}` };
  if (scheme?.startsWith("socks")) return [socks];
  if (scheme?.startsWith("http")) return [http];
  return [socks, http]; // no scheme given — try both
}

/**
 * Try every way out in turn and return the first that Telegram answers.
 *
 * A reply that rejects the token still counts as success: the network works,
 * and the caller reports the token problem rather than blaming the connection.
 */
export async function findRoute({ token, explicit, log = () => {} }) {
  const candidates = [];

  if (explicit) candidates.push(...parse(explicit, "из TG_PROXY"));

  candidates.push({ kind: "direct", label: "напрямую" });

  const sys = await windowsProxy();
  if (sys) candidates.push(...parse(sys, "системный прокси"));

  for (const port of LOCAL_PORTS) {
    if (!(await listening(port))) continue;
    candidates.push(...parse(`127.0.0.1:${port}`, "локальный"));
  }

  const seen = new Set();
  const unique = candidates.filter((c) => {
    const key = `${c.kind}:${c.host ?? ""}:${c.port ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  log(`  вариантов: ${unique.length} (${unique.map((c) => c.label).join(", ")})`);

  for (const c of unique) {
    // Logged before the attempt, not after: if something does wedge, the log
    // still says which candidate it wedged on instead of stopping mid-air.
    log(`  пробую ${c.label} ...`);

    const agent = c.kind === "direct" ? null : new TunnelAgent(c);
    try {
      const r = await deadline(
        post(`https://api.telegram.org/bot${token}/getMe`, {}, { agent, timeoutMs: ATTEMPT_MS - 1000 }),
        ATTEMPT_MS,
      );
      if (r.json?.ok || r.json?.description) {
        log(`    ОК`);
        return { agent, route: c, me: r.json };
      }
      log(`    странный ответ (HTTP ${r.status})`);
    } catch (e) {
      log(`    не прошло (${e.code ?? e.message})`);
    }
    agent?.destroy?.();
  }

  return null;
}
