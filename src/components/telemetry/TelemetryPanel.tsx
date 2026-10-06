import React from 'react';
import { Sliders } from 'lucide-react';

export interface TelemetryParamSelection {
  batteryCurrent: boolean;
  batteryTemperature: boolean;
  batteryVoltage: boolean;
  stateOfCharge: boolean;
  solarArrayCurrent: boolean;
  componentTemperature: boolean;
  radiatorTemperature: boolean;
  thermalMargin: boolean;
  signalStrength: boolean;
  packetLoss: boolean;
}

interface TelemetryPanelProps {
  selectedParams: TelemetryParamSelection;
  onChange: (params: TelemetryParamSelection) => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  selectedParams,
  onChange,
}) => {
  const toggleParam = (key: keyof TelemetryParamSelection) => {
    onChange({
      ...selectedParams,
      [key]: !selectedParams[key],
    });
  };

  const paramList: Array<{
    key: keyof TelemetryParamSelection;
    label: string;
    unit: string;
    color: string;
  }> = [
    { key: 'batteryCurrent', label: 'Battery Current', unit: 'A', color: 'text-sky-400' },
    { key: 'batteryTemperature', label: 'Battery Temperature', unit: '°C', color: 'text-orange-400' },
    { key: 'batteryVoltage', label: 'Battery Voltage', unit: 'V', color: 'text-emerald-400' },
    { key: 'stateOfCharge', label: 'State of Charge', unit: '%', color: 'text-purple-400' },
    { key: 'solarArrayCurrent', label: 'Solar Array Current', unit: 'A', color: 'text-amber-400' },
    { key: 'componentTemperature', label: 'Component Temperature', unit: '°C', color: 'text-rose-400' },
    { key: 'radiatorTemperature', label: 'Radiator Temperature', unit: '°C', color: 'text-cyan-400' },
    { key: 'thermalMargin', label: 'Thermal Margin', unit: '°C', color: 'text-yellow-400' },
    { key: 'signalStrength', label: 'Signal Strength', unit: 'dBm', color: 'text-indigo-400' },
    { key: 'packetLoss', label: 'Packet Loss', unit: '%', color: 'text-red-400' },
  ];

  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Parameters</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Multi-Channel</span>
      </div>

      <div className="space-y-2">
        {paramList.map((item) => (
          <label
            key={item.key}
            className="flex items-center justify-between p-2 rounded bg-[#09101c] hover:bg-[#121f35] border border-transparent hover:border-[#1d3152] cursor-pointer transition-colors text-xs select-none"
          >
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={selectedParams[item.key]}
                onChange={() => toggleParam(item.key)}
                className="rounded border-[#1e2f4f] bg-[#0c1524] text-sky-500 focus:ring-sky-500/20 w-4 h-4"
              />
              <span className={`font-medium ${selectedParams[item.key] ? 'text-white' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
            <span className={`font-mono text-[11px] ${item.color}`}>
              [{item.unit}]
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
