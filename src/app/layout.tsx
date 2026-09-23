import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export const metadata: Metadata = {
  title: "AI HUB",
  description: "Локальный AI-сервер с веб-, десктоп- и мобильным клиентом.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <LangProvider>
          {children}
          <LanguageSwitcher />
        </LangProvider>
      </body>
    </html>
  );
}
