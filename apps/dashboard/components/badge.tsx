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
  className = "",
  leadingDot = false
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  leadingDot?: boolean;
}) {
  const classes = ["badge", toneClassNames[tone], className].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      {leadingDot ? <span className="badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
