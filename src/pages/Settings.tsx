import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Settings, ShieldCheck, Database, Sliders, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000/api');
  const [simulationSpeed, setSimulationSpeed] = useState('1x');
  const [telemetryRate, setTelemetryRate] = useState('10Hz');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Console Settings"
        subtitle="Mission Operations Copilot workstation configurations and backend API endpoint connectors"
      />

      <div className="bg-[#0c1524] border border-[#1a2842] rounded-xl p-6 max-w-3xl shadow-lg space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            <span>FastAPI Backend Connection</span>
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Endpoint for backend service integration (mock data fallback is enabled automatically)
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="flex-1 bg-[#080e1a] border border-[#1e2f4f] text-slate-200 text-xs rounded px-3 py-2 font-mono focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-300" /> : null}
              <span>{saved ? 'Saved' : 'Save Endpoint'}</span>
            </button>
          </div>
        </div>

        <div className="pt-5 border-t border-[#16233b] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Simulation Playback Speed
            </label>
            <select
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(e.target.value)}
              className="w-full bg-[#080e1a] border border-[#1e2f4f] text-slate-200 text-xs rounded px-3 py-2 font-mono focus:outline-none focus:border-sky-500"
            >
              <option value="1x">1x (Real-time)</option>
              <option value="2x">2x Accelerated</option>
              <option value="5x">5x High Speed</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Downlink Ingestion Rate
            </label>
            <select
              value={telemetryRate}
              onChange={(e) => setTelemetryRate(e.target.value)}
              className="w-full bg-[#080e1a] border border-[#1e2f4f] text-slate-200 text-xs rounded px-3 py-2 font-mono focus:outline-none focus:border-sky-500"
            >
              <option value="10Hz">10 Hz (Engineering Standard)</option>
              <option value="50Hz">50 Hz (Burst Mode)</option>
              <option value="1Hz">1 Hz (Low Power Eclipse)</option>
            </select>
          </div>
        </div>

        <div className="pt-5 border-t border-[#16233b] p-3 rounded-lg bg-[#080d17] border border-[#16233b] text-xs font-mono text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Workstation Security: Operator Authenticated • Read-Only Simulation Safe</span>
        </div>
      </div>
    </div>
  );
};
