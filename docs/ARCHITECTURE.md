# Architecture: SyncCore Dashboard Revamp

This document outlines the architecture, routing layout, data flow, and React Server/Client Component boundaries for the ported SyncCore Dashboard.

---

## 1. Route Tree

The dashboard app uses the Next.js App Router. The target structure lives at `apps/dashboard/app/` and maps exactly to the mockups as follows:

```txt
apps/dashboard/app/
├── layout.tsx                  # Root Layout (Fonts, Global CSS, Theme Context Provider)
├── loading.tsx                 # Root loading state (skeleton overlay)
├── globals.css                 # Global CSS (Imports TOKENS.css, sets body transitions)
├── page.tsx                    # / (Overview Dashboard - maps to "Overview v3.dc.html")
├── accounts/
│   ├── page.tsx                # /accounts (Accounts List - maps to "Accounts.dc.html" list)
│   └── [id]/
│       └── page.tsx            # /accounts/[id] (Account Detail - maps to "Accounts.dc.html" detail)
├── actions/
│   └── page.tsx                # /actions (Actions Inbox - maps to "Actions.dc.html")
├── events/
│   └── page.tsx                # /events (Event Log - maps to "Events.dc.html")
├── queue/
│   └── page.tsx                # /queue (Recovery Queue - maps to "Queue.dc.html")
└── reconciler/
    └── page.tsx                # /reconciler (Reconciler - maps to "Reconciler.dc.html")
```

---

## 2. Layouts and Shell

### Root Layout (`app/layout.tsx`)
- Loads Google Fonts (`Nunito` for headings, `Roboto` for body text, and `Roboto Mono` for monospace elements) using `next/font/google`.
- Injects CSS variables via class name or CSS variable bindings.
- Mounts the `ThemeProvider` to persist light/dark choices via a HTML attribute (`data-theme="light"` or `data-theme="dark"`).

### App Shell (`components/AppShell/`)
- A shared frame enclosing all routes.
- **Sidebar Component (`components/AppShell/Sidebar.tsx`)**: Left rail containing brand header, main navigation navigation with count badges (e.g. actions, queue counts), runtime status metadata (live Supabase connection vs demo mode status indicator).
- **Topbar Component (`components/AppShell/Topbar.tsx`)**: Global header containing the active screen label, the global search trigger (`⌘K` Command Palette), system metrics (e.g. ingest health rate, latency), the light/dark theme toggle button, and the user profile dropdown.

---

## 3. Data Flow

SyncCore follows a strict Server-First, Unidirectional Data Flow:

```txt
┌─────────────────────────────────────────────────────────┐
│                    Supabase / Postgres                  │
└────────────────────────────┬────────────────────────────┘
                             │
                  lib/data/* Abstraction Layer (DAL)
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              React Server Components (RSCs)             │
│        - Fetch data on server                           │
│        - Render static layouts & layout shells          │
└────────────────────────────┬────────────────────────────┘
                             │
                             ├──────────────────────────┐
                             ▼                          ▼
              ┌──────────────────────────┐ ┌──────────────────────────┐
              │    Client Components     │ │    Server Actions         │
              │  - Filter, theme, modal  │ │  - Mutate (Retry, etc.)  │
              │  - Button click handlers │ │  - Revalidate route path  │
              └──────────────────────────┘ └────────────┬─────────────┘
                                                        │
                                                        ▼
                                                 revalidatePath()
```

### Abstraction Layer (`lib/data/*`)
Components must **never** call Supabase SDKs or execute raw database queries directly. Instead, they must import functions from:
- `lib/data/accounts.ts`
- `lib/data/events.ts`
- `lib/data/queue.ts`
- `lib/data/discrepancies.ts`
- `lib/data/metrics.ts`

These data access layers automatically handle the distinction between `DEMO_MODE=true` (reading local TypeScript fixtures) and `DEMO_MODE=false` (fetching from Supabase/Postgres).

### Mutations
Operations (e.g., force-retrying a queue event, resolving a billing action, snoozing a task) are initiated via **React Server Actions** inside `actions/` folder, which:
1. Validate payload inputs.
2. Execute operational updates against the Supabase DB / local mock handlers.
3. Call `revalidatePath(...)` to trigger server-side re-fetching and UI updates.

---

## 4. Server/Client Component Split

We enforce a strict boundary between Server Components (default) and Client Components (marked with `"use client"`).

### React Server Components (RSCs)
*Used for markup layout, initial page data queries, and skeleton assemblies.*
- **Pages** (`app/**/page.tsx`): Fetch initial data on the server and pass it down.
- **Table Wrappers**: Assemble headers and render rows from server data.
- **KPI Panels**: Calculate summaries, rates, and exposure amounts server-side.

### Client Components (CCs)
*Used for interactivity, animations, portal overlays, and local UI state.*
- **Command Palette** (`components/AppShell/CommandPalette.tsx`): Opens search modal on `⌘K`.
- **Theme Toggle** (`components/AppShell/ThemeToggle.tsx`): Toggles between light and dark body themes.
- **Inbox Detail Rails** (`components/Actions/ActionDetailPanel.tsx`): Slide-over panel containing specific interactive forms (resolve action form, assignee list dropdown).
- **Interactive Buttons** (`components/common/ActionButton.tsx`): Triggers Server Actions and shows local loading spinners during executions.
