# Local Setup

## Requirements

- Node.js 20 or newer
- pnpm
- Docker, only if using local Postgres instead of Supabase

## Development flow

1. Install workspace dependencies with pnpm.
2. Start the dashboard from the root workspace.
3. Keep `DEMO_MODE=true` while developing the base case study.

The dashboard is designed to run in demo mode without Supabase, Stripe, HubSpot, or Slack credentials.

## Optional local Postgres

The included compose file starts a local Postgres service and loads the SQL files in the `database` folder on first boot.
