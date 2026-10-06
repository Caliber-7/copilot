import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { TelemetryPoint } from '../../types/mission';

interface TelemetryChartProps {
  data: TelemetryPoint[];
  selectedParams?: {
    batteryCurrent: boolean;
    batteryTemperature: boolean;
    batteryVoltage: boolean;
    stateOfCharge?: boolean;
    solarArrayCurrent?: boolean;
    componentTemperature?: boolean;
    radiatorTemperature?: boolean;
    thermalMargin?: boolean;
    signalStrength?: boolean;
    packetLoss?: boolean;
  };
  compact?: boolean;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  data,
  selectedParams = {
    batteryCurrent: true,
    batteryTemperature: true,
    batteryVoltage: true,
  },
  compact = false,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#09111c] border border-[#1e3256] p-3 rounded-lg shadow-xl text-xs font-mono">
          <div className="font-bold text-slate-300 pb-1.5 border-b border-[#182845] mb-2 flex items-center justify-between gap-4">
            <span>Time: {label} UTC</span>
            {label >= '14:30' && label <= '14:45' && (
              <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 text-[10px] font-bold border border-rose-700/50">
                ANOMALY
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {payload.map((entry: any) => (
              <div
                key={entry.dataKey}
                className="flex items-center justify-between gap-4"
                style={{ color: entry.color }}
              >
                <span>{entry.name}:</span>
                <span className="font-bold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full ${compact ? 'h-64' : 'h-96'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 15, right: 25, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#142138" vertical={false} />
          
          <XAxis
            dataKey="timestamp"
            stroke="#475569"
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            tickLine={{ stroke: '#1e2c48' }}
          />

          {/* Left Y Axis for Current & Temp */}
          <YAxis
            yAxisId="left"
            stroke="#475569"
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            domain={[10, 50]}
            tickLine={{ stroke: '#1e2c48' }}
          />

          {/* Right Y Axis for Voltage */}
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#475569"
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            domain={[26, 30]}
            tickLine={{ stroke: '#1e2c48' }}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '11px',
              fontFamily: 'monospace',
            }}
          />

          {/* Anomaly highlight zone */}
          <ReferenceArea
            yAxisId="left"
            x1="14:30"
            x2="14:40"
            strokeOpacity={0.3}
            fill="#ef4444"
            fillOpacity={0.08}
          />
          <ReferenceLine
            yAxisId="left"
            x="14:32"
            stroke="#ef4444"
            strokeDasharray="4 4"
            label={{
              value: 'Anomaly Detected',
              fill: '#ef4444',
              fontSize: 10,
              fontFamily: 'monospace',
              position: 'top',
            }}
          />

          {/* Active Lines */}
          {selectedParams.batteryCurrent && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="batteryCurrent"
              name="Battery Current (A)"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={{ r: 2, fill: '#0ea5e9' }}
              activeDot={{ r: 5 }}
            />
          )}

          {selectedParams.batteryTemperature && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="batteryTemperature"
              name="Battery Temperature (°C)"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={{ r: 2, fill: '#f97316' }}
              activeDot={{ r: 5 }}
            />
          )}

          {selectedParams.batteryVoltage && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="batteryVoltage"
              name="Voltage (V)"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 2, fill: '#10b981' }}
              activeDot={{ r: 5 }}
            />
          )}

          {selectedParams.stateOfCharge && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="stateOfCharge"
              name="State of Charge (%)"
              stroke="#a855f7"
              strokeWidth={1.5}
              dot={false}
            />
          )}

          {selectedParams.radiatorTemperature && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="radiatorTemperature"
              name="Radiator Temp (°C)"
              stroke="#06b6d4"
              strokeWidth={1.5}
              dot={false}
            />
          )}

          {selectedParams.thermalMargin && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="thermalMargin"
              name="Thermal Margin (°C)"
              stroke="#eab308"
              strokeWidth={1.5}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
