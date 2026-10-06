import React from 'react';
import { SubsystemStatus } from '../../types/mission';
import { Activity, Zap, Thermometer, Radio, Compass, ShieldAlert } from 'lucide-react';

interface SubsystemCardProps {
  subsystem: SubsystemStatus;
}

export const SubsystemCard: React.FC<SubsystemCardProps> = ({ subsystem }) => {
  const getSubsystemIcon = (name: string) => {
    switch (name.toUpperCase()) {
      case 'POWER':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'THERMAL':
        return <Thermometer className="w-4 h-4 text-rose-400" />;
      case 'COMMUNICATION':
      case 'COMM':
        return <Radio className="w-4 h-4 text-sky-400" />;
      case 'ATTITUDE':
        return <Compass className="w-4 h-4 text-indigo-400" />;
      default:
        return <Activity className="w-4 h-4 text-emerald-400" />;
    }
  };

  const isWarning = subsystem.status === 'WARNING';
  const isCritical = subsystem.status === 'CRITICAL';

  return (
    <div
      className={`bg-[#0c1524] rounded-lg p-4 border transition-all ${
        isCritical
          ? 'border-rose-600/50 shadow-rose-950/20'
          : isWarning
          ? 'border-amber-600/50 shadow-amber-950/20'
          : 'border-[#1a2842] hover:border-[#28416d]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-3">
        <div className="flex items-center gap-2">
          {getSubsystemIcon(subsystem.name)}
          <span className="font-bold text-xs tracking-wider text-white">
            {subsystem.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold">
          <span
            className={`w-2 h-2 rounded-full ${
              isCritical
                ? 'bg-rose-500 animate-ping'
                : isWarning
                ? 'bg-amber-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span
            className={
              isCritical
                ? 'text-rose-400'
                : isWarning
                ? 'text-amber-400'
                : 'text-emerald-400'
            }
          >
            ● {subsystem.status}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{subsystem.primaryParameter}</span>
          <span className="font-mono font-bold text-white text-sm">
            {subsystem.primaryValue}
          </span>
        </div>

        {subsystem.secondaryParameter && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{subsystem.secondaryParameter}</span>
            <span className="font-mono font-medium text-slate-200">
              {subsystem.secondaryValue}
            </span>
          </div>
        )}

        {subsystem.trend && (
          <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
            <span className="text-slate-500">Trend</span>
            <span
              className={
                isWarning || isCritical ? 'text-amber-400 font-semibold' : 'text-slate-400'
              }
            >
              {subsystem.trend}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-[#141f33] text-[10px] text-slate-500 font-mono">
          <span>Updated</span>
          <span>{subsystem.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
};
