import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { missionApi } from '../services/api';
import { Evidence } from '../types/mission';
import { PageHeader } from '../components/layout/PageHeader';
import { EvidenceDetails } from '../components/evidence/EvidenceDetails';
import { Search, FolderArchive, Activity, FileText, BookOpen, History } from 'lucide-react';

export const EvidencePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [selectedId, setSelectedId] = useState<string>(id || 'TEL-4821');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvidence = async () => {
      setLoading(true);
      try {
        const list = await missionApi.getEvidenceList();
        setEvidenceList(list);
        if (id && list.some((e) => e.id.toLowerCase() === id.toLowerCase())) {
          setSelectedId(id);
        } else if (list.length > 0) {
          setSelectedId(list[0].id);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvidence();
  }, [id]);

  const handleSelect = (item: Evidence) => {
    setSelectedId(item.id);
    navigate(`/evidence/${item.id}`, { replace: true });
  };

  const filtered = evidenceList.filter((item) => {
    if (selectedType !== 'ALL') {
      if (!item.source.toLowerCase().includes(selectedType.toLowerCase())) {
        return false;
      }
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.subsystem.toLowerCase().includes(q) ||
        (item.parameter && item.parameter.toLowerCase().includes(q)) ||
        item.value.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedEvidence =
    evidenceList.find((e) => e.id.toLowerCase() === selectedId.toLowerCase()) ||
    evidenceList[0];

  const types = [
    { key: 'ALL', label: 'All Types' },
    { key: 'Telemetry', label: 'Telemetry' },
    { key: 'Log', label: 'Logs' },
    { key: 'Procedure', label: 'Procedures' },
    { key: 'Incident', label: 'Incidents' },
  ];

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'telemetry':
        return <Activity className="w-3.5 h-3.5 text-sky-400" />;
      case 'mission log':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      case 'procedure':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
      case 'historical incident':
        return <History className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <FolderArchive className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div>
      <PageHeader
        title="Evidence Explorer"
        subtitle="View detailed telemetry packets, mission logs, flight procedures, and historical matches"
      />

      {/* Filter Pills & Search Bar (from image.png screen 4) */}
      <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-3.5 mb-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {types.map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                selectedType === t.key
                  ? 'bg-sky-600 text-white font-semibold shadow-md'
                  : 'bg-[#09101c] text-slate-400 hover:text-slate-200 border border-[#192740]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search evidence..."
            className="w-full bg-[#09101c] border border-[#1e2f4f] text-slate-200 placeholder-slate-500 text-xs rounded pl-9 pr-3 py-1.5 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Two Column Layout from image.png screen 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Evidence Table */}
        <div className="lg:col-span-7 bg-[#0c1524] border border-[#1a2842] rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080e1a] text-slate-400 font-mono text-[11px] border-b border-[#1a2842] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">ID</th>
                  <th className="py-3 px-3.5 font-semibold">Type</th>
                  <th className="py-3 px-3.5 font-semibold">Time (UTC)</th>
                  <th className="py-3 px-3.5 font-semibold">Subsystem</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Relevance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16233b]">
                {filtered.map((item) => {
                  const isSelected =
                    item.id.toLowerCase() === selectedEvidence?.id.toLowerCase();

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#132646] text-white border-l-4 border-sky-400'
                          : 'hover:bg-[#111e33] text-slate-300'
                      }`}
                    >
                      <td className="py-3 px-3.5 font-mono font-bold text-sky-400">
                        {item.id}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          {getSourceIcon(item.source)}
                          <span>{item.source}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-300">
                        {item.timestamp}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-semibold text-slate-200">
                        {item.subsystem}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-400">
                        {item.relevance.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Evidence Details */}
        <div className="lg:col-span-5">
          {selectedEvidence ? (
            <EvidenceDetails
              evidence={selectedEvidence}
              onSelectRelated={(relId) => {
                const found = evidenceList.find(
                  (e) => e.id.toLowerCase() === relId.toLowerCase()
                );
                if (found) handleSelect(found);
              }}
            />
          ) : (
            <div className="p-8 text-center text-slate-400 bg-[#0c1524] border border-[#1a2842] rounded-lg">
              Select an evidence record to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
