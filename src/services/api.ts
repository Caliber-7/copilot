import {
  Anomaly,
  SubsystemStatus,
  Evidence,
  TelemetryPoint,
  TimelineEvent,
  AuditEvent,
  InvestigationData,
  Procedure,
  HistoricalIncident,
  CopilotMessage,
} from '../types/mission';
import {
  mockAnomalies,
  mockSubsystems,
  mockEvidenceList,
  mockTelemetryData,
  mockTimelineEvents,
  mockAuditEvents,
  mockInvestigationANOM004,
  mockProcedures,
  mockHistoricalIncidents,
  initialCopilotMessages,
} from '../data/mockData';

const SIMULATED_LATENCY_MS = 60;

// Delay helper to test loading states cleanly
const delay = <T>(data: T, ms = SIMULATED_LATENCY_MS): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

// Active memory store for demo mutations (marking reviewed, adding copilot messages, etc.)
let localAnomalies = [...mockAnomalies];
let localInvestigation = { ...mockInvestigationANOM004 };
let localAuditEvents = [...mockAuditEvents];
let localCopilotMessages = [...initialCopilotMessages];

export const missionApi = {
  // Subsystem statuses for Dashboard
  async getSubsystems(): Promise<SubsystemStatus[]> {
    return delay([...mockSubsystems]);
  },

  // Anomalies list
  async getAnomalies(filters?: {
    severity?: string;
    subsystem?: string;
    status?: string;
    search?: string;
  }): Promise<Anomaly[]> {
    let result = [...localAnomalies];
    if (filters) {
      if (filters.severity && filters.severity !== 'ALL') {
        result = result.filter(
          (a) => a.severity.toUpperCase() === filters.severity?.toUpperCase()
        );
      }
      if (filters.subsystem && filters.subsystem !== 'ALL') {
        result = result.filter(
          (a) => a.subsystem.toUpperCase() === filters.subsystem?.toUpperCase()
        );
      }
      if (filters.status && filters.status !== 'ALL') {
        result = result.filter(
          (a) =>
            a.status.toUpperCase() === filters.status?.toUpperCase() ||
            a.investigationStatus?.toUpperCase() === filters.status?.toUpperCase()
        );
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (a) =>
            a.id.toLowerCase().includes(q) ||
            a.title.toLowerCase().includes(q) ||
            a.subsystem.toLowerCase().includes(q) ||
            a.description?.toLowerCase().includes(q)
        );
      }
    }
    return delay(result);
  },

  // Single anomaly
  async getAnomaly(id: string): Promise<Anomaly | undefined> {
    const item = localAnomalies.find((a) => a.id.toLowerCase() === id.toLowerCase());
    return delay(item);
  },

  // Investigation Workspace data
  async getInvestigation(anomalyId: string): Promise<InvestigationData> {
    // If querying for another anomaly, clone template with adapted details
    if (anomalyId.toUpperCase() === 'ANOM-004' || !anomalyId) {
      return delay({ ...localInvestigation });
    }
    const matched = localAnomalies.find((a) => a.id.toLowerCase() === anomalyId.toLowerCase());
    const adapted: InvestigationData = {
      ...localInvestigation,
      id: `INV-${anomalyId.toUpperCase()}`,
      anomalyId: anomalyId.toUpperCase(),
      anomaly: matched || {
        id: anomalyId.toUpperCase(),
        title: `Anomaly ${anomalyId}`,
        subsystem: 'GENERAL',
        severity: 'MEDIUM',
        status: 'INVESTIGATING',
        timestamp: '14:00:00',
      },
    };
    return delay(adapted);
  },

  // Mark investigation as reviewed
  async markInvestigationReviewed(anomalyId: string): Promise<boolean> {
    localInvestigation.reviewed = true;
    localInvestigation.anomaly.status = 'REVIEWED';
    localInvestigation.anomaly.investigationStatus = 'Under Review';
    const idx = localAnomalies.findIndex((a) => a.id.toLowerCase() === anomalyId.toLowerCase());
    if (idx !== -1) {
      localAnomalies[idx] = {
        ...localAnomalies[idx],
        status: 'REVIEWED',
        investigationStatus: 'Under Review',
      };
    }
    // Add audit event
    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
      actor: 'OPERATOR',
      actorName: 'Flight Director Ops-1',
      action: 'Marked as Reviewed',
      object: anomalyId,
      result: 'Success',
      details: 'Operator validated findings and signed off on diagnostic procedure PWR-204.',
    };
    localAuditEvents = [newAudit, ...localAuditEvents];
    return delay(true);
  },

  // Evidence list and single item
  async getEvidenceList(type?: string): Promise<Evidence[]> {
    if (!type || type === 'ALL') {
      return delay([...mockEvidenceList]);
    }
    return delay(
      mockEvidenceList.filter((e) => e.source.toLowerCase().includes(type.toLowerCase()))
    );
  },

  async getEvidence(id: string): Promise<Evidence | undefined> {
    const item = mockEvidenceList.find((e) => e.id.toLowerCase() === id.toLowerCase());
    return delay(item);
  },

  // Telemetry series
  async getTelemetry(timeRange = '2h'): Promise<TelemetryPoint[]> {
    return delay([...mockTelemetryData]);
  },

  // Timeline events
  async getTimeline(incidentId?: string): Promise<TimelineEvent[]> {
    return delay([...mockTimelineEvents]);
  },

  // Audit trail
  async getAuditTrail(incidentId?: string): Promise<AuditEvent[]> {
    return delay([...localAuditEvents]);
  },

  // Procedures
  async getProcedures(): Promise<Procedure[]> {
    return delay([...mockProcedures]);
  },

  async getProcedure(id: string): Promise<Procedure | undefined> {
    return delay(mockProcedures.find((p) => p.id.toLowerCase() === id.toLowerCase()));
  },

  // Historical incidents
  async getHistoricalIncidents(): Promise<HistoricalIncident[]> {
    return delay([...mockHistoricalIncidents]);
  },

  // AI Copilot interactions
  async getCopilotMessages(): Promise<CopilotMessage[]> {
    return delay([...localCopilotMessages]);
  },

  async submitCopilotQuery(query: string): Promise<CopilotMessage> {
    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString().substring(11, 19),
      text: query,
    };
    localCopilotMessages.push(userMsg);

    // AI synthesis
    let replyText = '';
    let supportingEvidence = mockEvidenceList.slice(0, 3).map((e) => ({
      id: e.id,
      label: e.parameter || e.source,
      value: e.value,
      expected: e.expectedRange,
    }));
    let suggestedActions = ['Show evidence', 'Show timeline', 'View procedure PWR-204'];

    const q = query.toLowerCase();
    if (q.includes('procedure') || q.includes('pwr-204')) {
      replyText =
        'Procedure SOP-OPS-PWR-204 ("Battery Load Shedding & Thermal Regulation") is the primary flight rule. Step 2 recommends disabling secondary line heater bus (HEATER_BUS_B) to reduce draw by ~2.8A, which restores thermal margin within 8 minutes.';
      suggestedActions = ['View SOP-OPS-PWR-204 in detail', 'Check line heater status'];
    } else if (q.includes('historical') || q.includes('similar') || q.includes('inc-102')) {
      replyText =
        'Historical incident INC-102 from Mission Day 48 demonstrates an 89% pattern similarity. During that pass, line heaters and spectrometer cooling collided, resulting in an identical +8.0°C rise. The team executed load shedding without interrupting main payload data collection.';
      suggestedActions = ['Compare telemetry with INC-102', 'Open incident report'];
    } else if (q.includes('timeline') || q.includes('when')) {
      replyText =
        'Chronology shows the payload bus relay closed at 14:30:12 UTC. Current rose to 18.7A by 14:32:00, leading to thermocouple #2 tripping at 14:32:04, followed immediately by FDIR warning at 14:32:15.';
      suggestedActions = ['Jump to timeline', 'Inspect FDIR event'];
    } else {
      replyText =
        `Regarding "${query}": Analysis of SC-01 telemetry indicates that battery current surged to 18.7A (+22% above baseline). Combined with thermal bus dissipation limits, this caused the observed cell temperature increase to 43°C. All other spacecraft buses remain within nominal operating tolerances.`;
    }

    const aiMsg: CopilotMessage = {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toISOString().substring(11, 19),
      text: replyText,
      supportingEvidence,
      confidence: 0.84,
      sourcesCount: 4,
      suggestedActions,
    };

    localCopilotMessages.push(aiMsg);

    // Record in audit log
    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
      actor: 'AI',
      actorName: 'Mission Copilot',
      action: 'Copilot query answered',
      object: 'ANOM-004',
      evidenceCount: `${supportingEvidence.length} sources`,
      result: 'Success',
      details: `Answered: "${query.substring(0, 40)}..."`,
    };
    localAuditEvents = [audit, ...localAuditEvents];

    return delay(aiMsg, 120);
  },

  // Reset to demo state
  async resetDemoScenario(): Promise<boolean> {
    localAnomalies = [...mockAnomalies];
    localInvestigation = { ...mockInvestigationANOM004, reviewed: false };
    localAuditEvents = [...mockAuditEvents];
    localCopilotMessages = [...initialCopilotMessages];
    return delay(true, 100);
  },
};
