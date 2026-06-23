import type { PipelineStage } from '@/components/Dashboard/local';

/**
 * Pipeline stage fixtures for the "Today's pipeline" strip.
 * Data represents events since 00:00 UTC with clickable drill-down.
 */

export const pipelineStages: PipelineStage[] = [
  {
    id: 'ingested',
    title: 'Ingested',
    count: 2481,
    sources: ['stripe', 'n8n', 'netsuite'],
    bars: [
      { width: 100, opacity: 1 },
      { width: 100, opacity: 0.6 },
      { width: 100, opacity: 0.35 },
      { width: 100, opacity: 0 },
      { width: 100, opacity: 0 },
    ],
    href: '/events',
    borderColor: 'fg',
  },
  {
    id: 'normalized',
    title: 'Normalized',
    count: 2468,
    subtitle: '99.5%',
    details: '13 rejected · schema',
    bars: [
      { width: 100, opacity: 1 },
      { width: 100, opacity: 0.6 },
      { width: 100, opacity: 0.4 },
      { width: 100, opacity: 0.22 },
      { width: 100, opacity: 0 },
    ],
    href: '/events',
    borderColor: 'fg',
  },
  {
    id: 'drift',
    title: 'Drift detected',
    count: 37,
    details: '22 MRR · 8 plan · 7 owner',
    bars: [
      { width: 100, opacity: 1 },
      { width: 100, opacity: 0.7 },
      { width: 100, opacity: 0.45 },
      { width: 100, opacity: 0 },
      { width: 100, opacity: 0 },
    ],
    href: '/reconciler',
    borderColor: 'warn',
  },
  {
    id: 'action-open',
    title: 'Action open',
    count: 12,
    subtitle: '3 critical',
    details: '$248k exposure',
    bars: [
      { width: 100, opacity: 1 },
      { width: 100, opacity: 0.7 },
      { width: 100, opacity: 0.5 },
      { width: 100, opacity: 0.3 },
      { width: 100, opacity: 0 },
    ],
    href: '/actions',
    borderColor: 'critical',
  },
  {
    id: 'resolved',
    title: 'Resolved · 24h',
    count: 31,
    details: '$86k recovered',
    bars: [
      { width: 100, opacity: 1 },
      { width: 100, opacity: 0.75 },
      { width: 100, opacity: 0.55 },
      { width: 100, opacity: 0.35 },
      { width: 100, opacity: 0.18 },
    ],
    href: '/queue',
    borderColor: 'success',
  },
];
