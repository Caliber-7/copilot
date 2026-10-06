import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { Anomaly } from '../../types/mission';

interface InvestigationQueueProps {
  anomalies: Anomaly[];
}

export const InvestigationQueue: React.FC<InvestigationQueueProps> = ({ anomalies }) => {
  const navigate = useNavigate();
  // Filter active/open or priority anomalies
  const queue = anomalies
    .filter((a) => a.status === 'INVESTIGATING' || a.status === 'NEW' || a.status === 'EVIDENCE_COLLECTED')
    .slice(0, 3);

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      case 'MEDIUM':
      case 'WARNING':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      default:
        return 'bg-sky-950/80 text-sky-300 border-sky-700/60';
    }
  };

  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-5 shadow-md mt-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Investigation Queue</h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
            {queue.length} Active
          </span>
        </div>
        <Link
          to="/anomalies"
          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-3">
        {queue.map((item, index) => (
          <div
            key={item.id}
            onClick={() => navigate(`/investigation/${item.id}`)}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-[#09101c] hover:bg-[#121f36] border border-[#17253d] hover:border-sky-500/40 cursor-pointer transition-all gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-6 h-6 rounded-full bg-[#162744] text-slate-300 font-mono text-xs flex items-center justify-center font-bold border border-[#233f6b] flex-shrink-0">
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sky-400 text-xs">
                    {item.id}
                  </span>
                  <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors truncate">
                    {item.title}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-slate-300 font-semibold">
                    {item.subsystem}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="truncate">{item.description}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
              <span className="font-mono text-xs text-slate-400">{item.timestamp}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getSeverityBadge(
                  item.severity
                )}`}
              >
                {item.severity}
              </span>
              <button
                type="button"
                className="px-3 py-1 rounded bg-[#172c4e] hover:bg-sky-600 text-sky-200 hover:text-white text-xs font-medium flex items-center gap-1 transition-all group-hover:bg-sky-600 group-hover:text-white"
              >
                <span>Investigate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
