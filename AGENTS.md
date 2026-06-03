# AGENTS.md

Guidance for Codex and other coding agents working in this repository.

## Project intent

SyncCore RevOps Engine is a demo-first, open-source RevOps infrastructure case study. Preserve the core idea: n8n handles event orchestration, Supabase/Postgres stores operational truth, and Next.js exposes a clean ops dashboard.

## Working rules

- Use `pnpm` for package management.
- Prefer TypeScript and small, readable modules.
- Preserve `DEMO_MODE=true` as the default developer experience.
- Never require Stripe, HubSpot, or Slack accounts for the base demo.
- Never commit real secrets, API keys, tokens, webhook secrets, or production URLs.
- Keep the project lightweight; avoid adding dependencies unless they clearly improve the MVP.
- Update docs when architecture or setup expectations change.

## Verification

When code changes, run the most relevant available checks:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

If a check is not configured yet, say so in the task summary.

## Architecture priorities

1. Event logging before side effects.
2. Idempotency for incoming provider events.
3. Retryable workflow failures through a dead-letter queue.
4. Visible discrepancy management for revenue operations.
5. Optional real integrations only after the demo path is solid.
