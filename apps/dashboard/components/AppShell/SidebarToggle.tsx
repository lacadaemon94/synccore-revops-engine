'use client';

import { SidebarLeftIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useSyncExternalStore } from 'react';

import {
  getSidebarServerSnapshot,
  getSidebarSnapshot,
  subscribeSidebar,
  toggleSidebar,
} from './sidebarStore';
import styles from './SidebarToggle.module.css';

export function SidebarToggle() {
  const state = useSyncExternalStore(subscribeSidebar, getSidebarSnapshot, getSidebarServerSnapshot);
  const collapsed = state === 'collapsed';

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggleSidebar}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-pressed={collapsed}
      data-collapsed={collapsed}
    >
      <HugeiconsIcon icon={SidebarLeftIcon} size={14} strokeWidth={1.8} aria-hidden="true" />
    </button>
  );
}
