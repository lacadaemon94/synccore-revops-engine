import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { Badge } from "../../components/badge";
import { DataTable } from "../../components/data-table";
import { MetricCard } from "../../components/metric-card";
import { PageHeader } from "../../components/page-header";
import { Panel } from "../../components/panel";
import { SectionHeader } from "../../components/section-header";
import { getAccounts } from "../../lib/data/accounts";
import { formatCompactCurrency, formatCurrency, formatDate, formatPercent, titleCase } from "../../lib/format";

function getRiskTone(riskLevel: "stable" | "urgent" | "watch") {
  if (riskLevel === "urgent") {
    return "danger" as const;
  }

  if (riskLevel === "watch") {
    return "warning" as const;
  }

  return "positive" as const;
}

export default async function AccountsPage() {
  const accounts = await getAccounts();
  const revenueAtRisk = accounts.reduce((total, account) => total + account.revenueAtRisk, 0);
  const atRiskCount = accounts.filter((account) => account.revenueAtRisk > 0).length;
  const averageHealth = accounts.length
    ? Math.round(accounts.reduce((total, account) => total + account.healthScore, 0) / accounts.length)
    : 0;
  const totalArr = accounts.reduce((total, account) => total + account.arr, 0);

  return (
    <AppShell>
      <PageHeader eyebrow="Accounts" title="Account Portfolio">
        <div className="badge-row">
          <Badge tone="info">{accounts.length} accounts</Badge>
          <Badge tone={atRiskCount ? "warning" : "positive"}>{atRiskCount} at risk</Badge>
          <Badge tone={revenueAtRisk ? "danger" : "positive"}>{formatCurrency(revenueAtRisk)} exposed</Badge>
        </div>
      </PageHeader>

      <section className="metrics-grid metrics-grid--three">
        <MetricCard metric={{ label: "Portfolio ARR", value: formatCompactCurrency(totalArr), tone: "positive" }} />
        <MetricCard metric={{ label: "Revenue at risk", value: formatCompactCurrency(revenueAtRisk), tone: revenueAtRisk ? "danger" : "positive" }} />
        <MetricCard metric={{ label: "Average health", value: formatPercent(averageHealth), tone: averageHealth >= 80 ? "positive" : averageHealth >= 60 ? "warning" : "danger" }} />
      </section>

      <section className="split-grid split-grid--golden">
        <div>
          <SectionHeader eyebrow="Portfolio" title="Account table" />
          <DataTable
            rows={accounts}
            getRowKey={(row) => row.id}
            columns={[
              {
                key: "account",
                header: "Account",
                render: (row) => (
                  <div className="cell-stack">
                    <Link className="text-link table-link" href={`/accounts/${row.id}`} title={row.name}>
                      {row.name}
                    </Link>
                    <span className="cell-subtle">{row.domain}</span>
                  </div>
                )
              },
              {
                key: "owner",
                header: "Owner",
                render: (row) => <span className="cell-subtle">{row.owner}</span>
              },
              {
                key: "risk",
                header: "Risk",
                render: (row) => <Badge tone={getRiskTone(row.riskLevel)}>{titleCase(row.riskLevel)}</Badge>
              },
              {
                key: "arr",
                header: "ARR",
                align: "right",
                render: (row) => <span className="emphasis-value">{formatCurrency(row.arr)}</span>
              },
              {
                key: "renewal",
                header: "Renewal",
                render: (row) => <span className="cell-subtle cell-nowrap">{formatDate(row.nextRenewalAt)}</span>
              }
            ]}
            emptyTitle="No accounts loaded"
            emptyDescription="Accounts from demo mode or Supabase will appear here."
          />
        </div>

        <div>
          <SectionHeader eyebrow="Health" title="Portfolio health" />
          <Panel>
            <div className="list list--compact">
              {accounts.map((account) => (
                <Link key={account.id} className="list-row account-health-row" href={`/accounts/${account.id}`}>
                  <div className="cell-stack">
                    <span className="cell-title">{account.name}</span>
                    <span className="cell-subtle">{account.segment} / {account.owner}</span>
                  </div>
                  <div className="health-meter">
                    <div className="health-meter__track">
                      <div className="health-meter__fill" style={{ width: `${account.healthScore}%` }} />
                    </div>
                    <div className="health-meter__meta">
                      <span>{formatPercent(account.healthScore)}</span>
                      <span>{formatCompactCurrency(account.revenueAtRisk)} risk</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}
