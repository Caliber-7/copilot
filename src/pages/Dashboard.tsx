import React, { useState, useEffect } from 'react';
import { missionApi } from '../services/api';
import { SubsystemStatus, Anomaly } from '../types/mission';
import { PageHeader } from '../components/layout/PageHeader';
import { MissionStatus } from '../components/dashboard/MissionStatus';
import { SubsystemCard } from '../components/dashboard/SubsystemCard';
import { RecentAlerts } from '../components/dashboard/RecentAlerts';
import { MissionTimelineBar } from '../components/dashboard/MissionTimelineBar';
import { InvestigationQueue } from '../components/dashboard/InvestigationQueue';
import { RefreshCw, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [subsystems, setSubsystems] = useState<SubsystemStatus[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subData, anomData] = await Promise.all([
        missionApi.getSubsystems(),
        missionApi.getAnomalies(),
      ]);
      setSubsystems(subData);
      setAnomalies(anomData);
    } catch (err: any) {
      setError('Unable to load mission telemetry service. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-[#0c1524] rounded-lg animate-pulse w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#0c1524] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-[#0c1524] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-[#0c1524] border border-rose-900/40 rounded-lg max-w-lg mx-auto mt-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">Telemetry Service Unavailable</h2>
        <p className="text-xs text-slate-400 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const activeAnomaliesCount = anomalies.filter(
    (a) => a.status === 'INVESTIGATING' || a.status === 'NEW'
  ).length;
  const healthySubsystems = subsystems.filter((s) => s.status === 'NOMINAL').length;

  return (
    <div>
      <PageHeader
        title="Mission Dashboard"
        subtitle="Spacecraft SC-01 • Mission Day 142 • 2026-06-24 14:37:22 UTC"
        actions={
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#101b2f] hover:bg-[#182a47] border border-[#1e3256] text-xs font-mono text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Telemetry Refresh</span>
          </button>
        }
      />

      {/* Top 4 Metrics Cards */}
      <MissionStatus
        activeAnomaliesCount={activeAnomaliesCount}
        healthySubsystems={healthySubsystems}
        totalSubsystems={subsystems.length}
        missionDay={142}
        totalDays={180}
      />

      {/* Subsystem Health Cards Grid (POWER, THERMAL, COMM, ATTITUDE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {subsystems.slice(0, 4).map((sub) => (
          <SubsystemCard key={sub.id} subsystem={sub} />
        ))}
      </div>

      {/* Middle Row: Recent Alerts & Mission Timeline Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAlerts />
        <MissionTimelineBar />
      </div>

      {/* Bottom: Active Investigation Queue */}
      <InvestigationQueue anomalies={anomalies} />
    </div>
  );
};
