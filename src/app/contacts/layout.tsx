import type { Metadata } from "next";

/* The page itself is a client component (it switches language), and a client
   component cannot export metadata — so the tab title lives here. */
export const metadata: Metadata = {
  title: "Контакты — AI HUB",
  description: "Связаться с нами и оставить заявку.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
