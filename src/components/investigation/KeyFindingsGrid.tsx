import React from 'react';
import { Eye, Brain, Lightbulb, FolderSearch, CheckSquare } from 'lucide-react';

interface KeyFindingsGridProps {
  findingsCount: {
    observedFacts: number;
    inferences: number;
    recommendations: number;
    evidence: number;
  };
}

export const KeyFindingsGrid: React.FC<KeyFindingsGridProps> = ({ findingsCount }) => {
  const cards = [
    {
      label: 'Observed Facts',
      count: findingsCount.observedFacts,
      icon: Eye,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/50 border-sky-800/40',
    },
    {
      label: 'Inferences',
      count: findingsCount.inferences,
      icon: Brain,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/50 border-purple-800/40',
    },
    {
      label: 'Recommendations',
      count: findingsCount.recommendations,
      icon: Lightbulb,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/50 border-emerald-800/40',
    },
    {
      label: 'Evidence',
      count: findingsCount.evidence,
      icon: FolderSearch,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/50 border-cyan-800/40',
    },
  ];

  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-4 shadow-md mb-6">
      <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 font-semibold">
        Key Findings
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-3 rounded-lg border flex items-center gap-3 ${card.bgColor}`}
            >
              <div className={`p-2 rounded-md bg-[#0a101d] ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg font-bold text-white font-mono leading-none">
                  {card.count}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
