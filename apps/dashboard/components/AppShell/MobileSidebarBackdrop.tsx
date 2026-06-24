'use client';

import { useSyncExternalStore } from 'react';

import {
  getMobileSidebarServerSnapshot,
  getMobileSidebarSnapshot,
  setMobileSidebarOpen,
  subscribeMobileSidebar,
} from './sidebarStore';
import styles from './MobileSidebarBackdrop.module.css';

export function MobileSidebarBackdrop() {
  const open = useSyncExternalStore(
    subscribeMobileSidebar,
    getMobileSidebarSnapshot,
    getMobileSidebarServerSnapshot,
  );

  if (!open) return null;
  return (
    <button
      type="button"
      className={styles.backdrop}
      onClick={() => setMobileSidebarOpen(false)}
      aria-label="Close navigation"
      tabIndex={-1}
    />
  );
}
