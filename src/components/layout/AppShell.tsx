import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ShieldCheck } from 'lucide-react';

export const AppShell: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#060b13] text-slate-200">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Persistent Topbar */}
        <Topbar />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-6 tech-grid-bg">
          <div className="max-w-7xl mx-auto pb-10">
            <Outlet />
          </div>
        </main>

        {/* Persistent Safety Boundary Footer (Spec Section 17) */}
        <footer className="h-7 bg-[#070c17] border-t border-[#16233b] px-6 flex items-center justify-between text-[10px] font-mono text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-slate-400">
              SIMULATION ENVIRONMENT — NO SPACECRAFT COMMAND EXECUTION
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-500">
            <span>FLIGHT DYNAMICS &amp; ANOMALY SUBSYSTEM</span>
            <span>BUILD v2.4-PROD</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
