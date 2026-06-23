'use client';

import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { LayoutGroup, motion } from 'motion/react';
import { useSyncExternalStore } from 'react';

import styles from './ThemeToggle.module.css';

type Theme = 'light' | 'dark';

function subscribe(callback: () => void) {
  window.addEventListener('themechange', callback);
  return () => {
    window.removeEventListener('themechange', callback);
  };
}

function getSnapshot(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function getServerSnapshot(): Theme {
  return 'dark';
}

function setTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  document.cookie = `theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent('themechange'));
}

const SEGMENTS: { value: Theme; icon: typeof Moon02Icon; label: string }[] = [
  { value: 'dark', icon: Moon02Icon, label: 'Dark theme' },
  { value: 'light', icon: Sun03Icon, label: 'Light theme' },
];

export function ThemeToggle() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <LayoutGroup id="theme-toggle">
      <div className={styles.track} role="radiogroup" aria-label="Theme">
        {SEGMENTS.map(({ value, icon, label }) => {
          const active = current === value;
          return (
            <button
              key={value}
              type="button"
              className={styles.segment}
              data-active={active}
              onClick={() => setTheme(value)}
              role="radio"
              aria-checked={active}
              aria-label={label}
            >
              {active && (
                <motion.span
                  layoutId="theme-indicator"
                  className={styles.indicator}
                  transition={{ type: 'spring', stiffness: 480, damping: 36, mass: 0.5 }}
                  aria-hidden="true"
                />
              )}
              <span className={styles.iconWrap}>
                <HugeiconsIcon icon={icon} size={14} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
