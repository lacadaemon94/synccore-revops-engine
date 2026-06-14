"use client";

import {
  ActivityCircleIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  DashboardSquare01Icon,
  DatabaseIcon,
  Moon02Icon,
  RefreshIcon,
  SidebarLeftIcon,
  Sun01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { env } from "../lib/env";

type SidebarSectionKey = "environment" | "navigation" | "posture";
type ThemeMode = "dark" | "light";

const navItems = [
  { href: "/", icon: DashboardSquare01Icon, label: "Overview", meta: "Command" },
  { href: "/actions", icon: AlertCircleIcon, label: "Ops Actions", meta: "Triage" },
  { href: "/events", icon: ActivityCircleIcon, label: "Events", meta: "Stream" },
  { href: "/reconciler", icon: DatabaseIcon, label: "Reconciler", meta: "Drift" },
  { href: "/queue", icon: RefreshIcon, label: "Queue", meta: "Retries" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [openSections, setOpenSections] = useState<Record<SidebarSectionKey, boolean>>({
    environment: true,
    navigation: true,
    posture: true
  });
  const runtimeLabel = env.demoMode ? "Demo mode" : "Supabase mode";
  const runtimeCopy = env.demoMode ? "Local billing, CRM, and workflow data only" : "Persistent operational store enabled";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  const toggleSection = (section: SidebarSectionKey) => {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section]
    }));
  };

  return (
    <div
      className={[
        "app-shell",
        `app-shell--theme-${themeMode}`,
        isSidebarCollapsed ? "app-shell--sidebar-collapsed" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <aside className="shell-sidebar">
        <div className="shell-sidebar__inner">
          <div className="shell-brand">
            <div className="shell-brand__lockup">
              <span className="shell-brand__mark" aria-hidden="true">
                I
              </span>
              <div className="shell-brand__name">
                <p className="shell-brand__eyebrow">Iter</p>
                <h1 className="shell-brand__title">SyncCore</h1>
              </div>
            </div>
            <p className="shell-brand__copy">A revenue operations command center for event logging, retries, recovery workflows, and revenue drift.</p>
          </div>
          <div className="shell-controls" aria-label="Dashboard controls">
            <button
              type="button"
              className="shell-control shell-control--icon"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={isSidebarCollapsed}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setIsSidebarCollapsed((current) => !current)}
            >
              <HugeiconsIcon icon={SidebarLeftIcon} size={18} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              className="shell-control shell-control--icon shell-control--theme"
              aria-label={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}
              onClick={() => setThemeMode((current) => (current === "dark" ? "light" : "dark"))}
            >
              <HugeiconsIcon icon={themeMode === "dark" ? Sun01Icon : Moon02Icon} size={18} strokeWidth={1.8} />
            </button>
          </div>
          <section className="shell-sidebar__section shell-sidebar__section--environment">
            <button type="button" className="shell-sidebar__summary" aria-expanded={openSections.environment} onClick={() => toggleSection("environment")}>
              <span>Environment</span>
              <HugeiconsIcon className="shell-sidebar__chevron" icon={ChevronDownIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <div className="shell-sidebar__section-body" hidden={!openSections.environment}>
              <div className="shell-status">
                <div className="shell-status__row">
                  <p className="shell-status__label">Runtime</p>
                  <span className="shell-status__chip">{runtimeLabel}</span>
                </div>
                <p className="shell-status__value">{runtimeCopy}</p>
              </div>
            </div>
          </section>
          <section className="shell-sidebar__section shell-sidebar__section--navigation">
            <button type="button" className="shell-sidebar__summary" aria-expanded={openSections.navigation} onClick={() => toggleSection("navigation")}>
              <span>Navigation</span>
              <HugeiconsIcon className="shell-sidebar__chevron" icon={ChevronDownIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <nav className="shell-nav shell-sidebar__section-body" hidden={!openSections.navigation}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={["nav-link", isActive(item.href) ? "is-active" : ""].filter(Boolean).join(" ")}
                  title={isSidebarCollapsed ? `${item.label} / ${item.meta}` : undefined}
                >
                  <span className="nav-link__icon" aria-hidden="true">
                    <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.8} />
                  </span>
                  <span className="nav-link__label">{item.label}</span>
                  <span className="nav-link__meta">{item.meta}</span>
                </Link>
              ))}
            </nav>
          </section>
          <section className="shell-sidebar__section shell-sidebar__section--posture">
            <button type="button" className="shell-sidebar__summary" aria-expanded={openSections.posture} onClick={() => toggleSection("posture")}>
              <span>System posture</span>
              <HugeiconsIcon className="shell-sidebar__chevron" icon={ChevronDownIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <div className="shell-sidebar__footer shell-sidebar__section-body" hidden={!openSections.posture}>
              <p className="shell-sidebar__footer-title">Event-first operating model</p>
              <p className="shell-sidebar__footer-copy">Event log first. Dead-letter recovery second. Human triage only when the workflow asks for it.</p>
            </div>
          </section>
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
            <span className={["runtime-pill", env.demoMode ? "runtime-pill--demo" : "runtime-pill--live"].join(" ")}>{runtimeLabel}</span>
          </div>
        </header>
        <nav className="shell-mobile-nav" aria-label="Primary">
          <div className="shell-mobile-nav__scroll">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={["nav-link", "nav-link--mobile", isActive(item.href) ? "is-active" : ""].filter(Boolean).join(" ")}>
                <span className="nav-link__icon" aria-hidden="true">
                  <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.8} />
                </span>
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
