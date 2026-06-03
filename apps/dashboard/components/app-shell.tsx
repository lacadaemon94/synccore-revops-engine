import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/events", label: "Events" },
  { href: "/reconciler", label: "Reconciler" },
  { href: "/queue", label: "Queue" }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-800 bg-slate-950/90 p-6 md:block">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">SyncCore</p>
          <h1 className="mt-3 text-2xl font-semibold">RevOps Engine</h1>
          <p className="mt-2 text-sm text-slate-400">Event-driven revenue operations dashboard.</p>
        </div>
        <nav className="mt-10 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="md:pl-64">
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
