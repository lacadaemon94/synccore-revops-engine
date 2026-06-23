'use client';

import { HelpCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useOnboarding } from './OnboardingProvider';
import styles from './TourButton.module.css';

export function TourButton() {
  const { tour, start } = useOnboarding();

  if (!tour) return null;

  return (
    <button
      type="button"
      className={styles.button}
      onClick={start}
      aria-label={`Show ${tour.label} tour`}
      title={`Tour: ${tour.label}`}
    >
      <HugeiconsIcon icon={HelpCircleIcon} size={14} strokeWidth={1.8} aria-hidden="true" />
      <span className={styles.label}>Tour</span>
    </button>
  );
}
