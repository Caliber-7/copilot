import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anomaly } from '../../types/mission';
import { SeverityBadge } from './SeverityBadge';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface AnomalyTableProps {
  anomalies: Anomaly[];
}

export const AnomalyTable: React.FC<AnomalyTableProps> = ({ anomalies }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(anomalies.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const displayed = anomalies.slice(startIndex, startIndex + pageSize);

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'INVESTIGATING':
        return 'bg-sky-950/80 text-sky-300 border-sky-700/60';
      case 'EVIDENCE_COLLECTED':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      case 'NEW':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'CLOSED':
      case 'RESOLVED':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getInvestigationButton = (status: string, id: string) => {
    switch (status.toUpperCase()) {
      case 'INVESTIGATING':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/investigation/${id}`);
            }}
            className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 flex items-center gap-1 transition-all"
          >
            <span>In Progress</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        );
      case 'EVIDENCE_COLLECTED':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/investigation/${id}`);
            }}
            className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-sky-950/80 hover:bg-sky-800 text-sky-300 border border-sky-700/60 flex items-center gap-1 transition-all"
          >
            <span>In Progress</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        );
      case 'NEW':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/investigation/${id}`);
            }}
            className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-[#16233b] hover:bg-[#203357] text-slate-300 border border-[#23385e] transition-all"
          >
            Not Started
          </button>
        );
      default:
        return (
          <span className="text-xs font-mono text-slate-500 px-2 py-1">Closed</span>
        );
    }
  };

  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#080e1a] text-slate-400 font-mono text-[11px] border-b border-[#1a2842] uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4 font-semibold">ID</th>
              <th className="py-3.5 px-4 font-semibold">Time (UTC)</th>
              <th className="py-3.5 px-4 font-semibold">Subsystem</th>
              <th className="py-3.5 px-4 font-semibold">Severity</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold">Confidence</th>
              <th className="py-3.5 px-4 font-semibold text-right">Investigation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#16233b]">
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  No anomalies match the selected filters.
                </td>
              </tr>
            ) : (
              displayed.map((anom) => (
                <tr
                  key={anom.id}
                  onClick={() => navigate(`/investigation/${anom.id}`)}
                  className="hover:bg-[#111e33] cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-sky-400 group-hover:underline">
                    {anom.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {anom.timestamp}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                    {anom.subsystem}
                  </td>
                  <td className="py-3.5 px-4">
                    <SeverityBadge severity={anom.severity} />
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${getStatusBadge(
                        anom.status
                      )}`}
                    >
                      {anom.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300 font-medium">
                    {anom.confidence ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-emerald-400">{anom.confidence.toFixed(2)}</span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {getInvestigationButton(anom.status, anom.id)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="py-3 px-4 bg-[#080e1a] border-t border-[#1a2842] flex items-center justify-between text-xs text-slate-400 font-mono">
        <div>
          Showing {anomalies.length > 0 ? startIndex + 1 : 0}-
          {Math.min(startIndex + pageSize, anomalies.length)} of {anomalies.length} anomalies
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded bg-[#0f1b2d] border border-[#1e2f4f] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#162744]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-6 h-6 rounded text-xs flex items-center justify-center font-mono ${
                currentPage === i + 1
                  ? 'bg-sky-600 text-white font-bold'
                  : 'bg-[#0f1b2d] border border-[#1e2f4f] text-slate-300 hover:bg-[#162744]'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded bg-[#0f1b2d] border border-[#1e2f4f] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#162744]"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
