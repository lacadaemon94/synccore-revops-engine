'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import type { PortfolioPanelProps } from './local';
import styles from './PortfolioPanel.module.css';

type HealthStyle = CSSProperties & Record<'--health-percent', string>;

/**
 * PortfolioPanel
 * Interactive portfolio view with tab-based filtering (at-risk, all, enterprise).
 * Displays account list sorted by exposure/health with ARR and open action counts.
 *
 * Client component for tab state management.
 */
export function PortfolioPanel({
  accounts,
  activeTab: initialTab,
  tabs,
  footerLabel: _footerLabel,
}: PortfolioPanelProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Filter accounts based on active tab
  const filteredAccounts = accounts.filter((account) => {
    if (activeTab === 'enterprise') {
      return account.segment === 'enterprise';
    }
    if (activeTab === 'atrisk') {
      return account.openCount > 0;
    }
    // 'all' tab shows all accounts
    return true;
  });

  // Compute footer label based on active tab
  const computedFooterLabel =
    activeTab === 'all'
      ? `${filteredAccounts.length} of ${accounts.length} accounts`
      : activeTab === 'enterprise'
        ? `${filteredAccounts.length} of 12 enterprise`
        : `${filteredAccounts.length} of 23 at-risk accounts`;

  return (
    <div className={styles.container} data-tour-id="overview-portfolio">
      <header className={styles.header}>
        <h2 className={styles.title}>Portfolio · exposure</h2>
        <div className={styles.tabBar}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={styles.tab}
              data-active={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.columnHeader}>
          <span className={styles.colAccount}>Account</span>
          <span className={styles.colArr}>ARR</span>
          <span className={styles.colHealth}>Health</span>
          <span className={styles.colOpen}>Open</span>
        </div>

        <div className={styles.rows}>
          {filteredAccounts.map((account) => {
            const healthLevel =
              account.health < 45
                ? 'critical'
                : account.health < 70
                  ? 'warn'
                  : 'success';

            const openLevel =
              account.openCount === 0
                ? 'none'
                : account.health < 45
                  ? 'critical'
                  : 'warn';

            return (
              <Link
                key={account.id}
                href={`/accounts/${account.id}`}
                className={styles.row}
              >
                <div className={styles.accountNameColumn}>
                  <div className={styles.accountName}>{account.name}</div>
                  <div className={styles.accountMeta}>
                    {account.segment} · {account.owner} · renews{' '}
                    {account.renewDate}
                  </div>
                </div>

                <div className={styles.arr}>{account.arr}</div>

                <div className={styles.health}>
                  <div className={styles.healthBar}>
                    <div
                      className={styles.healthFill}
                      style={{ '--health-percent': `${account.health}%` } as HealthStyle}
                      data-level={healthLevel}
                    />
                  </div>
                  <div className={styles.healthLabel}>
                    {account.health} · {account.healthLabel}
                  </div>
                </div>

                <div
                  className={styles.open}
                  data-level={openLevel}
                >
                  {account.openCount}
                </div>
              </Link>
            );
          })}
        </div>

        <div className={styles.footer}>
          <span>{computedFooterLabel}</span>
          <Link href="/accounts" className={styles.footerLink}>
            open Portfolio →
          </Link>
        </div>
      </div>
    </div>
  );
}
