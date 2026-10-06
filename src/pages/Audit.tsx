import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { missionApi } from '../services/api';
import { AuditEvent } from '../types/mission';
import { PageHeader } from '../components/layout/PageHeader';
import { AuditTrail } from '../components/audit/AuditTrail';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const { id = 'ANOM-004' } = useParams<{ id: string }>();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const data = await missionApi.getAuditTrail(id);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [id]);

  return (
    <div>
      <PageHeader
        title="Audit Trail"
        subtitle={`Complete immutable record of operator actions, AI inferences, and RAG retrievals for ${id}`}
        actions={
          <button
            onClick={fetchAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#101b2f] hover:bg-[#182a47] border border-[#1e3256] text-xs font-mono text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Verify Integrity</span>
          </button>
        }
      />

      {loading ? (
        <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-8 text-center text-xs text-slate-400 animate-pulse">
          Verifying audit signature and fetching activity records...
        </div>
      ) : (
        <AuditTrail events={events} />
      )}
    </div>
  );
};
