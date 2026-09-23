import type { Metadata } from "next";

/* The page itself is a client component (it switches language), and a client
   component cannot export metadata — so the tab title lives here. */
export const metadata: Metadata = {
  title: "FAQ — AI HUB",
  description: "Частые вопросы про локальный AI-сервер.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
