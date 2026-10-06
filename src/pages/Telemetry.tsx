import React, { useState, useEffect } from 'react';
import { missionApi } from '../services/api';
import { TelemetryPoint } from '../types/mission';
import { PageHeader } from '../components/layout/PageHeader';
import { TelemetryChart } from '../components/telemetry/TelemetryChart';
import {
  TelemetryPanel,
  TelemetryParamSelection,
} from '../components/telemetry/TelemetryPanel';
import { Activity, Clock, Satellite, GitCompare } from 'lucide-react';

export const TelemetryPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [timeRange, setTimeRange] = useState('2h');
  const [spacecraft, setSpacecraft] = useState('SC-01');
  const [isComparing, setIsComparing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedParams, setSelectedParams] = useState<TelemetryParamSelection>({
    batteryCurrent: true,
    batteryTemperature: true,
    batteryVoltage: true,
    stateOfCharge: false,
    solarArrayCurrent: false,
    componentTemperature: false,
    radiatorTemperature: false,
    thermalMargin: false,
    signalStrength: false,
    packetLoss: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await missionApi.getTelemetry(timeRange);
        setTelemetry(data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const handleSelectAll = () => {
    setSelectedParams({
      batteryCurrent: true,
      batteryTemperature: true,
      batteryVoltage: true,
      stateOfCharge: true,
      solarArrayCurrent: true,
      componentTemperature: true,
      radiatorTemperature: true,
      thermalMargin: true,
      signalStrength: true,
      packetLoss: true,
    });
  };

  const handleResetDefaults = () => {
    setSelectedParams({
      batteryCurrent: true,
      batteryTemperature: true,
      batteryVoltage: true,
      stateOfCharge: false,
      solarArrayCurrent: false,
      componentTemperature: false,
      radiatorTemperature: false,
      thermalMargin: false,
      signalStrength: false,
      packetLoss: false,
    });
  };

  return (
    <div>
      <PageHeader
        title="Telemetry Explorer"
        subtitle="Real-time and historical spacecraft telemetry data across all engineering buses"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-[#0c1524] border border-[#1e2f4f] text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="1h">Last 1 Hour</option>
              <option value="2h">Last 2 Hours</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
            </select>

            <select
              value={spacecraft}
              onChange={(e) => setSpacecraft(e.target.value)}
              className="bg-[#0c1524] border border-[#1e2f4f] text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="SC-01">Spacecraft SC-01</option>
              <option value="SC-02">Spacecraft SC-02 (Simulator)</option>
            </select>

            <button
              onClick={() => setIsComparing(!isComparing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                isComparing
                  ? 'bg-sky-600 text-white'
                  : 'bg-[#12213a] hover:bg-[#1a3055] text-sky-300 border border-[#1e3b68]'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Parameters</span>
            </button>
          </div>
        }
      />

      {/* Two-column layout from image.png screen 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Parameters selector */}
        <div className="lg:col-span-4 space-y-4">
          <TelemetryPanel
            selectedParams={selectedParams}
            onChange={setSelectedParams}
          />

          <div className="flex items-center justify-between px-1 text-xs">
            <button
              onClick={handleSelectAll}
              className="text-sky-400 hover:text-sky-300 font-mono"
            >
              Select All
            </button>
            <button
              onClick={handleResetDefaults}
              className="text-slate-400 hover:text-slate-300 font-mono"
            >
              Reset to Anomaly Focus
            </button>
          </div>
        </div>

        {/* Right column: Large Chart */}
        <div className="lg:col-span-8 bg-[#0c1524] border border-[#1a2842] rounded-lg p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#16233b] mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Power Subsystem Telemetry
                </h3>
                <p className="text-xs text-slate-400">
                  Dual-axis engineering telemetry time series (Amps / °C / Volts)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  10 Hz Live Downlink
                </span>
              </div>
            </div>

            <TelemetryChart
              data={telemetry}
              selectedParams={selectedParams}
              compact={false}
            />
          </div>

          <div className="pt-4 mt-2 border-t border-[#16233b] flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Red shaded zone represents verified 14:30 – 14:40 anomaly window</span>
            <span className="text-rose-400 font-bold">Limit: 18.5 A Red High</span>
          </div>
        </div>
      </div>
    </div>
  );
};
