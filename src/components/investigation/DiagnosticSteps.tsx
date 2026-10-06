import React from 'react';
import { DiagnosticStep } from '../../types/mission';
import { CheckCircle2, Circle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DiagnosticStepsProps {
  steps: DiagnosticStep[];
  onToggleStep?: (stepNumber: number) => void;
}

export const DiagnosticSteps: React.FC<DiagnosticStepsProps> = ({
  steps,
  onToggleStep,
}) => {
  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            Recommended Diagnostic Steps
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          Advisory Only • Non-Executing
        </span>
      </div>

      <div className="space-y-2.5">
        {steps.map((step) => {
          const isDone = step.status === 'COMPLETED';
          const isInProgress = step.status === 'IN_PROGRESS';

          return (
            <div
              key={step.stepNumber}
              onClick={() => onToggleStep && onToggleStep(step.stepNumber)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                isDone
                  ? 'bg-[#09111c]/60 border-[#1a2842] opacity-75'
                  : isInProgress
                  ? 'bg-[#0e1b30] border-sky-600/50 shadow-sm shadow-sky-950/40'
                  : 'bg-[#09101c] border-[#17253d] hover:border-[#223759]'
              }`}
            >
              <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                <span className="font-mono text-xs font-bold text-sky-400">
                  {String(step.stepNumber).padStart(2, '0')}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle
                    className={`w-4 h-4 ${
                      isInProgress ? 'text-sky-400 fill-sky-400/20' : 'text-slate-500'
                    }`}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-xs font-semibold ${
                    isDone ? 'text-slate-400 line-through' : 'text-white'
                  }`}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-[11px] text-slate-400 mt-1 leading-normal">
                    {step.description}
                  </div>
                )}
                {step.procedureRef && (
                  <div className="mt-2">
                    <Link
                      to="/procedures"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-400 hover:text-sky-300 font-semibold underline"
                    >
                      <span>Open SOP-OPS-{step.procedureRef}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
