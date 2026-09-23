import Link from "next/link";
import { hub } from "@/components/landing/config";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <div className="text-lg font-semibold text-white">{hub.name}</div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
          <Link href="/#features" className="hover:text-white">Возможности</Link>
          <Link href="/pricing" className="hover:text-white">Тарифы</Link>
          <Link href="/docs" className="hover:text-white">Документация</Link>
          <a href={hub.adminUrl} target="_blank" rel="noreferrer" className="hover:text-white">Админ-панель</a>
          <Link href="/login" className="hover:text-white">Войти</Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {hub.name}. Локальный AI-сервер.
      </div>
    </footer>
  );
}
