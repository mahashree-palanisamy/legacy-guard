import React from 'react';

interface StatusBadgeProps {
  status: 'verified' | 'review_needed' | 'pending' | 'active' | 'inactive';
}

const styles: Record<string, string> = {
  verified: 'bg-success/10 text-success',
  review_needed: 'bg-warning/10 text-warning',
  pending: 'bg-muted text-muted-foreground',
  active: 'bg-primary/10 text-primary',
  inactive: 'bg-muted text-muted-foreground',
};

const labels: Record<string, string> = {
  verified: 'Verified',
  review_needed: 'Review Needed',
  pending: 'Pending',
  active: 'Active',
  inactive: 'Inactive',
};

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
    {labels[status]}
  </span>
);

export default StatusBadge;
