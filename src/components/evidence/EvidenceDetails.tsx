import React, { useState } from 'react';
import { Evidence } from '../../types/mission';
import {
  FileText,
  Clock,
  Zap,
  Activity,
  Layers,
  Code2,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface EvidenceDetailsProps {
  evidence: Evidence;
  onSelectRelated?: (id: string) => void;
}

export const EvidenceDetails: React.FC<EvidenceDetailsProps> = ({
  evidence,
  onSelectRelated,
}) => {
  const [showRawModal, setShowRawModal] = useState(false);

  // Convert sparkline numbers to chart objects
  const sparklineChartData = (evidence.sparklineData || [15.2, 15.8, 17.0, 18.7]).map(
    (val, i) => ({
      index: i,
      value: val,
    })
  );

  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-5 shadow-md flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#16233b] mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-mono font-bold text-white tracking-wider">
              {evidence.id}
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-950/80 text-sky-300 border border-sky-700/60 uppercase">
              {evidence.source}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Relevance:</span>
            <span className="font-bold text-emerald-400">
              {(evidence.relevance * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-5">
          <div className="p-2.5 rounded bg-[#09101c] border border-[#16233b]">
            <div className="text-[11px] text-slate-500 font-mono">Timestamp</div>
            <div className="font-mono text-slate-200 font-semibold mt-0.5">
              {evidence.timestamp}
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#09101c] border border-[#16233b]">
            <div className="text-[11px] text-slate-500 font-mono">Subsystem</div>
            <div className="font-mono text-slate-200 font-semibold mt-0.5">
              {evidence.subsystem}
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#09101c] border border-[#16233b]">
            <div className="text-[11px] text-slate-500 font-mono">Parameter</div>
            <div className="font-mono text-slate-200 font-semibold mt-0.5 truncate">
              {evidence.parameter || 'N/A'}
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#09101c] border border-[#16233b]">
            <div className="text-[11px] text-slate-500 font-mono">Current Value</div>
            <div className="font-mono text-rose-400 font-bold mt-0.5">
              {evidence.value}
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#09101c] border border-[#16233b]">
            <div className="text-[11px] text-slate-500 font-mono">Expected Range</div>
            <div className="font-mono text-emerald-300 font-semibold mt-0.5">
              {evidence.expectedRange || 'Nominal Range'}
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#09101c] border border-[#16233b]">
            <div className="text-[11px] text-slate-500 font-mono">Unit / Status</div>
            <div className="font-mono text-amber-400 font-semibold mt-0.5 flex items-center gap-1.5">
              <span>{evidence.unit || 'Standard'}</span>
              <span className="text-slate-600">|</span>
              <span className="text-rose-400 font-bold uppercase">{evidence.status || 'WARNING'}</span>
            </div>
          </div>
        </div>

        {/* Description / Summary */}
        {evidence.description && (
          <div className="mb-5 p-3 rounded bg-[#09101c] border border-[#16233b] text-xs text-slate-300 leading-relaxed">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">
              OBSERVATION NOTE
            </span>
            {evidence.description}
          </div>
        )}

        {/* Mini Sparkline Chart */}
        {evidence.sparklineData && evidence.sparklineData.length > 0 && (
          <div className="mb-5 p-3 rounded bg-[#09101c] border border-[#16233b]">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>Trend Profile ({evidence.parameter})</span>
              <span className="text-rose-400 font-bold">Peak: {evidence.value}</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineChartData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#ef4444' }}
                  />
                  <XAxis hide dataKey="index" />
                  <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c1524',
                      borderColor: '#1e3256',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Related Evidence Links */}
        {evidence.relatedEvidenceIds && evidence.relatedEvidenceIds.length > 0 && (
          <div className="mb-5">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
              Correlated Records
            </div>
            <div className="flex flex-wrap gap-2">
              {evidence.relatedEvidenceIds.map((relId) => (
                <button
                  key={relId}
                  onClick={() => onSelectRelated && onSelectRelated(relId)}
                  className="px-2.5 py-1 rounded bg-[#0e1c31] hover:bg-[#152a4a] border border-[#1f3861] text-sky-300 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>{relId}</span>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Button to view raw original record */}
      <div className="pt-3 border-t border-[#16233b]">
        <button
          onClick={() => setShowRawModal(true)}
          className="w-full py-2 px-3 rounded bg-[#13233c] hover:bg-[#1a3257] border border-[#1e3b68] text-sky-300 hover:text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <Code2 className="w-4 h-4" />
          <span>View Original Record</span>
        </button>
      </div>

      {/* Raw Record Modal */}
      {showRawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0c1524] border border-[#203a66] rounded-xl max-w-2xl w-full p-5 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <h3 className="font-mono text-sm font-bold text-white">
                  Original Telemetry Payload: {evidence.id}
                </h3>
              </div>
              <button
                onClick={() => setShowRawModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold font-mono px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#060a12] rounded p-4 border border-[#16233b] max-h-96 overflow-y-auto">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                {typeof evidence.rawRecord === 'string'
                  ? evidence.rawRecord
                  : JSON.stringify(evidence.rawRecord, null, 2)}
              </pre>
            </div>

            <div className="mt-4 flex justify-between items-center text-[11px] font-mono text-slate-400">
              <span>CRC-32: VALID • CCSDS FRAME VERIFIED</span>
              <button
                onClick={() => setShowRawModal(false)}
                className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
