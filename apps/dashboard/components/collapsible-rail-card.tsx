"use client";

import { ChevronDownIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import type { ReactNode } from "react";

export function CollapsibleRailCard({
  children,
  defaultOpen = true,
  eyebrow,
  title
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  eyebrow: string;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="rail-card rail-card--collapsible">
      <button type="button" className="rail-card__toggle" aria-expanded={isOpen} onClick={() => setIsOpen((current) => !current)}>
        <span className="rail-card__heading">
          <span className="rail-card__eyebrow">{eyebrow}</span>
          <span className="rail-card__title">{title}</span>
        </span>
        <HugeiconsIcon className="rail-card__chevron" icon={ChevronDownIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <div className="rail-card__body" hidden={!isOpen}>
        {children}
      </div>
    </section>
  );
}
