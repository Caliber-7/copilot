import React, { useState } from 'react';
import { TimelineEvent } from '../../types/mission';
import { Clock, Filter, Activity, FileText, Bot, Shield, Database, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IncidentTimelineProps {
  events: TimelineEvent[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ events }) => {
  const navigate = useNavigate();
  const [sourceFilter, setSourceFilter] = useState('ALL');

  const filtered =
    sourceFilter === 'ALL'
      ? events
      : events.filter((e) => e.source.toUpperCase() === sourceFilter.toUpperCase());

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'telemetry':
        return <Activity className="w-3.5 h-3.5 text-sky-400" />;
      case 'log':
      case 'fdir':
        return <FileText className="w-3.5 h-3.5 text-rose-400" />;
      case 'rag':
        return <Database className="w-3.5 h-3.5 text-purple-400" />;
      case 'ai copilot':
        return <Bot className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source.toLowerCase()) {
      case 'telemetry':
        return 'bg-sky-950/80 text-sky-300 border-sky-700/60';
      case 'log':
      case 'fdir':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      case 'rag':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      case 'ai copilot':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    }
  };

  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-5 shadow-md">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#16233b] mb-5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Incident Chronology
            </h2>
            <p className="text-[11px] text-slate-400">
              Correlated temporal event stream (UTC)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-[#09101c] border border-[#1e2f4f] text-slate-300 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="ALL">All Sources</option>
            <option value="TELEMETRY">Telemetry</option>
            <option value="LOG">Logs</option>
            <option value="FDIR">FDIR</option>
            <option value="RAG">RAG Retrieval</option>
            <option value="AI COPILOT">AI Copilot</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream Table / Cards */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#080e1a] text-slate-400 font-mono text-[11px] border-b border-[#1a2842] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-semibold">Time (UTC)</th>
              <th className="py-3 px-4 font-semibold">Event</th>
              <th className="py-3 px-4 font-semibold">Source</th>
              <th className="py-3 px-4 font-semibold">Subsystem</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#16233b]">
            {filtered.map((item, index) => (
              <tr
                key={item.id}
                className="hover:bg-[#111e33] transition-colors group cursor-pointer"
                onClick={() => {
                  if (item.relatedEvidenceId) {
                    navigate(`/evidence/${item.relatedEvidenceId}`);
                  }
                }}
              >
                <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>{item.timestamp}</span>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="font-medium text-slate-100 group-hover:text-sky-300 transition-colors">
                    {item.description}
                  </div>
                  {item.details && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.details}
                    </div>
                  )}
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${getSourceBadge(
                      item.source
                    )}`}
                  >
                    {getSourceIcon(item.source)}
                    <span>{item.source}</span>
                  </span>
                </td>

                <td className="py-3 px-4 font-mono font-semibold text-slate-300 whitespace-nowrap">
                  {item.subsystem || '—'}
                </td>

                <td className="py-3 px-4 text-right whitespace-nowrap">
                  {item.relatedEvidenceId ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/evidence/${item.relatedEvidenceId}`);
                      }}
                      className="px-2 py-1 rounded bg-[#152744] hover:bg-sky-600 text-sky-300 hover:text-white text-[11px] font-mono flex items-center gap-1 ml-auto transition-all"
                    >
                      <span>{item.relatedEvidenceId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-slate-600 font-mono text-[11px]">System</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
