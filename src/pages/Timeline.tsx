import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { missionApi } from '../services/api';
import { TimelineEvent } from '../types/mission';
import { PageHeader } from '../components/layout/PageHeader';
import { IncidentTimeline } from '../components/timeline/IncidentTimeline';
import { Clock, RefreshCw } from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const { id = 'ANOM-004' } = useParams<{ id: string }>();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const data = await missionApi.getTimeline(id);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [id]);

  return (
    <div>
      <PageHeader
        title="Incident Timeline"
        subtitle={`Chronological event correlation for ${id} • Power & Thermal Subsystems`}
        actions={
          <button
            onClick={fetchTimeline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#101b2f] hover:bg-[#182a47] border border-[#1e3256] text-xs font-mono text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Sync Events</span>
          </button>
        }
      />

      {loading ? (
        <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-8 text-center text-xs text-slate-400 animate-pulse">
          Loading synchronized mission event stream...
        </div>
      ) : (
        <IncidentTimeline events={events} />
      )}
    </div>
  );
};
