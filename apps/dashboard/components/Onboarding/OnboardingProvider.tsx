'use client';

import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  getAllTours,
  getTourForRoute,
  ONBOARDING_GLOBAL_KEY,
  onboardingRouteKey,
  type OnboardingStep,
  type OnboardingTour,
} from '@/lib/onboarding';

import { OnboardingOverlay } from './OnboardingOverlay';

interface OnboardingContextValue {
  open: boolean;
  tour: OnboardingTour | null;
  stepIndex: number;
  totalSteps: number;
  currentStep: OnboardingStep | null;
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  finish: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const tour = useMemo(() => getTourForRoute(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1); // -1 => intro card
  const autoLaunchedRef = useRef<Set<string>>(new Set());

  // Auto-launch when arriving at a route whose tour hasn't been completed yet.
  useEffect(() => {
    if (!tour) return;
    if (autoLaunchedRef.current.has(tour.route)) return;
    const routeDone = safeGet(onboardingRouteKey(tour.route));
    if (routeDone) return;
    autoLaunchedRef.current.add(tour.route);
    const t = window.setTimeout(() => {
      setStepIndex(-1);
      setOpen(true);
    }, 400);
    return () => window.clearTimeout(t);
  }, [tour]);

  const total = tour?.steps.length ?? 0;

  const start = useCallback(() => {
    if (!tour) return;
    setStepIndex(-1);
    setOpen(true);
  }, [tour]);

  const closeAndMark = useCallback(() => {
    setOpen(false);
    if (tour) safeSet(onboardingRouteKey(tour.route), '1');
    // Only mark the global "completed" key once every route's tour has been finished/skipped.
    const allDone = getAllTours().every((t) => safeGet(onboardingRouteKey(t.route)) === '1');
    if (allDone) safeSet(ONBOARDING_GLOBAL_KEY, '1');
  }, [tour]);

  const next = useCallback(() => {
    setStepIndex((idx) => {
      if (!tour) return idx;
      if (idx + 1 >= tour.steps.length) {
        closeAndMark();
        return idx;
      }
      return idx + 1;
    });
  }, [tour, closeAndMark]);

  const prev = useCallback(() => {
    setStepIndex((idx) => (idx <= -1 ? -1 : idx - 1));
  }, []);

  const skip = useCallback(() => closeAndMark(), [closeAndMark]);
  const finish = useCallback(() => closeAndMark(), [closeAndMark]);

  // Keyboard: Escape closes, ArrowRight/Enter next, ArrowLeft prev.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        skip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, next, prev, skip]);

  const currentStep: OnboardingStep | null = useMemo(() => {
    if (!tour) return null;
    if (stepIndex === -1) return tour.intro;
    return tour.steps[stepIndex] ?? null;
  }, [tour, stepIndex]);

  const value: OnboardingContextValue = {
    open,
    tour,
    stepIndex,
    totalSteps: total,
    currentStep,
    start,
    next,
    prev,
    skip,
    finish,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      <OnboardingOverlay />
    </OnboardingContext.Provider>
  );
}
