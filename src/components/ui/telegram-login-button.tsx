"use client";

import * as React from "react";

/** The signed payload Telegram's own widget hands back via data-onauth. */
export interface TelegramAuthUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

let instanceCounter = 0;

/**
 * Renders Telegram's official "Log in with Telegram" widget — an iframe
 * Telegram itself controls, not something we draw ourselves. It calls back
 * into `onAuth` with a payload signed by the bot's token; the server verifies
 * that signature in /api/auth/telegram before trusting any of it.
 *
 * One-time setup this component can't do for you: Telegram only renders the
 * widget on a domain the bot owner has approved. In Telegram, open
 * @BotFather → /mybots → (the bot named in NEXT_PUBLIC_TG_BOT) → Bot
 * Settings → Domain, and set it to this site's domain. Until that's done the
 * button area stays blank (Telegram silently refuses to load the iframe).
 */
export function TelegramLoginButton({
  botUsername,
  onAuth,
  size = "large",
  cornerRadius = 10,
  requestAccess = true,
  className,
}: {
  botUsername: string;
  onAuth: (user: TelegramAuthUser) => void;
  size?: "large" | "medium" | "small";
  cornerRadius?: number;
  requestAccess?: boolean;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const callbackName = React.useRef(`__telegramAuthCallback${++instanceCounter}`);
  const onAuthRef = React.useRef(onAuth);
  onAuthRef.current = onAuth;

  React.useEffect(() => {
    const win = window as unknown as Record<string, (user: TelegramAuthUser) => void>;
    const name = callbackName.current;
    // Indirection through a ref: the widget script is only injected once per
    // mount (see the deps array below), so the global it calls has to stay
    // fresh across re-renders without re-injecting the script every time.
    win[name] = (user) => onAuthRef.current(user);

    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", size);
    script.setAttribute("data-radius", String(cornerRadius));
    script.setAttribute("data-onauth", `${name}(user)`);
    if (requestAccess) script.setAttribute("data-request-access", "write");
    el.appendChild(script);

    return () => {
      delete win[name];
      if (el) el.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onAuth is read via onAuthRef, not a dep.
  }, [botUsername, size, cornerRadius, requestAccess]);

  return <div ref={containerRef} className={className} />;
}
