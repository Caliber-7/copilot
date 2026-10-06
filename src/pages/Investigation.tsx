import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { missionApi } from '../services/api';
import {
  InvestigationData,
  TelemetryPoint,
  TimelineEvent,
  AuditEvent,
  CopilotMessage,
} from '../types/mission';
import { InvestigationHeader } from '../components/investigation/InvestigationHeader';
import { KeyFindingsGrid } from '../components/investigation/KeyFindingsGrid';
import { ObservedFacts } from '../components/investigation/ObservedFacts';
import { EvidenceList } from '../components/investigation/EvidenceList';
import { PossibleCauses } from '../components/investigation/PossibleCauses';
import { DiagnosticSteps } from '../components/investigation/DiagnosticSteps';
import { TelemetryChart } from '../components/telemetry/TelemetryChart';
import { IncidentTimeline } from '../components/timeline/IncidentTimeline';
import { AuditTrail } from '../components/audit/AuditTrail';
import { CopilotChatPanel } from '../components/investigation/CopilotChatPanel';
import {
  AlertTriangle,
  Bot,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  Clock,
  ShieldCheck,
  BookOpen,
  History,
  FileText,
} from 'lucide-react';

export const Investigation: React.FC = () => {
  const { id = 'ANOM-004' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'telemetry'
    | 'logs'
    | 'procedures'
    | 'historical'
    | 'timeline'
    | 'audit'
    | 'copilot'
  >('overview');

  const [investigation, setInvestigation] = useState<InvestigationData | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([]);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Diagnostic steps local status
  const [diagnosticSteps, setDiagnosticSteps] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invData, telemData, tlData, audData, msgData] = await Promise.all([
        missionApi.getInvestigation(id),
        missionApi.getTelemetry(),
        missionApi.getTimeline(id),
        missionApi.getAuditTrail(id),
        missionApi.getCopilotMessages(),
      ]);
      setInvestigation(invData);
      setDiagnosticSteps(invData.diagnosticSteps);
      setTelemetry(telemData);
      setTimelineEvents(tlData);
      setAuditEvents(audData);
      setCopilotMessages(msgData);
    } catch (err) {
      setError('Failed to retrieve investigation telemetry records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleMarkReviewed = async () => {
    if (!investigation) return;
    await missionApi.markInvestigationReviewed(id);
    const updatedAudits = await missionApi.getAuditTrail(id);
    setAuditEvents(updatedAudits);
    setInvestigation({
      ...investigation,
      reviewed: true,
      anomaly: {
        ...investigation.anomaly,
        status: 'REVIEWED',
      },
    });
  };

  const handleToggleDiagnosticStep = (stepNumber: number) => {
    setDiagnosticSteps((prev) =>
      prev.map((s) => {
        if (s.stepNumber === stepNumber) {
          const nextStatus =
            s.status === 'COMPLETED'
              ? 'PENDING'
              : s.status === 'PENDING'
              ? 'IN_PROGRESS'
              : 'COMPLETED';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const handleSendCopilotMessage = async (query: string) => {
    setCopilotLoading(true);
    try {
      await missionApi.submitCopilotQuery(query);
      const updated = await missionApi.getCopilotMessages();
      setCopilotMessages(updated);
      const updatedAudits = await missionApi.getAuditTrail(id);
      setAuditEvents(updatedAudits);
    } finally {
      setCopilotLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-[#0c1524] rounded-lg animate-pulse w-1/2" />
        <div className="h-10 bg-[#0c1524] rounded-lg animate-pulse w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-[#0c1524] rounded-lg animate-pulse" />
          <div className="h-64 bg-[#0c1524] rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="p-8 text-center bg-[#0c1524] border border-rose-900/40 rounded-lg max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">
          Unable to Load Investigation
        </h2>
        <p className="text-xs text-slate-400 mb-4">{error || 'Record not found.'}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Layers },
    { key: 'telemetry', label: 'Telemetry', icon: Activity },
    { key: 'logs', label: 'Logs', icon: FileText },
    { key: 'procedures', label: 'Procedures', icon: BookOpen },
    { key: 'historical', label: 'Historical Incidents', icon: History },
    { key: 'timeline', label: 'Timeline', icon: Clock },
    { key: 'audit', label: 'Audit Trail', icon: ShieldCheck },
    { key: 'copilot', label: 'AI Copilot', icon: Bot },
  ];

  return (
    <div>
      {/* Header */}
      <InvestigationHeader
        anomaly={investigation.anomaly}
        confidence={investigation.confidence}
        reviewed={investigation.reviewed}
        onMarkReviewed={handleMarkReviewed}
      />

      {/* Workspace Tabs (from image.png screen 3) */}
      <div className="flex items-center gap-1.5 border-b border-[#1a2842] pb-px mb-6 overflow-x-auto select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-sky-400 text-sky-400 bg-[#0f1b2d] font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0c1524]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Overview (Primary Screen) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 2 Cards: Anomaly & AI Copilot (exact matching to image.png screen 3) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Box: Anomaly Card */}
            <div className="bg-[#0c1524] border border-rose-900/40 rounded-lg p-5 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-950/80 border border-rose-600/40 flex items-center justify-center text-rose-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                      Anomaly Detected
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {investigation.anomaly.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {investigation.anomaly.description}
                </p>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-3 border-t border-[#16233b]">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Detected At</span>
                    <span className="text-slate-200 font-semibold">14:32:15 UTC</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Subsystem</span>
                    <span className="text-sky-400 font-bold">
                      {investigation.anomaly.subsystem}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Severity</span>
                    <span className="text-rose-400 font-bold">HIGH</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-[#16233b]">
                <span className="font-mono text-[11px]">Spacecraft SC-01 • Bus A</span>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                >
                  Inspect Incident Timeline →
                </button>
              </div>
            </div>

            {/* Right Box: AI Copilot Card */}
            <div className="bg-[#0c1524] border border-purple-900/40 rounded-lg p-5 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-600/40 flex items-center justify-center text-purple-400">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Copilot Synthesis
                      </span>
                      <h3 className="text-base font-bold text-white">
                        Preliminary Assessment
                      </h3>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                    Confidence: {investigation.confidence.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {investigation.possibleExplanation}
                </p>

                {/* Interactive Action Chips from image.png */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => navigate('/evidence/TEL-4821')}
                    className="px-2.5 py-1 rounded bg-[#132238] hover:bg-sky-600 text-sky-300 hover:text-white border border-[#1e3458] text-xs font-mono flex items-center gap-1 transition-all"
                  >
                    <span>Show evidence</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className="px-2.5 py-1 rounded bg-[#132238] hover:bg-sky-600 text-sky-300 hover:text-white border border-[#1e3458] text-xs font-mono flex items-center gap-1 transition-all"
                  >
                    <span>Show timeline</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setActiveTab('copilot')}
                    className="px-2.5 py-1 rounded bg-[#1a1c35] hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-800/50 text-xs font-mono flex items-center gap-1 transition-all"
                  >
                    <span>What should I investigate next?</span>
                    <Sparkles className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-2 text-[11px] font-mono text-slate-500 border-t border-[#16233b] flex justify-between">
                <span>RAG Grounding: 8 telemetry &amp; flight rules docs</span>
                <span className="text-purple-400 font-semibold">Ready for operator query</span>
              </div>
            </div>
          </div>

          {/* Key Findings Metrics Row (from image.png screen 3) */}
          <KeyFindingsGrid findingsCount={investigation.findingsCount} />

          {/* Main 2-Column Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Hardware Verified Telemetry & Facts */}
            <div className="space-y-6">
              <ObservedFacts facts={investigation.observedFacts} />

              {/* Embedded Telemetry Visualization (Section 18) */}
              <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Correlated Telemetry Window
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    14:00 – 15:00 UTC
                  </span>
                </div>
                <TelemetryChart data={telemetry} compact={true} />
              </div>

              <EvidenceList evidence={investigation.evidence} />
            </div>

            {/* Column 2: Inferred Explanations & Traceable Diagnostic Steps */}
            <div className="space-y-6">
              <PossibleCauses
                possibleExplanation={investigation.possibleExplanation}
                aiExplanationDetail={investigation.aiExplanationDetail}
                hypotheses={investigation.keyHypotheses}
                onAskCopilot={() => setActiveTab('copilot')}
              />

              <DiagnosticSteps
                steps={diagnosticSteps}
                onToggleStep={handleToggleDiagnosticStep}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Telemetry Explorer */}
      {activeTab === 'telemetry' && (
        <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-[#16233b] mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Power &amp; Thermal Subsystem Telemetry
              </h3>
              <p className="text-xs text-slate-400">
                Synchronized 10Hz downlink telemetry stream
              </p>
            </div>
            <button
              onClick={() => navigate('/telemetry')}
              className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
            >
              Open Full Telemetry Explorer →
            </button>
          </div>
          <TelemetryChart data={telemetry} />
        </div>
      )}

      {/* Tab: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-5 shadow-md">
          <h3 className="text-base font-bold text-white mb-3">Subsystem Flight Logs</h3>
          <div className="bg-[#080d17] p-4 rounded border border-[#16233b] font-mono text-xs text-slate-300 space-y-2 max-h-96 overflow-y-auto">
            <div>
              <span className="text-slate-500">[14:30:12.100]</span>{' '}
              <span className="text-sky-400">INFO</span> [OBC_SEQ]: Main Bus Relay Closed
              (PWR_RELAY_PAYLOAD_ENABLE)
            </div>
            <div>
              <span className="text-slate-500">[14:31:00.450]</span>{' '}
              <span className="text-sky-400">INFO</span> [SPECTROMETER]: CCD Cooler
              Energized. Target temp -85°C.
            </div>
            <div>
              <span className="text-slate-500">[14:32:04.882]</span>{' '}
              <span className="text-amber-400">WARN</span> [FDIR_TASK]:
              Persistent temp elevation on Battery Module 1 (+8°C gradient).
            </div>
            <div>
              <span className="text-slate-500">[14:32:15.120]</span>{' '}
              <span className="text-rose-400">ALARM</span> [PWR_LIMIT]:
              PWR_BATT_CURR_01 crossed Red High (18.7A &gt; 18.5A limit).
            </div>
            <div>
              <span className="text-slate-500">[14:32:16.300]</span>{' '}
              <span className="text-slate-400">INFO</span> [COMM_BUFFER]: Downlink frame
              packet transmission delay 1.2s.
            </div>
            <div>
              <span className="text-slate-500">[14:33:42.000]</span>{' '}
              <span className="text-purple-400">AI_COPILOT</span>: Investigation package
              compiled with 8 correlated telemetry traces.
            </div>
          </div>
        </div>
      )}

      {/* Tab: Procedures */}
      {activeTab === 'procedures' && (
        <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-5 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Applicable Flight Rule Procedures
              </h3>
              <p className="text-xs text-slate-400">
                Contingency operating procedures matched by Mission Copilot RAG pipeline.
              </p>
            </div>
            <button
              onClick={() => navigate('/procedures')}
              className="text-xs text-sky-400 hover:underline"
            >
              Browse All Flight Procedures →
            </button>
          </div>
          <div className="p-4 rounded-lg bg-[#09101c] border border-[#1e2f4f]">
            <div className="flex items-center justify-between pb-2 border-b border-[#182845] mb-3">
              <span className="font-mono text-sm font-bold text-sky-400">
                SOP-OPS-PWR-204 (Rev 4.2)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Validated Flight Rule
              </span>
            </div>
            <div className="text-xs text-slate-300 font-semibold mb-2">
              Battery Thermal Mitigation &amp; Secondary Shunt Load Redistribution
            </div>
            <div className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4 font-mono">
              <div>1. Verify telemetry channel PWR_BATT_CURR_01 &gt; 17.5A for &gt; 90 seconds.</div>
              <div>2. Command secondary line heater bus (HEATER_BUS_B) to STANDBY mode.</div>
              <div>3. If temp remains &gt; 40°C after 180 seconds, request payload team to throttle spectrometer CCD cooling to 50% duty.</div>
              <div>4. Confirm battery current returns to &lt; 16.0A and thermal margin recovers above 6.0°C.</div>
              <div>5. File post-event anomaly review and update state-of-charge flight prediction.</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Historical Incidents */}
      {activeTab === 'historical' && (
        <div className="bg-[#0c1524] border border-[#1a2842] rounded-lg p-5 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#16233b] mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Similar Historical Precedents
              </h3>
              <p className="text-xs text-slate-400">
                Archived missions and past orbits with high vector semantic similarity.
              </p>
            </div>
            <button
              onClick={() => navigate('/historical')}
              className="text-xs text-sky-400 hover:underline"
            >
              Open Incident Archive →
            </button>
          </div>
          <div className="p-4 rounded-lg bg-[#09101c] border border-[#1e2f4f]">
            <div className="flex items-center justify-between pb-2 border-b border-[#182845] mb-2">
              <span className="font-mono text-sm font-bold text-sky-400">
                INC-102 (SC-01 Mission Day 48)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                89% Similarity
              </span>
            </div>
            <div className="text-xs text-slate-300 mb-2 font-medium">
              Battery Bus Thermal Rise during Payload Run
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Root cause: Secondary line heaters remained at 100% duty cycle while high-rate
              spectrometer started up.
            </p>
            <div className="text-xs font-mono text-emerald-400">
              Resolution: SOP-OPS-PWR-204 executed to disable heater tape during payload
              window. Temperature normalized in 8 minutes.
            </div>
          </div>
        </div>
      )}

      {/* Tab: Timeline */}
      {activeTab === 'timeline' && (
        <IncidentTimeline events={timelineEvents} />
      )}

      {/* Tab: Audit */}
      {activeTab === 'audit' && (
        <AuditTrail events={auditEvents} />
      )}

      {/* Tab: AI Copilot Chat */}
      {activeTab === 'copilot' && (
        <CopilotChatPanel
          messages={copilotMessages}
          onSendMessage={handleSendCopilotMessage}
          loading={copilotLoading}
        />
      )}
    </div>
  );
};
