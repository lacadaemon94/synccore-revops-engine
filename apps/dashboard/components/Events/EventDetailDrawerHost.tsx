'use client';

import { useRouter } from 'next/navigation';
import { EventDetailDrawer } from './EventDetailDrawer';
import { EventDetail } from './local';

interface EventDetailDrawerHostProps {
  selectedEventId: string | null;
  selectedDetail: EventDetail | null;
  statusFilter: string;
  sourceFilter: string;
}

export function EventDetailDrawerHost({
  selectedEventId,
  selectedDetail,
  statusFilter,
  sourceFilter,
}: EventDetailDrawerHostProps) {
  const router = useRouter();

  const handleClose = () => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') {
      params.set('status', statusFilter);
    }
    if (sourceFilter && sourceFilter !== 'all') {
      params.set('source', sourceFilter);
    }

    const href = `/events${params.toString() ? '?' + params.toString() : ''}`;
    router.push(href);
  };

  return (
    <EventDetailDrawer
      detail={selectedDetail}
      open={!!selectedEventId}
      onClose={handleClose}
      statusFilter={statusFilter}
      sourceFilter={sourceFilter}
    />
  );
}
