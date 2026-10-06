import React from 'react';
import { Bot, Sparkles, HelpCircle } from 'lucide-react';

interface PossibleCausesProps {
  possibleExplanation: string;
  aiExplanationDetail: string;
  hypotheses: Array<{ cause: string; probability: number; rationale: string }>;
  onAskCopilot?: () => void;
}

export const PossibleCauses: React.FC<PossibleCausesProps> = ({
  possibleExplanation,
  aiExplanationDetail,
  hypotheses,
  onAskCopilot,
}) => {
  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Possible Explanation</h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 uppercase font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          AI Analysis • Inferred
        </span>
      </div>

      {/* Main Narrative */}
      <div className="p-3.5 rounded-lg bg-[#0a101d] border border-purple-900/30 text-xs text-slate-200 leading-relaxed mb-4">
        <p className="font-medium text-slate-100">{possibleExplanation}</p>
        <p className="mt-2 text-slate-400 text-[11px]">{aiExplanationDetail}</p>
      </div>

      {/* Hypotheses Ranked List */}
      <div>
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
          Ranked Root Cause Hypotheses
        </div>
        <div className="space-y-2">
          {hypotheses.map((hyp, index) => (
            <div
              key={index}
              className="p-2.5 rounded bg-[#09101c] border border-[#16233b] text-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-slate-200">{hyp.cause}</span>
                <span className="font-mono font-bold text-xs text-purple-400">
                  {Math.round(hyp.probability * 100)}%
                </span>
              </div>
              <div className="w-full bg-[#141f33] h-1.5 rounded-full overflow-hidden mb-1.5">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full"
                  style={{ width: `${hyp.probability * 100}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400">{hyp.rationale}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
