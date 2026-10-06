import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Evidence } from '../../types/mission';
import { FolderArchive, ExternalLink, Activity, FileText, BookOpen, History } from 'lucide-react';

interface EvidenceListProps {
  evidence: Evidence[];
}

export const EvidenceList: React.FC<EvidenceListProps> = ({ evidence }) => {
  const navigate = useNavigate();

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
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-3">
        <div className="flex items-center gap-2">
          <FolderArchive className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Supporting Evidence</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {evidence.length} Records Retrieved
        </span>
      </div>

      <div className="space-y-2.5">
        {evidence.slice(0, 4).map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/evidence/${item.id}`)}
            className="p-3 rounded bg-[#09101c] hover:bg-[#121f36] border border-[#17253d] hover:border-sky-500/40 cursor-pointer transition-all flex items-center justify-between gap-3 group"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sky-400 text-xs group-hover:underline">
                  {item.id}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  {getSourceIcon(item.source)}
                  <span>{item.source}</span>
                </span>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {item.parameter || item.value}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1 font-mono">
                <span className="text-emerald-300 font-semibold">{item.value}</span>
                <span className="text-slate-600">|</span>
                <span>{item.timestamp}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/evidence/${item.id}`);
              }}
              className="px-2.5 py-1 rounded bg-[#172c4e] hover:bg-sky-600 text-sky-200 hover:text-white text-xs font-mono font-medium flex items-center gap-1 transition-all flex-shrink-0"
            >
              <span>OPEN</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
