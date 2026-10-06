import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles, ShieldAlert } from 'lucide-react';
import { Anomaly } from '../../types/mission';

interface InvestigationHeaderProps {
  anomaly: Anomaly;
  confidence: number;
  reviewed: boolean;
  onMarkReviewed: () => void;
}

export const InvestigationHeader: React.FC<InvestigationHeaderProps> = ({
  anomaly,
  confidence,
  reviewed,
  onMarkReviewed,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1a2842] mb-5">
      {/* Title & Anomaly Metadata */}
      <div>
        <Link
          to="/anomalies"
          className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-mono mb-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Anomalies</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Investigation Workspace
          </h1>
          <span className="text-slate-500">•</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sky-400 text-sm">
              {anomaly.id}
            </span>
            <span className="text-slate-300 font-medium text-sm">
              {anomaly.title}
            </span>
          </div>
        </div>
      </div>

      {/* Status, Confidence & Reviewed Action */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0d1728] border border-[#1e3357] text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              anomaly.status === 'INVESTIGATING'
                ? 'bg-sky-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-slate-400">Status:</span>
          <span className="text-white font-bold">{anomaly.status}</span>
        </div>

        {/* Confidence Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Confidence:</span>
          <span className="text-white font-bold">{confidence.toFixed(2)}</span>
        </div>

        {/* Mark as Reviewed Button */}
        <button
          onClick={onMarkReviewed}
          disabled={reviewed}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
            reviewed
              ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{reviewed ? 'Reviewed & Signed Off' : 'Mark as Reviewed'}</span>
        </button>
      </div>
    </div>
  );
};
