'use client';

export type SidebarState = 'expanded' | 'collapsed';

const EVENT = 'sidebarchange';
const MOBILE_EVENT = 'sidebarmobilechange';

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

// ============ Mobile drawer state ============
export function subscribeMobileSidebar(callback: () => void) {
  window.addEventListener(MOBILE_EVENT, callback);
  return () => {
    window.removeEventListener(MOBILE_EVENT, callback);
  };
}

export function getMobileSidebarSnapshot(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.sidebarMobile === 'open';
}

export function getMobileSidebarServerSnapshot(): boolean {
  return false;
}

export function setMobileSidebarOpen(open: boolean) {
  if (open) {
    document.documentElement.dataset.sidebarMobile = 'open';
  } else {
    delete document.documentElement.dataset.sidebarMobile;
  }
  window.dispatchEvent(new CustomEvent(MOBILE_EVENT));
}

export function toggleMobileSidebar() {
  setMobileSidebarOpen(!getMobileSidebarSnapshot());
}
