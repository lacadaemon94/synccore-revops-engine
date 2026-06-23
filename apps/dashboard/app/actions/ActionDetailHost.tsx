'use client';

import { ActionDetailPanel } from '@/components/Actions/ActionDetailPanel';
import type { ActionDetail, ActionAssignee } from '@/components/Actions/local';

const noop = () => {};
const asyncNoop = () => Promise.resolve();

interface ActionDetailHostProps {
  action: ActionDetail | null;
  assigneeOptions: ActionAssignee[];
}

export function ActionDetailHost({
  action,
  assigneeOptions,
}: ActionDetailHostProps) {
  return (
    <ActionDetailPanel
      action={action}
      onClose={noop}
      onSnooze={asyncNoop}
      onResolve={asyncNoop}
      assigneeOptions={assigneeOptions}
      onAssigneeChange={noop}
    />
  );
}
