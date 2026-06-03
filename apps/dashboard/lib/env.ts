export const env = {
  demoMode: process.env.DEMO_MODE !== "false",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  n8nWebhookBaseUrl: process.env.N8N_WEBHOOK_BASE_URL,
  n8nForceRetryWebhookPath: process.env.N8N_FORCE_RETRY_WEBHOOK_PATH ?? "/webhook/synccore/force-retry"
};
