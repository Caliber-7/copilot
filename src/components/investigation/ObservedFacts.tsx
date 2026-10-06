import React from 'react';
import { ObservedFact } from '../../types/mission';
import { Shield, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ObservedFactsProps {
  facts: ObservedFact[];
}

export const ObservedFacts: React.FC<ObservedFactsProps> = ({ facts }) => {
  const getDirectionIcon = (dir?: string) => {
    if (dir === 'up') return <ArrowUp className="w-3 h-3 text-rose-400 inline" />;
    if (dir === 'down') return <ArrowDown className="w-3 h-3 text-sky-400 inline" />;
    return <Minus className="w-3 h-3 text-slate-500 inline" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-rose-400 border-l-rose-500';
      case 'warning':
        return 'text-amber-400 border-l-amber-500';
      default:
        return 'text-emerald-400 border-l-emerald-500';
    }
  };

  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Observed Facts</h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60 uppercase font-semibold">
          Hardware Verified Telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {facts.map((fact) => (
          <div
            key={fact.id}
            className={`p-3 rounded bg-[#09101c] border border-[#17253d] border-l-4 ${getStatusColor(
              fact.status
            )}`}
          >
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>{fact.parameter}</span>
              {getDirectionIcon(fact.direction)}
            </div>
            <div className="text-base font-mono font-bold text-white mt-1">
              {fact.value}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{fact.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
