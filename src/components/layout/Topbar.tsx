import React, { useState, useEffect } from 'react';
import { User, ShieldAlert, Clock, Satellite } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Topbar: React.FC = () => {
  const [utcTime, setUtcTime] = useState<string>('14:37:22 UTC');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Keep aerospace UTC clock formatting
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-[#090f1c] border-b border-[#1a2842] px-6 flex items-center justify-between z-10 flex-shrink-0">
      {/* Left: Mission and Spacecraft ID */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Satellite className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-xs tracking-wider text-slate-200 uppercase">
            Mission Operations Copilot
          </span>
          <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-950/80 text-sky-300 border border-sky-700/50">
            SC-01
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 border-l border-[#1a2842] pl-4">
          <span className="font-mono text-slate-300">Mission Day 142</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-slate-400">2026-06-24</span>
        </div>
      </div>

      {/* Right: Simulation Notice & Operator status */}
      <div className="flex items-center gap-4">
        {/* UTC Clock */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0d1627] border border-[#1e2f4f] text-xs font-mono text-cyan-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{utcTime}</span>
        </div>

        {/* Safety Boundary pill from image.png */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/50 border border-emerald-600/60 text-emerald-300 text-[10px] font-mono tracking-widest uppercase font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>SIMULATION ONLY</span>
        </div>

        {/* Operator Profile */}
        <div className="flex items-center gap-2 text-xs text-slate-300 pl-2 border-l border-[#1a2842]">
          <div className="w-7 h-7 rounded-full bg-[#162744] border border-[#25416e] flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <span className="font-medium hidden sm:inline text-xs text-slate-300">Operator</span>
        </div>

        {/* Quick Demo Trigger Link */}
        <Link
          to="/demo"
          className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 transition-colors"
        >
          <span>Demo Reset</span>
        </Link>
      </div>
    </header>
  );
};
