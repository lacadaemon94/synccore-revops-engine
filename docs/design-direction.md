# Design Direction

## Product

- Product name: `Iter SyncCore`
- Public product surfaces should use `Iter SyncCore`
- `SyncCore RevOps Engine` remains the open-source and technical project name in architecture and implementation docs where that framing is more useful

## Visual References

- Linear
  Navigation density, object detail pages, command-center posture, and activity timelines
- Stripe Billing
  Revenue recovery framing, billing metrics, and money-critical operational context
- Inngest / Trigger.dev
  Retry visibility, workflow-run ergonomics, observability, and system-state clarity
- Plain
  Action center patterns, human-in-the-loop operations, and structured operator workflows
- PostHog
  Single-source-of-truth attitude, product-plus-data personality, and analytical sharpness
- Better Stack
  Incident severity, escalation hierarchy, and calm high-signal alert handling

## UI Principles

- Less blocky overall composition
- Fewer giant cards competing for attention
- Denser tables with better scanning rhythm
- Softer surfaces instead of hard-edged stacked boxes
- Stronger typography and clearer weight hierarchy
- Object detail pages that feel first-class, not secondary
- Right-side operational rail for status, actions, and timelines
- Clearer separation between metrics, events, actions, and queue items

## Current UI Audit

- `AppShell`
  Too much of the brand and information hierarchy lives in one left-rail block. The revamp should introduce a more premium product header, tighter navigation rhythm, and a cleaner command-center frame.
- `MetricCard`
  Metrics are visually large and equally weighted. The revamp should make metrics denser, calmer, and easier to scan in groups.
- `DataTable`
  Tables are functional but not yet crisp enough for an infra/ops product. Headers, row density, empty states, and inline metadata should feel closer to Linear or Stripe Billing.
- `Panel`
  Panels currently act as broad generic boxes. The revamp should differentiate informational panels, object summaries, and operational callouts more clearly.
- `ActionCard`
  Action cards are useful but still read as stacked blocks. They should evolve toward more structured operator objects with stronger status and ownership hierarchy.
- `QueueRetryCard`
  Retry cards expose the right data, but they need a more observability-oriented run-state treatment with tighter scheduling, severity, and retry metadata presentation.
- `Badge` components
  Badges work functionally but need a more refined semantic system and calmer visual language.
- `PageHeader` / `SectionHeader`
  Headers need stronger editorial hierarchy, better density control, and a cleaner relationship to actions, filters, and status context.

## Revamp Guardrails

- This document is a prep pass, not the redesign itself
- Avoid rewriting every page until the new layout and component language are approved
- Use the token file as a planning seed, not a full theming engine
