import React from 'react';
import { Rocket, AlertTriangle, ShieldCheck, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MissionStatusProps {
  activeAnomaliesCount: number;
  healthySubsystems: number;
  totalSubsystems: number;
  missionDay: number;
  totalDays: number;
}

export const MissionStatus: React.FC<MissionStatusProps> = ({
  activeAnomaliesCount,
  healthySubsystems,
  totalSubsystems,
  missionDay,
  totalDays,
}) => {
  const percentComplete = Math.round((missionDay / totalDays) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Spacecraft Status */}
      <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-4 flex items-center gap-4 shadow-md hover:border-[#24395c] transition-all">
        <div className="w-12 h-12 rounded-lg bg-sky-950/80 border border-sky-700/40 flex items-center justify-center text-sky-400 flex-shrink-0">
          <Rocket className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-slate-400 font-medium">Spacecraft Status</div>
          <div className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Nominal</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            All systems operating within expected range
          </div>
        </div>
      </div>

      {/* 2. Active Anomalies */}
      <Link
        to="/anomalies"
        className="bg-[#0c1524] border border-amber-900/40 hover:border-amber-500/60 rounded-lg p-4 flex items-center gap-4 shadow-md transition-all group"
      >
        <div className="w-12 h-12 rounded-lg bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-slate-400 font-medium">Active Anomalies</div>
          <div className="text-xl font-bold text-amber-400 tracking-tight">
            {activeAnomaliesCount}
          </div>
          <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1 mt-0.5 group-hover:underline">
            Requires Investigation →
          </div>
        </div>
      </Link>

      {/* 3. Subsystem Health */}
      <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-4 flex items-center gap-4 shadow-md hover:border-[#24395c] transition-all">
        <div className="w-12 h-12 rounded-lg bg-emerald-950/60 border border-emerald-700/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-slate-400 font-medium">Subsystem Health</div>
          <div className="text-xl font-bold text-white tracking-tight">
            {healthySubsystems} / {totalSubsystems}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
            Healthy &amp; Stable
          </div>
        </div>
      </div>

      {/* 4. Subsystem Health / Mission Progress Ring */}
      <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-4 flex items-center justify-between shadow-md hover:border-[#24395c] transition-all">
        <div>
          <div className="text-xs text-slate-400 font-medium">Mission Progress</div>
          <div className="text-xl font-bold text-white tracking-tight">
            {percentComplete}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Day {missionDay} / {totalDays}
          </div>
        </div>

        {/* Circular SVG Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#1a2842"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#10b981"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={125.6}
              strokeDashoffset={125.6 - (125.6 * percentComplete) / 100}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-[11px] font-mono font-bold text-emerald-400">
            {percentComplete}%
          </span>
        </div>
      </div>
    </div>
  );
};
