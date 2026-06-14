export const designTokens = {
  background: "#0b1020",
  surface: "#121a2b",
  surfaceMuted: "#182338",
  border: "#27324a",
  textPrimary: "#f3f6ff",
  textSecondary: "#94a3b8",
  accent: "#63b3ff",
  success: "#34d399",
  warning: "#fbbf24",
  critical: "#fb7185",
  info: "#7dd3fc"
} as const;

export type DesignTokenName = keyof typeof designTokens;
