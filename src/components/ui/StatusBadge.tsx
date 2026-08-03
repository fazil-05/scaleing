// src/components/ui/StatusBadge.tsx
// Unified status badge component

import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'xs' | 'sm' | 'md';
}

const statusLabels: Record<string, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  half_day: 'Half Day',
  leave: 'On Leave',
  holiday: 'Holiday',
  weekend: 'Weekend',
  work_from_home: 'WFH',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  active: 'Active',
  inactive: 'Inactive',
  terminated: 'Terminated',
  on_leave: 'On Leave',
  completed: 'Completed',
  in_progress: 'In Progress',
  assigned: 'Assigned',
  blocked: 'Blocked',
  reopened: 'Reopened',
  submitted: 'Submitted',
  reviewed: 'Reviewed',
  flagged: 'Flagged',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
  planning: 'Planning',
  on_hold: 'On Hold',
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  intern: 'Intern',
  probation: 'Probation',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const label = statusLabels[status] || status.replace(/_/g, ' ');
  const sizeClass = size === 'xs' ? 'text-[10px] px-2 py-0.5' : size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span className={`badge badge-${status} ${sizeClass} capitalize`}>
      {label}
    </span>
  );
};
