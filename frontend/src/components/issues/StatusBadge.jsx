import React from 'react';
import { AlertCircle, Clock, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function StatusBadge({ status = 'OPEN', size = 'md' }) {
  const config = {
    OPEN: {
      label: 'Open',
      variant: 'info',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      variant: 'warning',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      variant: 'purple',
      icon: <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />,
    },
    RESOLVED: {
      label: 'Resolved',
      variant: 'success',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    REJECTED: {
      label: 'Rejected',
      variant: 'danger',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  const item = config[status.toUpperCase()] || config.OPEN;

  return (
    <Badge variant={item.variant} size={size} icon={item.icon}>
      {item.label}
    </Badge>
  );
}
