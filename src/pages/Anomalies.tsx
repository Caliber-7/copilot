import React, { useState, useEffect } from 'react';
import { missionApi } from '../services/api';
import { Anomaly } from '../types/mission';
import { PageHeader } from '../components/layout/PageHeader';
import { AnomalyFilters } from '../components/anomalies/AnomalyFilters';
import { AnomalyTable } from '../components/anomalies/AnomalyTable';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export const Anomalies: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [severity, setSeverity] = useState('ALL');
  const [subsystem, setSubsystem] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [timeRange, setTimeRange] = useState('24h');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const data = await missionApi.getAnomalies({
        severity,
        subsystem,
        status,
        search,
      });
      setAnomalies(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [severity, subsystem, status, search]);

  return (
    <div>
      <PageHeader
        title="Anomaly Center"
        subtitle="View and manage all mission anomalies detected across spacecraft telemetry channels"
        actions={
          <button
            onClick={fetchAnomalies}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#101b2f] hover:bg-[#182a47] border border-[#1e3256] text-xs font-mono text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Refresh</span>
          </button>
        }
      />

      {/* Filter Toolbar */}
      <AnomalyFilters
        severity={severity}
        setSeverity={setSeverity}
        subsystem={subsystem}
        setSubsystem={setSubsystem}
        status={status}
        setStatus={setStatus}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        search={search}
        setSearch={setSearch}
      />

      {/* Anomaly Table */}
      {loading ? (
        <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-8 text-center text-xs text-slate-400">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-[#101e33] rounded w-full" />
            <div className="h-8 bg-[#101e33] rounded w-full" />
            <div className="h-8 bg-[#101e33] rounded w-full" />
          </div>
        </div>
      ) : (
        <AnomalyTable anomalies={anomalies} />
      )}
    </div>
  );
};
