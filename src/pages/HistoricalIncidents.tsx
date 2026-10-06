import React, { useState, useEffect } from 'react';
import { missionApi } from '../services/api';
import { HistoricalIncident } from '../types/mission';
import { PageHeader } from '../components/layout/PageHeader';
import { History, Search, GitCompare, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HistoricalIncidentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<HistoricalIncident[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const data = await missionApi.getHistoricalIncidents();
      setIncidents(data);
    };
    fetch();
  }, []);

  const filtered = incidents.filter(
    (inc) =>
      inc.id.toLowerCase().includes(search.toLowerCase()) ||
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.resolution.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Historical Incidents Archive"
        subtitle="Vector indexed spacecraft anomaly repository for case-based reasoning and pattern matching"
      />

      <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-3.5 mb-5 flex items-center justify-between shadow-md">
        <div className="relative min-w-[280px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archived mission incidents..."
            className="w-full bg-[#080e1a] border border-[#1e2f4f] text-slate-200 placeholder-slate-500 text-xs rounded pl-9 pr-3 py-1.5 focus:outline-none focus:border-sky-500"
          />
        </div>
        <span className="text-xs font-mono text-slate-400">
          Embedding Distance: Cosine Similarity &gt; 0.65
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((inc) => (
          <div
            key={inc.id}
            className="bg-[#0c1524] border border-[#1a2842] hover:border-[#223d68] rounded-lg p-5 shadow-md flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sky-400 text-sm">
                    {inc.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 font-semibold">
                    {Math.round(inc.similarity * 100)}% Match
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">{inc.date}</span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{inc.title}</h3>

              <div className="mb-4 text-xs font-mono text-slate-400">
                Subsystem: <span className="text-slate-200 font-semibold">{inc.subsystem}</span>
              </div>

              <div className="p-3 rounded bg-[#080d17] border border-[#17253d] text-xs text-emerald-300 leading-relaxed mb-4">
                <div className="font-mono text-[10px] text-slate-500 uppercase mb-1">
                  Verified Flight Resolution
                </div>
                {inc.resolution}
              </div>
            </div>

            <div className="pt-3 border-t border-[#16233b] flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">Archive DB: SC-01-LOGS</span>
              <button
                onClick={() => navigate('/investigation/ANOM-004')}
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
              >
                <span>Correlate with ANOM-004</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
