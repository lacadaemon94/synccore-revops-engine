'use client';

export type SidebarState = 'expanded' | 'collapsed';

const EVENT = 'sidebarchange';

export function subscribeSidebar(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener(EVENT, callback);
  };
}

export function getSidebarSnapshot(): SidebarState {
  if (typeof document === 'undefined') return 'expanded';
  return document.documentElement.dataset.sidebar === 'collapsed' ? 'collapsed' : 'expanded';
}

export function getSidebarServerSnapshot(): SidebarState {
  return 'expanded';
}

export function setSidebarState(next: SidebarState) {
  document.documentElement.dataset.sidebar = next;
  document.cookie = `sidebar=${next}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function toggleSidebar() {
  setSidebarState(getSidebarSnapshot() === 'collapsed' ? 'expanded' : 'collapsed');
}
