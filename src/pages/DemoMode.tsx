import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { missionApi } from '../services/api';
import { PageHeader } from '../components/layout/PageHeader';
import {
  Rocket,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
  RotateCcw,
} from 'lucide-react';

export const DemoModePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadedSuccess, setLoadedSuccess] = useState(false);

  const handleLoadDemo = async () => {
    setLoading(true);
    try {
      await missionApi.resetDemoScenario();
      setLoadedSuccess(true);
      setTimeout(() => {
        navigate('/investigation/ANOM-004');
      }, 700);
    } finally {
      setLoading(false);
    }
  };

  const loadedItems = [
    'Anomaly (ANOM-004): Battery Thermal Anomaly',
    'Telemetry data: 10Hz synchronized stream (last 2 hours)',
    'Mission logs: FDIR warning and sequencer state triggers',
    'Relevant flight procedures: SOP-OPS-PWR-204',
    'Historical incident match: INC-102 (89% similarity)',
    'Pre-populated investigation & AI root cause ranking',
    'Complete end-to-end demo presentation scenario',
  ];

  return (
    <div>
      <PageHeader
        title="Demo Mode"
        subtitle="Load a prepared spacecraft incident with complete ground telemetry and AI investigation package"
      />

      {/* Main Demo Card matching image.png screen 9 */}
      <div className="bg-[#0c1524] border border-[#1a2842] rounded-xl p-8 max-w-4xl mx-auto shadow-2xl">
        <div className="flex items-center gap-3 pb-6 border-b border-[#16233b] mb-6">
          <div className="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-600/40 flex items-center justify-center text-sky-400">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Load Demo Incident
            </h2>
            <p className="text-xs text-slate-400">
              One-click setup for live judging and technical demonstration
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
          {/* Left: Highlighted Incident Target */}
          <div className="p-6 rounded-xl bg-[#080e1a] border border-[#1a2c4a] shadow-inner text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded border border-rose-700/50">
              ANOM-004 • HIGH SEVERITY
            </span>

            <h3 className="text-lg font-bold text-white mt-3 mb-1">
              Battery Thermal Anomaly
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Simulated anomaly with full telemetry streams, mission logs, flight procedures,
              and historical precedents.
            </p>

            <button
              onClick={handleLoadDemo}
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-900/40"
            >
              {loading ? (
                <span>Loading Simulation Environment...</span>
              ) : (
                <>
                  <span>Load Demo Incident</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Right: What will be loaded checklist */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-4">
              What will be loaded?
            </h4>
            <div className="space-y-3">
              {loadedItems.map((item, index) => (
                <div key={index} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info note matching screen 9 */}
        <div className="pt-4 border-t border-[#16233b] flex items-center gap-2 text-xs text-slate-400 bg-[#080d17] p-3 rounded-lg font-mono">
          <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span>
            This will reset the current workstation state and load the complete demo scenario.
          </span>
        </div>
      </div>
    </div>
  );
};
