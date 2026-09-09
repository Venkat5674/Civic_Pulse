import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function SeverityBadge({ severity = 'MEDIUM', size = 'md' }) {
  const config = {
    LOW: {
      label: 'Low Severity',
      variant: 'neutral',
      icon: <Info className="w-3.5 h-3.5" />,
    },
    MEDIUM: {
      label: 'Medium Severity',
      variant: 'warning',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    HIGH: {
      label: 'High Severity',
      variant: 'warning',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />,
    },
    CRITICAL: {
      label: 'Critical Severity',
      variant: 'danger',
      icon: <AlertOctagon className="w-3.5 h-3.5" />,
    },
  };

  const item = config[severity.toUpperCase()] || config.MEDIUM;

  return (
    <Badge variant={item.variant} size={size} icon={item.icon}>
      {item.label}
    </Badge>
  );
}
