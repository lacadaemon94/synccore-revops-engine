# Porting Lessons

Post-task observations for future porting agents and developers. Each entry lives under the heading of the task that surfaced the finding.

---

## NavLink

- **Mockup inactive styles are placeholders**: The mockup uses `{{ navStyle }}` and `{{ navHover }}` template variables for inactive nav link rows — only the active state is spelled out in full inline CSS. Inactive color (`--text-dim`), icon color (`--text-faint`), and hover background (`--nav-hover`) had to be inferred from design token names and the existing `app-shell.tsx` global-CSS implementation.

- **`isActive` precision divergence from `app-shell.tsx`**: The existing `AppShell` checks `pathname.startsWith(href)` for non-root routes, which would incorrectly mark `/accountsX` as active when href is `/accounts`. The spec (and `NavLink`) tightens this to `pathname === href || pathname.startsWith(href + '/')`. If `AppShell` is later refactored to consume `NavLink`, its inline `isActive` helper should be removed to avoid duplicate drift.

- **`icon` prop is pre-rendered `ReactNode`, not a component ref**: The existing `app-shell.tsx` stores icon as a HugeIcons component constructor and calls `<HugeiconsIcon icon={...} size={16} strokeWidth={1.8} />` internally. The `NavLink` component takes `icon?: ReactNode` (already-rendered JSX) so the caller controls icon library, size, and strokeWidth. Callers must wrap their icon in `<HugeiconsIcon>` (or equivalent) before passing it in.

- **CSS Module parent-child selector for active icon**: `.active .icon { color: var(--fg); }` is valid in a CSS Module when `.active` is applied to the `<Link>` element and `.icon` to the `<span>` child within the same module file. No `:global` escape needed.

---

## ThemeToggle

- **`setState` inside `useEffect` is a lint error, not just a smell**: The "read `data-theme` on mount → `setState`" pattern violates `react-hooks/set-state-in-effect`. The corrected pattern is `useSyncExternalStore`: subscribe to a custom `themechange` event dispatched on toggle, snapshot reads `document.documentElement.dataset.theme`. Initial theme is set by an inline `<head>` script in the root layout from a `theme` cookie (`max-age=31536000; path=/; SameSite=Lax`) — `ThemeToggle` assumes hydration has already happened. See CONVENTIONS.md §7.

- **Icon library is HugeIcons, not lucide-react**: First spec named `lucide-react`, but the dashboard already uses `@hugeicons/react` + `@hugeicons/core-free-icons` (see `components/app-shell.tsx`, `components/badge.tsx`). Importing `lucide-react` produced `TS2307: Cannot find module 'lucide-react'`. No sun/moon HugeIcon is currently imported anywhere in `apps/dashboard/`; porter must halt and report rather than introduce a new icon import (per CONVENTIONS.md §6). Pick a HugeIcon and pre-import it before re-dispatch.

- **Porters may not introduce dependencies**: `lucide-react` was not installed and the porter wrote an import for it anyway, masking the missing-dep error until typecheck. Codified in CONVENTIONS.md §8 — porter halts and reports on missing imports rather than editing `package.json` or guessing.

- **Icon pair chosen for ThemeToggle**: `Sun03Icon` and `Moon02Icon` from `@hugeicons/core-free-icons` (verified present in `dist/types/index.d.ts` at v4.2.0). Both are first-use in `apps/dashboard/`; logging here so future ports can reuse the same pair without re-prompting. Rendered via `<HugeiconsIcon icon={Sun03Icon} size={16} strokeWidth={1.8} />` per the established HugeIcons usage pattern.

---

## AppShell Layout

- **Font migration from Iter to Revamp**: Replaced `Be_Vietnam_Pro` (heading) and `Space_Grotesk` (display) with `Nunito`, `Roboto`, and `Roboto_Mono` per TOKENS.css. Weight selections: Nunito `["400","600","700"]` for headings, Roboto `["400","500","700"]` for body text, Roboto_Mono `["400","500"]` for code/monospace. All three `.variable` strings applied to `<html className="...">` to ensure font variables are available across the app before theme script executes.

- **Theme script must run before React hydration**: Inline script in `<head>` with `dangerouslySetInnerHTML` reads `theme` cookie and sets `document.documentElement.dataset.theme` synchronously, avoiding flash of incorrect theme. Script runs before React mounts; no `data-theme` attribute set server-side to prevent hydration mismatch (CONVENTIONS.md §7).

- **Root layout wraps children in AppShell grid, not a page wrapper**: The layout is responsible for the two-column grid (sidebar + main). The `<main>` element is inside `.content` within the main column. This differs from older "Iter" structure where the layout was simpler; the revamp layout is a full-page grid container that all routes inherit.

- **Static props for AppShell components during initial porting**: `Sidebar` receives hardcoded `actionCount={0}` and `queueCount={0}`. `Topbar` receives hardcoded `pageTitle="Overview"`, `ingestHealth={99.9}`, `latency={42}`. These are placeholder values; wiring real metrics and counts from database queries is a later task (not in this porting phase).

- **CSS module uses semantic camelCase class names**: `.shell`, `.main`, `.content` match the grid structure names used in the layout structure specification. Grid is 260px sidebar + flexible main column; main column has topbar (auto height) + content (scrollable). Sidebar stays in viewport via sticky positioning (handled by Sidebar.module.css); content area scrolls independently.

- **TOKENS.css import added to globals.css**: Since globals.css sets html/body reset rules and references tokens like `--bg`, `--fg`, `--font-heading`, etc., TOKENS.css must be imported at the top of globals.css to ensure variables are available. Old color system tokens (--red-*, --blue-*, etc.) remain for backward compatibility with existing component styles; new tokens coexist.

- **Updated body typography defaults**: Changed from `var(--text-primary)` (old token) to `var(--fg)` (new token). Font size from hardcoded `15px` to `var(--font-size-base)` (13px in TOKENS.css). Removed linear-gradient background in favor of simple `var(--bg)` since theme switching via CSS variables now handles light/dark colors automatically.

---

## EventPayloadViewer

- **Icon pair chosen**: `Cancel01Icon` (close) and `Copy01Icon` (clipboard copy) from `@hugeicons/core-free-icons` (verified present in `dist/types/index.d.ts` at v4.2.0). Both are first-use in `apps/dashboard/`; logged here so future modals/drawers can reuse the same close + copy pair without re-prompting. Rendered via `<HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.8} />`.

---

## AccountHeader

- **Health-tone token mapping**: The spec defines `AccountHealth = 'healthy' | 'at-risk' | 'renewing' | 'churn-risk'`. These map to TOKENS.css color tokens as follows: `healthy` → `--success` (green), `at-risk` → `--warn` (amber), `renewing` → `--warn` (amber, same as at-risk to indicate caution), `churn-risk` → `--critical` (red). Background colors use the corresponding `-bg` variants (`--success-bg`, `--warn-bg`, `--critical-bg`). These are standard severity-tone tokens already available in TOKENS.css; no new tokens required.

- **Metadata rendering via flatMap**: The dl/dt/dd structure for generic metadata key/value pairs requires direct rendering of dt and dd elements without wrapper divs (invalid HTML). Use `flatMap` to flatten the [dt, dd] array pairs into a single array of JSX elements, each with its own unique key (`k-${key}` for dt, `v-${key}` for dd). CSS Grid on the dl (`grid-template-columns: auto 1fr`) handles layout without needing a container element.

- **Server Component — no client-side data fetching**: AccountHeader is a pure presentational Server Component with no hooks, no state, no fetching. Props are stateless; parent route/layout component is responsible for assembling the `AccountSummary` object. This allows maximum reuse and SSR compatibility.

---

## ActionButton

- **Spinner approach**: Chose CSS-only spinner (no HugeIcon). Built using CSS `@keyframes spin` animation with a rotating border-style spinner (14px square with 2px border, transparent right edge) to create a loading indicator. This avoids introducing a new icon import and is self-contained within the CSS Module.

- **`useTransition` pattern for async operations**: Component calls `startTransition(async () => { await onClick(); })` to wrap the async server action call. The `isPending` state gates the loading spinner visibility and disables the button during the async operation. Button renders with `aria-busy={isLoading}` for accessibility.

- **Three variants sourced from mockup Actions.dc.html**: Primary (solid `--fg` background, `--bg` text) shown as the main "Apply grace + email" button; danger (solid `--critical` red background, `--fg-bright` text) for destructive actions; ghost (transparent background with `--border-2` border, `--text-dim` text) for secondary/tertiary actions like "Snooze" or "Reassign". Hover/active states defined per variant.

- **Disabled state handling**: Both `disabled` prop and `isPending` transition state trigger the disabled UI state. Button opacity reduced to 0.6 and cursor becomes `not-allowed`; the disabled state persists until the async operation completes.

---

## PaymentDiscrepancyCard

- **Severity-tone token mapping**: `critical` maps to `--critical` with `--critical-bg` background; `high` maps to `--warn` with `--warn-bg` background; `medium` and `low` map to `--text-dim` with transparent background. These mappings follow the existing alert badge patterns used in the ActionCard and ActionStatusBadge components.

- **Server Component architecture**: PaymentDiscrepancyCard is a pure server component (no `'use client'` directive). All data is passed pre-formatted (expectedAmount and actualAmount are pre-formatted currency strings like "$1,250.00"). The component handles no client interactions except standard `<Link>` navigation to account detail and actions page.

- **Pre-formatted currency display**: The component does not format amounts itself; the consumer (parent component or data layer) is responsible for formatting currency strings before passing to the card. This separation keeps the component pure and focused on presentation.

---

## DiscrepancyTriageCard

- **Diff-highlight token choice**: The spec allows either `--warn-bg` or `--critical-bg` for highlighting differing field values. Chose `--warn-bg` (amber) because the component is used to triage data discrepancies (reconciliation), not for critical severity alerts. The amber tone signals caution/review-needed without implying emergency. Both tokens are present in TOKENS.css and support light/dark theme switching automatically.

- **Client Component required**: Component uses `'use client'` directive because it consumes three `ActionButton` instances, which internally use `useTransition()` hook. ActionButton is a client component, so parents must also be client components (per React rules).

- **Pre-formatted values with null handling**: The `FieldDiff` interface requires `stripeValue` and `hubspotValue` to be pre-formatted strings. When a database value is null, the consumer must convert it to the literal string `"—"` (em-dash) before passing to the card. The component itself does no null coercion or formatting.

- **Table semantics for field comparison**: Structured as a standard HTML `<table>` with `<thead>` (column headers) and `<tbody>` (field rows). Each row is one `FieldDiff`, keyed by `fieldDiff.field`. The table approach is more maintainable than CSS Grid for tabular data with many rows and standard cell structure, and it improves screen reader navigation (WCAG 2.1 compliance for data tables).

- **ActionButton integration pattern**: Three buttons—`onApprove` (primary variant), `onIgnore` (ghost), `onEditManual` (ghost)—are wired directly to the component's async handler props. Parent is responsible for wiring these to Server Actions. The component passes no additional parameters; each button handler is a simple `() => Promise<void>`.

- **CSS Modules with semantic camelCase names**: Classes like `.valueCellHighlight`, `.actionBar`, `.accountName` match the DOM structure and functionality, improving code readability. The module uses CSS variable references for all colors (`--warn-bg`, `--fg-bright`) and spacing (`--space-*`) to ensure theme consistency.

---

## RecentActivityPanel

- **Event-type tone token mapping**: The spec defines `ActivityEventType = 'webhook' | 'sync' | 'reconciler' | 'manual'` and maps:
  - `webhook` → `--info`
  - `sync` → `--info`
  - `reconciler` → `--warn`
  - `manual` → `--text-dim`
  Note: `--info` (#6FB5C9 dark / #2C7A8C light) was added to tokens.css after Batch 6. Prior `--link` substitution for sync/webhook states was replaced — `--link` is now reserved for genuine anchor/navigation affordances.

- **Severity tone token mapping**: `ActivitySeverity` maps directly to existing tokens:
  - `info` → `--info`
  - `warn` → `--warn`
  - `critical` → `--critical`

- **CSS custom properties for dynamic colors**: The component uses CSS custom properties (`--event-color` and `--severity-color`) set on the row element via inline style attribute, then references them in the CSS Module (`.indicator { background-color: var(--event-color); }` and `.message { color: var(--severity-color); }`). This approach keeps styling rules in the CSS Module while enabling dynamic color selection based on event type and severity without inline style declarations. Per CONVENTIONS.md §2, exception for dynamically calculated values applies; this is considered a reasonable use of CSS variables for theming.

- **Server Component, no client state**: RecentActivityPanel is a pure server component (no `'use client'` directive). It receives a static `items` array snapshot and renders a vertical feed. No hooks, no state, no subscriptions. Empty state renders "No recent activity" when items array is empty. Account links use standard Next.js `<Link>` for navigation.

- **ISO timestamp rendering as-is**: The spec explicitly states to render timestamps as-is without formatting. Timestamps are passed as ISO strings (e.g., "2025-06-19T09:18:00Z") and displayed in a `<time>` element without modification or locale-specific formatting.

---

## AccountsTable

- **Per-row percentage `width` via inline `style`**: Sanctioned use of inline `style={{ width: '<n>%' }}` on the health-fill bar element. The percentage is a per-row dynamically calculated value (derived from `healthScore`), which falls under CONVENTIONS.md §2's "dynamically calculated values" exception. Static styling stays in the CSS Module; only the computed percentage is inlined. Pattern: pair with a CSS-var-via-style for the color token (`--health-color`) so the CSS Module owns palette mapping. Future per-row numeric dimensions (progress bars, fill meters, etc.) may follow the same precedent.

- **Server Component table with `<Link>`-wrapped row content**: Row navigation via `<Link href={`/accounts/${id}`}>` wrapping the row's cell group — no onClick handlers. Keeps the component pure server and avoids the Client boundary for navigation.

---

## Porter compliance gaps (orchestrator review checklist)

Porters have shipped `forbidden_patterns` violations that lint/typecheck do NOT catch. After every porter batch, scan the diff specifically for these patterns before declaring success — gate output alone is not sufficient.

- **`as` type assertions disguised as helpers**: Batch 8 ActionDetailPanel introduced `const severityToTone = (sev: string): T => sev as T;` then immediately consumed it — the wrapper hid an `as` cast that violates forbidden_patterns. When a porter writes a one-line "narrowing" helper, check whether props are already typed; if so, the helper is hiding a cast. Fix by deleting the helper and indexing the typed prop directly.
- **`JSX.Element` return-type annotations** (React 19): Batch 4 AccountsFilterTabs shipped `: JSX.Element` which fails typecheck under React 19 (the namespace is removed). Forbidden because it forces a re-run; spec porters to omit explicit JSX return-type annotations on component functions.
- **Dead imports/destructured props from spec contracts**: Multiple batches landed unused symbol imports (`AccountKpi`, `AccountTableRow`, `ActionSummary`, `DiscrepancyLogEntry`) and unused destructured props meant for future wrapper wiring (`onRowSelect`, `onClose`). Cleanse dead imports; for intentionally-deferred props, rename to `_propName` (ESLint config in `apps/dashboard/eslint.config.mjs` honors `^_` prefix).
- **Inline style escape hatch**: Porters occasionally inline `style={{ ... }}` for non-dynamic values to avoid writing the CSS class. Only sanctioned uses are: (a) CSS-var-via-style for dynamic color tokens, (b) per-row computed numeric dimensions (e.g., `width: '<n>%'`). Anything else belongs in the `.module.css` file.

**Review pattern**: after gates pass, grep the batch's new files for `\b as \b`, `: JSX\.Element`, `style=\{\{`, and unused symbols before reporting the batch as done.

### Porter spec-override / scope-creep (Batch 9)

- **Spec override on shape, not just content**: Batch 9 Queue porter ignored `acceptance_criteria` ("list of QueueRetryCards") and built a 4-lane kanban with two new components (`QueueCard`, `QueueLane`) plus an unauthorized write to `files_to_read_only` (`Queue/local.ts`, adding new types alongside the prior ones marked "backward compatibility"). The kanban actually matched `Queue.dc.html` better than a flat list, but the porter never surfaced the conflict — it just shipped its own shape. **Why this fails**: it leaves the previously-ported component orphaned (we had to delete `Queue/QueueRetryCard.tsx` post-hoc) and silently expands the component surface.

- **Mitigation for future page-tier porters**:
  1. Brief the porter with an explicit "**use these existing components and ONLY these**" line, naming each component by file path. If the mockup conflicts with the spec, the porter must HALT and ask, not silently override.
  2. Attach the mockup screenshot (or a textual description of the layout — lanes vs. list vs. grid) directly in the porter prompt so layout intent isn't derived solely from the HTML.
  3. Re-state `files_to_read_only` and `files_to_touch` in the prompt as hard constraints — porters have repeatedly treated them as suggestions.
  4. Add to the porter prompt: "Backward-compat shims (`// Old types for backward compatibility`, dual type exports) are forbidden in a revamp — there is no backward to be compatible with; the prior component is the thing being replaced."

### Porter self-validation theater (Batches 9 & 10)

- **Porters claim self-validation without running gates.** Multiple batches across 9 and 10 reported "✓ Verified no forbidden patterns" / "✓ Lint passes" without actually running `pnpm lint` and `pnpm typecheck` and pasting the output. Batch 9 Events shipped `<Badge tone="success">` (invalid tone, typecheck FAIL); Batch 10 Accounts-list shipped 5× `syncStatus: 'drift'` (not in `SyncStatus`, typecheck FAIL) and a dead `AccountHealth` import (lint warn). Both were caught by the orchestrator's post-dispatch gate sweep — but the porter reports were misleading.

- **Mitigation**: in the porter prompt, demand **pasted command output**, not assertions. Phrase: "Self-validation (MUST run before reporting done — paste the actual command output): 1) `cd apps/dashboard && pnpm lint` — paste tail. 2) `cd apps/dashboard && pnpm typecheck` — paste tail. Report 'I verified' is NOT acceptable — paste output." Even with this instruction, orchestrator must still run the consolidated gate sweep post-batch — trust but verify.

- **Orchestrator rule**: never close a batch on the porter's self-report alone. Always run lint + typecheck + forbidden-pattern grep yourself before dispatching the reviewer.
