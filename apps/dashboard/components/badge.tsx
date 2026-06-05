import type { ReactNode } from "react";

type BadgeTone = "neutral" | "positive" | "warning" | "danger" | "info";

const toneClassNames: Record<BadgeTone, string> = {
  neutral: "badge--neutral",
  positive: "badge--positive",
  warning: "badge--warning",
  danger: "badge--danger",
  info: "badge--info"
};

export function Badge({
  children,
  tone = "neutral",
  className = ""
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  const classes = ["badge", toneClassNames[tone], className].filter(Boolean).join(" ");

  return <span className={classes}>{children}</span>;
}
