import React from 'react';
import { Search } from 'lucide-react';

interface AnomalyFiltersProps {
  severity: string;
  setSeverity: (s: string) => void;
  subsystem: string;
  setSubsystem: (sub: string) => void;
  status: string;
  setStatus: (stat: string) => void;
  timeRange: string;
  setTimeRange: (t: string) => void;
  search: string;
  setSearch: (q: string) => void;
}

export const AnomalyFilters: React.FC<AnomalyFiltersProps> = ({
  severity,
  setSeverity,
  subsystem,
  setSubsystem,
  status,
  setStatus,
  timeRange,
  setTimeRange,
  search,
  setSearch,
}) => {
  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-3.5 mb-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Severity */}
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="bg-[#09101c] border border-[#1e2f4f] text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-sky-500 font-mono"
        >
          <option value="ALL">All Severities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Subsystem */}
        <select
          value={subsystem}
          onChange={(e) => setSubsystem(e.target.value)}
          className="bg-[#09101c] border border-[#1e2f4f] text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-sky-500 font-mono"
        >
          <option value="ALL">All Subsystems</option>
          <option value="POWER">Power</option>
          <option value="THERMAL">Thermal</option>
          <option value="COMM">Communication</option>
          <option value="ATTITUDE">Attitude</option>
          <option value="PAYLOAD">Payload</option>
        </select>

        {/* Time Range */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-[#09101c] border border-[#1e2f4f] text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-sky-500 font-mono"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="all">All Mission Days</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-[#09101c] border border-[#1e2f4f] text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-sky-500 font-mono"
        >
          <option value="ALL">All Statuses</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="NEW">New</option>
          <option value="EVIDENCE_COLLECTED">Evidence Collected</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Search Bar */}
      <div className="relative min-w-[220px]">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search anomalies..."
          className="w-full bg-[#09101c] border border-[#1e2f4f] text-slate-200 placeholder-slate-500 text-xs rounded pl-9 pr-3 py-1.5 focus:outline-none focus:border-sky-500"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
