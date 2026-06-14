"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/actions", label: "Ops Actions" },
  { href: "/events", label: "Events" },
  { href: "/reconciler", label: "Reconciler" },
  { href: "/queue", label: "Queue" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="app-shell">
      <aside className="shell-sidebar">
        <div className="shell-brand">
          <p className="shell-brand__eyebrow">Iter</p>
          <h1 className="shell-brand__title">SyncCore</h1>
          <p className="shell-brand__copy">A demo-first command center for event logging, retries, and revenue recovery operations.</p>
        </div>
        <div className="shell-status">
          <p className="shell-status__label">Demo mode</p>
          <p className="shell-status__value">Local billing, CRM, and workflow data only</p>
        </div>
        <nav className="shell-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={["nav-link", isActive(item.href) ? "is-active" : ""].filter(Boolean).join(" ")}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="shell-main">
        <header className="shell-topbar">
          <div>
            <p className="shell-topbar__eyebrow">Iter SyncCore</p>
            <p className="shell-topbar__title">Revenue operations command center</p>
          </div>
          <p className="shell-topbar__status">DEMO_MODE=true</p>
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
