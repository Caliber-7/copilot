import React, { useState, useEffect } from 'react';
import { missionApi } from '../services/api';
import { Procedure } from '../types/mission';
import { PageHeader } from '../components/layout/PageHeader';
import { BookOpen, Search, CheckCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProceduresPage: React.FC = () => {
  const navigate = useNavigate();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [selectedProc, setSelectedProc] = useState<Procedure | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const data = await missionApi.getProcedures();
      setProcedures(data);
      if (data.length > 0) setSelectedProc(data[0]);
    };
    fetch();
  }, []);

  const filtered = procedures.filter(
    (p) =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.subsystem.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Flight Operations Procedures"
        subtitle="Standard and contingency operating flight rules referenced by Mission Copilot"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Procedure List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-3 shadow-md">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search procedures..."
                className="w-full bg-[#080e1a] border border-[#1e2f4f] text-slate-200 placeholder-slate-500 text-xs rounded pl-9 pr-3 py-1.5 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {filtered.map((proc) => {
              const isSelected = selectedProc?.id === proc.id;
              return (
                <div
                  key={proc.id}
                  onClick={() => setSelectedProc(proc)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#132646] border-sky-500 shadow-md'
                      : 'bg-[#0c1524] border-[#1a2842] hover:border-[#223b63]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-sky-400 text-xs">
                      {proc.id}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0a1221] text-slate-300 border border-[#1a2c47]">
                      {proc.revision}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white mb-1">{proc.title}</h4>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Subsystem: {proc.subsystem}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Procedure Detail */}
        <div className="lg:col-span-7">
          {selectedProc ? (
            <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-[#16233b] mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-sky-400">
                      {selectedProc.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {selectedProc.revision}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">
                    {selectedProc.title}
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Subsystem: {selectedProc.subsystem}
                </span>
              </div>

              <div className="mb-6 p-3 rounded bg-[#080e1a] border border-[#16233b] text-xs text-slate-300">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  Purpose &amp; Authority
                </span>
                {selectedProc.purpose}
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
                  Execution Checklist
                </h4>
                <div className="space-y-2.5">
                  {selectedProc.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded bg-[#09111c] border border-[#172640] text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#16233b] flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  REFERENCED IN INVESTIGATION: ANOM-004
                </span>
                <button
                  onClick={() => navigate('/investigation/ANOM-004')}
                  className="text-sky-400 hover:text-sky-300 font-medium"
                >
                  Return to Workspace →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-[#0c1524] border border-[#1a2842] rounded-lg">
              Select a procedure to view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
