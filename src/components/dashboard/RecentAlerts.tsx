import React from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockRecentAlerts } from '../../data/mockData';

export const RecentAlerts: React.FC = () => {
  const getBadgeClass = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border border-rose-700/60';
      case 'MEDIUM':
      case 'WARNING':
        return 'bg-amber-950/80 text-amber-300 border border-amber-700/60';
      case 'LOW':
        return 'bg-sky-950/80 text-sky-300 border border-sky-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  const getDotColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-rose-500';
      case 'MEDIUM':
      case 'WARNING':
        return 'bg-amber-400';
      case 'LOW':
        return 'bg-sky-400';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-4 flex flex-col justify-between shadow-md">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">Recent Alerts</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Live Telemetry Feeds</span>
        </div>

        <div className="space-y-2.5">
          {mockRecentAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-2 rounded bg-[#09101c]/80 hover:bg-[#111e33] border border-transparent hover:border-[#223554] transition-all text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getDotColor(alert.severity)}`} />
                <span className="font-mono text-slate-400 text-[11px] font-semibold">{alert.id}</span>
                <span className="text-slate-200 truncate font-medium">{alert.title}</span>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0 ml-2">
                <span className="font-mono text-[10px] text-slate-500">{alert.time}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${getBadgeClass(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-[#16233b] flex justify-end">
        <Link
          to="/timeline/ANOM-004"
          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
        >
          View Full Event Stream <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
