'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { useOnboarding } from './OnboardingProvider';
import styles from './OnboardingOverlay.module.css';

const TARGET_PADDING = 8;
const CARD_GAP = 16;
const CARD_WIDTH = 360;
const CARD_HEIGHT_ESTIMATE = 220;
const VIEWPORT_PADDING = 16;

const subscribeNoop = () => () => {};
const getClient = () => true;
const getServer = () => false;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

type CardPlacement = 'below' | 'above' | 'center';

interface CardPosition {
  top: number;
  left: number;
  placement: CardPlacement;
}

function readTargetRect(targetId: string | undefined): Rect | null {
  if (!targetId || typeof document === 'undefined') return null;
  const el = document.querySelector<HTMLElement>(`[data-tour-id="${targetId}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  return {
    top: r.top - TARGET_PADDING,
    left: r.left - TARGET_PADDING,
    width: r.width + TARGET_PADDING * 2,
    height: r.height + TARGET_PADDING * 2,
  };
}

function computeCardPosition(rect: Rect | null): CardPosition {
  if (typeof window === 'undefined' || !rect) {
    return { top: 0, left: 0, placement: 'center' };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceBelow = vh - (rect.top + rect.height);
  const spaceAbove = rect.top;

  let placement: CardPlacement = 'below';
  let top: number;
  if (spaceBelow >= CARD_HEIGHT_ESTIMATE + CARD_GAP) {
    placement = 'below';
    top = rect.top + rect.height + CARD_GAP;
  } else if (spaceAbove >= CARD_HEIGHT_ESTIMATE + CARD_GAP) {
    placement = 'above';
    top = rect.top - CARD_HEIGHT_ESTIMATE - CARD_GAP;
  } else {
    placement = 'center';
    top = Math.max(VIEWPORT_PADDING, (vh - CARD_HEIGHT_ESTIMATE) / 2);
  }

  let left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
  left = Math.min(Math.max(left, VIEWPORT_PADDING), vw - CARD_WIDTH - VIEWPORT_PADDING);
  if (placement === 'center') {
    left = Math.max(VIEWPORT_PADDING, (vw - CARD_WIDTH) / 2);
  }

  return { top, left, placement };
}

export function OnboardingOverlay() {
  const { open, tour, stepIndex, totalSteps, currentStep, next, prev, skip, finish } = useOnboarding();
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(subscribeNoop, getClient, getServer);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardPos, setCardPos] = useState<CardPosition>({ top: 0, left: 0, placement: 'center' });
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Recompute target rect & card position whenever the step changes or window resizes.
  useLayoutEffect(() => {
    if (!open || !currentStep) return;
    let raf = 0;
    const update = () => {
      const next = readTargetRect(currentStep.target);
      setRect(next);
      setCardPos(computeCardPosition(next));
    };
    update();
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
      cancelAnimationFrame(raf);
    };
  }, [open, currentStep]);

  // Scroll the target into view (smooth) when it changes.
  useEffect(() => {
    if (!open || !currentStep?.target) return;
    const el = document.querySelector<HTMLElement>(`[data-tour-id="${currentStep.target}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }, [open, currentStep, reduceMotion]);

  // Focus the card when it opens / step changes for accessibility.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => cardRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open, stepIndex]);

  if (!mounted) return null;

  const isIntro = stepIndex === -1;
  const isLastStep = stepIndex >= totalSteps - 1;
  const positionLabel = isIntro
    ? totalSteps > 0
      ? `Intro · ${totalSteps} steps`
      : 'Intro'
    : `${stepIndex + 1} of ${totalSteps}`;

  const placement = rect ? cardPos.placement : 'center';
  const targetVisible = rect !== null && placement !== 'center';

  const motionDuration = reduceMotion ? 0 : 0.22;
  const spotlightTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 360, damping: 32, mass: 0.5 };

  const cardX = rect ? cardPos.left : 0;
  const cardY = rect ? cardPos.top : 0;

  return createPortal(
    <AnimatePresence>
      {open && tour && currentStep && (
        <motion.div
          className={styles.root}
          role="dialog"
          aria-modal="true"
          aria-label={`Onboarding tour: ${tour.label}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionDuration }}
        >
          {/* Dim layer — either a full-screen dimmer (centered card) or a spotlight cut-out via box-shadow */}
          {targetVisible && rect ? (
            <motion.div
              key="spotlight"
              className={styles.spotlight}
              initial={false}
              animate={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
              }}
              transition={spotlightTransition}
              aria-hidden="true"
            >
              {!reduceMotion && <span className={styles.pulseRing} aria-hidden="true" />}
            </motion.div>
          ) : (
            <div className={styles.dimFull} aria-hidden="true" />
          )}

          {/* Click-outside / backdrop dismiss is intentional but limited to the dim layer to avoid trapping */}
          <button
            type="button"
            className={styles.backdropDismiss}
            onClick={skip}
            aria-label="Dismiss tour"
            tabIndex={-1}
          />

          <motion.div
            ref={cardRef}
            tabIndex={-1}
            key={currentStep.id}
            className={styles.card}
            data-placement={placement}
            style={
              placement === 'center'
                ? undefined
                : { top: cardY, left: cardX, width: CARD_WIDTH }
            }
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: motionDuration }}
          >
            <div className={styles.cardHead}>
              <span className={styles.tourLabel}>{tour.label}</span>
              <span className={styles.stepLabel}>{positionLabel}</span>
            </div>
            <h2 className={styles.title}>{currentStep.title}</h2>
            <p className={styles.body}>{currentStep.body}</p>
            {currentStep.benefit && <p className={styles.benefit}>{currentStep.benefit}</p>}

            {totalSteps > 0 && (
              <div className={styles.progressTrack} aria-hidden="true">
                <motion.div
                  className={styles.progressFill}
                  initial={false}
                  animate={{
                    width: `${
                      isIntro ? 0 : ((stepIndex + 1) / totalSteps) * 100
                    }%`,
                  }}
                  transition={{ duration: motionDuration }}
                />
              </div>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.linkButton} onClick={skip}>
                Skip tour
              </button>
              <div className={styles.navButtons}>
                {!isIntro && (
                  <button type="button" className={styles.secondaryButton} onClick={prev}>
                    Back
                  </button>
                )}
                {isIntro ? (
                  <button type="button" className={styles.primaryButton} onClick={next}>
                    {totalSteps > 0 ? 'Start tour' : 'Got it'}
                  </button>
                ) : isLastStep ? (
                  <button type="button" className={styles.primaryButton} onClick={finish}>
                    Finish
                  </button>
                ) : (
                  <button type="button" className={styles.primaryButton} onClick={next}>
                    Next
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
