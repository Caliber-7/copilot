import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Severity } from '../../types/mission';

interface SeverityBadgeProps {
  severity: Severity | string;
  showIcon?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  showIcon = true,
}) => {
  const norm = severity.toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = Info;

  if (norm === 'CRITICAL' || norm === 'HIGH') {
    colorClasses = 'bg-rose-950/80 text-rose-300 border-rose-700/60';
    Icon = AlertCircle;
  } else if (norm === 'WARNING' || norm === 'MEDIUM') {
    colorClasses = 'bg-amber-950/80 text-amber-300 border-amber-700/60';
    Icon = AlertTriangle;
  } else if (norm === 'LOW' || norm === 'INFO') {
    colorClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    Icon = Info;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-wide uppercase border ${colorClasses}`}
    >
      {showIcon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{severity}</span>
    </span>
  );
};
