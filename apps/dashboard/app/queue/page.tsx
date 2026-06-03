import { forceRetry } from "../../actions/force-retry";
import { AppShell } from "../../components/app-shell";
import { queueItems } from "../../lib/demo-data";

export default function QueuePage() {
  return (
    <AppShell>
      <h2 className="text-3xl font-semibold">Dead-letter queue</h2>
      <p className="mt-2 text-slate-400">Retryable workflow failures waiting for automated or manual recovery.</p>
      <div className="mt-6 space-y-4">
        {queueItems.map((item) => (
          <form key={item.id} action={async () => { "use server"; await forceRetry(item.id); }} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold">{item.accountName}</p>
                <p className="mt-1 text-sm text-slate-400">{item.targetSystem} · {item.lastError}</p>
                <p className="mt-1 text-sm text-slate-500">Retry {item.retryCount} of {item.maxRetries} · Next: {item.nextRetryAt}</p>
              </div>
              <button className="rounded-xl border border-emerald-400 px-4 py-2 text-sm font-medium text-emerald-200" type="submit">
                Force Retry Now
              </button>
            </div>
          </form>
        ))}
      </div>
    </AppShell>
  );
}
