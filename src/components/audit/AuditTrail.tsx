import React, { useState } from 'react';
import { AuditEvent } from '../../types/mission';
import { ShieldCheck, User, Cpu, Bot, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditTrailProps {
  events: AuditEvent[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ events }) => {
  const [actorFilter, setActorFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filtered = events.filter((ev) => {
    if (actorFilter !== 'ALL' && ev.actor !== actorFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        ev.action.toLowerCase().includes(q) ||
        ev.object.toLowerCase().includes(q) ||
        ev.actor.toLowerCase().includes(q) ||
        (ev.details && ev.details.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const displayed = filtered.slice(startIndex, startIndex + pageSize);

  const getActorBadge = (actor: string) => {
    switch (actor.toUpperCase()) {
      case 'OPERATOR':
        return {
          icon: User,
          classes: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
        };
      case 'SYSTEM':
        return {
          icon: Cpu,
          classes: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
        };
      case 'AI':
      case 'AI COPILOT':
        return {
          icon: Bot,
          classes: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
        };
      default:
        return {
          icon: ShieldCheck,
          classes: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg shadow-md overflow-hidden">
      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#09101c] border-b border-[#1a2842] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="bg-[#0e1726] border border-[#1e2f4f] text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="ALL">All Actors</option>
            <option value="OPERATOR">Operator</option>
            <option value="SYSTEM">System</option>
            <option value="AI">AI Copilot</option>
          </select>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit events..."
            className="w-full bg-[#0e1726] border border-[#1e2f4f] text-slate-200 placeholder-slate-500 text-xs rounded pl-9 pr-3 py-1.5 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#080e1a] text-slate-400 font-mono text-[11px] border-b border-[#1a2842] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-semibold">Time (UTC)</th>
              <th className="py-3 px-4 font-semibold">Actor</th>
              <th className="py-3 px-4 font-semibold">Action</th>
              <th className="py-3 px-4 font-semibold">Object</th>
              <th className="py-3 px-4 font-semibold">Evidence</th>
              <th className="py-3 px-4 font-semibold text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#16233b]">
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No audit events found.
                </td>
              </tr>
            ) : (
              displayed.map((item) => {
                const { icon: ActorIcon, classes: actorBadgeClass } = getActorBadge(
                  item.actor
                );

                return (
                  <tr key={item.id} className="hover:bg-[#111e33] transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {item.timestamp}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${actorBadgeClass}`}
                      >
                        <ActorIcon className="w-3 h-3" />
                        <span>{item.actor}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{item.action}</div>
                      {item.details && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.details}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-sky-400 whitespace-nowrap">
                      {item.object}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {item.evidenceCount || '—'}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                        {item.result}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="py-3 px-4 bg-[#080e1a] border-t border-[#1a2842] flex items-center justify-between text-xs text-slate-400 font-mono">
        <div>
          Showing {filtered.length > 0 ? startIndex + 1 : 0}-
          {Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} events
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
