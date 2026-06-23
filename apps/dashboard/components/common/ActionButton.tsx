"use client";

import { useTransition } from "react";
import styles from "./ActionButton.module.css";

interface ActionButtonProps {
  onClick: () => Promise<void>;
  label: string;
  variant: "primary" | "danger" | "ghost";
  disabled?: boolean;
}

export function ActionButton({
  onClick,
  label,
  variant,
  disabled = false
}: ActionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const isLoading = isPending;
  const isDisabledState = disabled || isLoading;

  function handleClick() {
    startTransition(async () => {
      await onClick();
    });
  }

  return (
    <button
      type="button"
      className={[styles.button, styles[variant]].filter(Boolean).join(" ")}
      onClick={handleClick}
      disabled={isDisabledState}
      aria-busy={isLoading}
    >
      {isLoading && (
        <span className={styles.spinner} aria-hidden="true" />
      )}
      <span className={styles.label}>{label}</span>
    </button>
  );
}
