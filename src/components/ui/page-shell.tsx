import { SiteNav } from "@/components/ui/site-nav";
import { SiteFooter } from "@/components/ui/site-footer";


/** Page frame: the shared nav tab, a big serif title, optional lede, content. */
export function PageShell({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-5xl tracking-tight text-white md:text-6xl">{title}</h1>
        {lede && <p className="mt-4 text-white/55">{lede}</p>}
        <div className="mt-12">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
