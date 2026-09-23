"use client";

import Link from "next/link";
import { Apple, Monitor, Smartphone, Terminal } from "lucide-react";
import { PageShell } from "@/components/ui/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { CONTENT } from "@/lib/content";

const ICONS = [Monitor, Apple, Terminal];
const FILES = ["AiHub-Setup.exe", "AiHub-Setup.dmg", "AI-Hub.AppImage"];

// Both builds come from the aihub-desktop repo's GitHub Actions pipeline,
// which builds Windows + macOS on every version tag and attaches both
// installers to one release. /latest/download/ always resolves to whatever
// the newest release attaches under this exact filename, so these links
// never need updating as long as future releases keep the same asset names.
const RELEASES_BASE =
  "https://github.com/destrepalorg2-beep/aihub-desktop/releases/latest/download";
const WINDOWS_DOWNLOAD_URL = `${RELEASES_BASE}/AiHub-Setup.exe`;
const MAC_DOWNLOAD_URL = `${RELEASES_BASE}/AiHub-Setup.dmg`;

export default function DownloadPage() {
  const { lang } = useT();
  const c = CONTENT[lang].download;

  return (
    <PageShell title={c.title} lede={c.lead}>
      <div className="space-y-3">
        {c.builds.map((b, i) => {
          const I = ICONS[i];
          return (
            <div
              key={b.os}
              className="flex flex-col gap-5 rounded-2xl border border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-4">
                <I className="mt-0.5 h-6 w-6 shrink-0 text-white/60" strokeWidth={1.5} />
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-white">{b.os}</div>
                  <div className="mt-0.5 text-sm text-white/50">{b.req}</div>
                  <div className="mt-2 text-sm text-white/60">{b.note}</div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
                {i === 0 || i === 1 ? (
                  <a
                    href={i === 0 ? WINDOWS_DOWNLOAD_URL : MAC_DOWNLOAD_URL}
                    className={buttonVariants({ variant: "default" })}
                  >
                    {c.downloadCta} — {FILES[i]}
                  </a>
                ) : (
                  <>
                    <span className={buttonVariants({ variant: "outline" })}>{FILES[i]}</span>
                    <span className="text-[11px] text-white/35">{c.soon}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 p-6">
        <div className="flex items-start gap-4">
          <Smartphone className="mt-0.5 h-6 w-6 shrink-0 text-white/60" strokeWidth={1.5} />
          <div>
            <div className="text-lg font-semibold text-white">{c.phone}</div>
            <div className="mt-2 text-sm leading-relaxed text-white/60">{c.phoneText}</div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-white/45">{c.notReady}</p>

    </PageShell>
  );
}
