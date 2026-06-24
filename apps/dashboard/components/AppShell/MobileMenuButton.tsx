'use client';

import { Menu01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { toggleMobileSidebar } from './sidebarStore';
import styles from './MobileMenuButton.module.css';

export function MobileMenuButton() {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggleMobileSidebar}
      aria-label="Open navigation"
    >
      <HugeiconsIcon icon={Menu01Icon} size={18} strokeWidth={1.8} aria-hidden="true" />
    </button>
  );
}
