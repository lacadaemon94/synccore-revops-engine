import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  AlertCircleIcon,
  Alert01Icon,
  InformationCircleIcon,
  RecordIcon
} from "@hugeicons/core-free-icons";

type BadgeTone = "neutral" | "positive" | "warning" | "danger" | "info";

const toneClassNames: Record<BadgeTone, string> = {
  neutral: "badge--neutral",
  positive: "badge--positive",
  warning: "badge--warning",
  danger: "badge--danger",
  info: "badge--info"
};

const toneIcons = {
  neutral: RecordIcon,
  positive: Tick02Icon,
  warning: Alert01Icon,
  danger: AlertCircleIcon,
  info: InformationCircleIcon
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
  leadingDot = false,
  iconOnly = false,
  tooltip
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  leadingDot?: boolean;
  iconOnly?: boolean;
  tooltip?: string;
}) {
  const isString = typeof children === "string";
  const shouldRenderIcon = iconOnly || isString;
  const Icon = toneIcons[tone];

  const classes = ["badge", toneClassNames[tone], className].filter(Boolean).join(" ");

  const finalTooltip = tooltip || (isString ? (children as string) : undefined);
  const tooltipText = iconOnly ? finalTooltip : tooltip;

  return (
    <span className={classes} data-tooltip={tooltipText} aria-label={finalTooltip || (isString ? (children as string) : undefined)}>
      {shouldRenderIcon ? (
        <span className="badge__icon" aria-hidden="true">
          <HugeiconsIcon icon={Icon} size={14} />
        </span>
      ) : leadingDot ? (
        <span className="badge__dot" aria-hidden="true" />
      ) : null}
      <span className={iconOnly ? "badge__label badge__label--mobile-hidden" : "badge__label"}>{children}</span>
    </span>
  );
}
