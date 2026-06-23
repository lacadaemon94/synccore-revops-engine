'use client';

import { usePathname } from 'next/navigation';

import { IngestSparkline } from './IngestSparkline';
import { SourcesReconciled } from './SourcesReconciled';
import { WorkersPanel } from './WorkersPanel';

export function SidebarContext() {
  const pathname = usePathname();

  if (pathname === '/events' || pathname.startsWith('/events/')) {
    return <IngestSparkline />;
  }

  if (pathname === '/reconciler' || pathname.startsWith('/reconciler/')) {
    return <SourcesReconciled />;
  }

  if (pathname === '/queue' || pathname.startsWith('/queue/')) {
    return <WorkersPanel />;
  }

  return null;
}
