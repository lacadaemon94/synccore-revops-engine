"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { env } from "../lib/env";

const navItems = [
  { href: "/", label: "Overview", meta: "Command" },
  { href: "/actions", label: "Ops Actions", meta: "Triage" },
  { href: "/events", label: "Events", meta: "Stream" },
  { href: "/reconciler", label: "Reconciler", meta: "Drift" },
  { href: "/queue", label: "Queue", meta: "Retries" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const runtimeLabel = env.demoMode ? "Demo mode" : "Supabase mode";
  const runtimeCopy = env.demoMode ? "Local billing, CRM, and workflow data only" : "Persistent operational store enabled";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="app-shell">
      <aside className="shell-sidebar">
        <div className="shell-sidebar__inner">
          <div className="shell-brand">
            <div className="shell-brand__lockup">
              <span className="shell-brand__mark" aria-hidden="true">
                I
              </span>
              <div>
                <p className="shell-brand__eyebrow">Iter</p>
                <h1 className="shell-brand__title">SyncCore</h1>
              </div>
            </div>
            <p className="shell-brand__copy">A revenue operations command center for event logging, retries, recovery workflows, and revenue drift.</p>
          </div>
          <div className="shell-status">
            <div className="shell-status__row">
              <p className="shell-status__label">Environment</p>
              <span className="shell-status__chip">{runtimeLabel}</span>
            </div>
            <p className="shell-status__value">{runtimeCopy}</p>
          </div>
          <div className="shell-sidebar__section">
            <p className="shell-sidebar__section-title">Navigation</p>
            <nav className="shell-nav">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={["nav-link", isActive(item.href) ? "is-active" : ""].filter(Boolean).join(" ")}>
                  <span className="nav-link__label">{item.label}</span>
                  <span className="nav-link__meta">{item.meta}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="shell-sidebar__footer">
            <p className="shell-sidebar__footer-title">System posture</p>
            <p className="shell-sidebar__footer-copy">Event log first. Dead-letter recovery second. Human triage only when the workflow asks for it.</p>
          </div>
        </div>
      </aside>
      <div className="shell-main">
        <header className="shell-topbar">
          <div className="shell-topbar__intro">
            <p className="shell-topbar__eyebrow">Iter SyncCore</p>
            <p className="shell-topbar__title">Revenue operations command center</p>
          </div>
          <div className="shell-topbar__command">
            <span className="shell-topbar__command-dot" aria-hidden="true" />
            <span className="shell-topbar__command-text">Workflow signal path active</span>
            <p className="shell-topbar__status">{env.demoMode ? "DEMO_MODE=true" : "DEMO_MODE=false"}</p>
          </div>
        </header>
        <nav className="shell-mobile-nav" aria-label="Primary">
          <div className="shell-mobile-nav__scroll">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={["nav-link", "nav-link--mobile", isActive(item.href) ? "is-active" : ""].filter(Boolean).join(" ")}>
                <span className="nav-link__label">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
