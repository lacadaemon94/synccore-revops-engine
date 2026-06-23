# Coding Conventions: SyncCore Dashboard Revamp

This document defines the architectural, naming, styling, and typing conventions for the SyncCore Next.js dashboard codebase. All developers and agents must adhere strictly to these rules.

---

## 1. File Naming Conventions

We enforce consistent casing based on file roles:

| File Role | Naming Pattern | Example |
| :--- | :--- | :--- |
| **Route Folders** | lowercase, hyphenated | `app/accounts/[id]/` |
| **Next.js Route Files** | lowercase (Next.js standard) | `page.tsx`, `layout.tsx`, `loading.tsx` |
| **React Components** | PascalCase | `MetricCard.tsx`, `Sidebar.tsx` |
| **CSS Modules** | PascalCase matching component | `MetricCard.module.css` |
| **Utils, Adapters, Libs** | camelCase | `tokens.ts`, `supabase.ts`, `format.ts` |
| **Type Definitions** | camelCase or PascalCase | `types.ts` |

---

## 2. CSS Module Patterns

For maximum isolation, styling flexibility, and clean separation, we use CSS Modules.

### CSS Module Rules:
1. **No Inline Styles**: All inline styles from the Claude mockups (`style={{...}}`) must be moved to CSS Modules. The only exceptions are dynamically calculated values (e.g. `width: `${percentage}%``).
2. **Variable References**: Reference visual properties (colors, padding, spacing) via variables defined in `apps/dashboard/app/tokens.css`.
3. **No Theme Toggles inside JS styling**: Do not write theme-conditional JS classes. Let CSS handle it automatically because CSS variables in `TOKENS.css` change values based on the HTML `data-theme` attribute.
4. **Naming Classes**: Use camelCase for class names inside modules (e.g., `.cardContainer`, `.metricValue`) so they can be referenced cleanly as `styles.cardContainer` in JSX.

### Example:
```css
/* components/MetricCard.module.css */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  transition: background var(--transition-normal);
}

.card:hover {
  background: var(--surface-raise);
  border-color: var(--border-2);
}
```

```tsx
// components/MetricCard.tsx
import styles from "./MetricCard.module.css";

interface MetricCardProps {
  label: string;
  value: string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <h3 className={styles.value}>{value}</h3>
    </div>
  );
}
```

---

## 3. Import Order

To maintain file readability, keep imports organized into distinct sections:

1. **External Libraries**: `react`, `next/*`, icons (`@hugeicons/react` + `@hugeicons/core-free-icons`), package dependencies.
2. **Internal App Components**: Imports using `@/components/...` or relative directories.
3. **Data Layer & Utils**: Imports using `@/lib/...` or relative files (hooks, helpers, actions).
4. **CSS Modules**: E.g., `import styles from "./Name.module.css"`.

*Example:*
```tsx
import { useState } from "react";
import Link from "next/link";
import { CheckCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/common/Badge";
import { formatCurrency } from "@/lib/format";
import { resolveAction } from "@/app/actions/actions";

import styles from "./ActionCard.module.css";
```

---

## 4. Component Structure and Shape

- **Named Exports**: Prefer named exports for all React components:
  ```tsx
  // GOOD
  export function Sidebar() { ... }
  
  // AVOID (except where required by Next.js router)
  export default function Sidebar() { ... }
  ```
- **Explicit Types**: Do not use `React.FC` or `React.FunctionComponent`. Instead, explicitly type props:
  ```tsx
  interface TableProps {
    rows: RowData[];
    onRowClick: (id: string) => void;
  }
  
  export function Table({ rows, onRowClick }: TableProps) { ... }
  ```
- **Separation of Concerns**: Separate container components (fetching data, managing Server Action transitions) from presentational components (displaying styled tables, cards, lists).

---

## 5. TypeScript Strictness Rules

SyncCore is a strictly typed application.
- **No `any`**: The use of `any` is forbidden. Use specific interfaces, generics, or `unknown` (if type-refinement is needed downstream).
- **Type Database Access**: All return values from `lib/data/*` must carry complete interface definitions mapping to the database tables or fixture schemas.
- **Strict Null Checks**: Explicitly handle possibility of `null` or `undefined` returns from databases or API responses.
- **No Compiler Suppressions**: `// @ts-ignore` or `// @ts-nocheck` is forbidden. If a compiler bypass is absolutely necessary, it must include a prefix comment explaining the exact workaround.

---

## 6. Icon Library

The dashboard uses **HugeIcons** exclusively. Do not import from `lucide-react`, `react-icons`, `@heroicons/*`, or any other icon package.

```tsx
import { DashboardSquare01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

<HugeiconsIcon icon={DashboardSquare01Icon} size={16} strokeWidth={1.8} />
```

If a component needs an icon name that is not already imported somewhere in `apps/dashboard/`, the porter agent must halt and report rather than adding the import on its own. Introducing a new icon is a design decision, not a porting decision.

---

## 7. Theme Initialization Pattern

Theme is stored on `document.documentElement.dataset.theme` (`"light" | "dark"`) and persisted in a `theme` cookie (`max-age=31536000; path=/; SameSite=Lax`). CSS variables in `apps/dashboard/app/tokens.css` switch on the `[data-theme="…"]` attribute selector.

Responsibilities are split:

- **`app/layout.tsx` (Root Layout)**: Renders an inline `<script>` in `<head>` that reads the `theme` cookie and sets `document.documentElement.dataset.theme` *before* React mounts. This avoids a flash of incorrect theme and removes any hydration mismatch.
- **`ThemeToggle` (Client Component)**: Assumes initialization has already run. Subscribes to the current theme via `useSyncExternalStore`, where the subscribe function listens for a custom event (e.g. `themechange`) and the snapshot function reads `document.documentElement.dataset.theme`. On click, it updates `document.documentElement.dataset.theme`, writes the cookie, and dispatches the custom event so subscribers re-render.

Forbidden patterns specific to theme handling:
- Reading initial theme into React state via `useEffect` + `setState` (triggers `react-hooks/set-state-in-effect`).
- Storing theme in `localStorage` only — cookie is required so the inline `<head>` script can read it server-side-rendered HTML can be pre-themed if/when SSR theme detection is added.
- Theme-conditional `className` toggling driven by JS state — CSS variables already key off `[data-theme]`.

---

## 8. Dependency Management

Porter agents (and any other code-writing subagent) **may not add new npm dependencies**. If a porter believes a new package is required to complete a task, it must halt and report rather than editing `package.json` or importing an uninstalled module. New dependencies are an architecture decision and must be approved explicitly.

---

## 9. Mockup Directory

`apps/dashboard/revamp/**` contains the source design mockups (HTML/JS reference artifacts) used as input for porter tasks. It is excluded from ESLint (`eslint.config.mjs` → `globalIgnores`) and TypeScript (`tsconfig.json` → `exclude`). Files there are read-only references for porter tasks and must not be modified. If a mockup is wrong or out of date, regenerate it from the source design tool — do not edit it in place.
