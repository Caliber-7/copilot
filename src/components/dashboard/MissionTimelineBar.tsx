import React from 'react';
import { Calendar, Flag } from 'lucide-react';

export const MissionTimelineBar: React.FC = () => {
  const currentDay = 142;
  const totalDays = 180;
  const progressPercent = (currentDay / totalDays) * 100;

  const milestones = [
    { label: 'Launch', day: 'Day 1', percent: 0, status: 'completed' },
    { label: 'Mid-Mission', day: 'Day 90', percent: 50, status: 'completed' },
    { label: 'Current', day: `Day ${currentDay}`, percent: progressPercent, status: 'active' },
    { label: 'End', day: `Day ${totalDays}`, percent: 100, status: 'future' },
  ];

  return (
    <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-4 flex flex-col justify-between shadow-md">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">Mission Timeline</h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            Phase: Science Operations
          </span>
        </div>

        {/* Milestone Bar */}
        <div className="relative pt-6 pb-4 px-2">
          {/* Background Track */}
          <div className="h-1.5 w-full bg-[#16253e] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Milestone Indicators */}
          <div className="relative w-full">
            {milestones.map((m) => {
              const isActive = m.status === 'active';
              const isCompleted = m.status === 'completed';
              return (
                <div
                  key={m.label}
                  className="absolute -top-3.5 transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${m.percent}%` }}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center border-2 transition-all ${
                      isActive
                        ? 'bg-sky-400 border-white shadow-lg shadow-sky-400/50 scale-125 animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-500 border-[#0a101d]'
                        : 'bg-[#182a46] border-[#29416a]'
                    }`}
                  >
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="text-center mt-3 whitespace-nowrap">
                    <div
                      className={`text-[11px] font-medium ${
                        isActive
                          ? 'text-sky-300 font-bold'
                          : isCompleted
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {m.label}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">{m.day}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-6 mt-4 border-t border-[#16233b] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Flag className="w-3.5 h-3.5 text-sky-400" />
          <span>Next Orbital Eclipse: In 48m 12s</span>
        </div>
        <span>Target: 180 Sol Baseline</span>
      </div>
    </div>
  );
};
