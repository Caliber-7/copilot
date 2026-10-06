import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Search,
  FolderArchive,
  Activity,
  Clock,
  ShieldCheck,
  BookOpen,
  History,
  Bot,
  Sparkles,
  Settings,
  Radio,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/anomalies', label: 'Anomalies', icon: AlertTriangle, badge: '1' },
    { to: '/investigation/ANOM-004', label: 'Investigations', icon: Search },
    { to: '/evidence/TEL-4821', label: 'Evidence Explorer', icon: FolderArchive },
    { to: '/telemetry', label: 'Telemetry', icon: Activity },
    { to: '/timeline/ANOM-004', label: 'Timeline', icon: Clock },
    { to: '/audit/ANOM-004', label: 'Audit Trail', icon: ShieldCheck },
    { to: '/procedures', label: 'Procedures', icon: BookOpen },
    { to: '/historical', label: 'Historical Incidents', icon: History },
    { to: '/copilot', label: 'AI Copilot', icon: Bot, isSpecial: true },
    { to: '/demo', label: 'Demo Mode', icon: Sparkles, isSpecial: true },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0a101d] border-r border-[#1a2842] flex flex-col flex-shrink-0 select-none min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-[#1a2842] flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 2 22 22 22" fill="currentColor" fillOpacity="0.3" />
            <polygon points="12 2 2 22 22 22" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-wider text-sm text-white">ANTIGRAVITY</span>
          </div>
          <div className="text-[10px] text-slate-400 tracking-tight font-medium">
            Mission Operations Copilot
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#142646] text-sky-400 font-semibold shadow-inner border-l-2 border-sky-400 pl-2.5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111c30]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className="w-4 h-4 transition-colors group-hover:text-slate-100 flex-shrink-0"
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3.5 border-t border-[#1a2842] bg-[#070c17]/60 text-[11px] space-y-2">
        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span className="font-mono text-emerald-400 font-semibold text-[11px]">System Online</span>
          </div>
          <Radio className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/40">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Simulation Mode</span>
        </div>
      </div>
    </aside>
  );
};
