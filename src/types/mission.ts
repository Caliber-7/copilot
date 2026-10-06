export type Severity = 'CRITICAL' | 'WARNING' | 'INFO' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AnomalyStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'EVIDENCE_COLLECTED'
  | 'REVIEWED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'NEW';

export interface Anomaly {
  id: string;
  title: string;
  subsystem: 'POWER' | 'THERMAL' | 'COMM' | 'ATTITUDE' | 'PAYLOAD' | 'FDIR' | string;
  severity: Severity;
  status: AnomalyStatus;
  timestamp: string;
  detectedAt?: string;
  confidence?: number;
  description?: string;
  affectedComponents?: string[];
  investigationStatus?: 'In Progress' | 'Not Started' | 'Closed' | 'Under Review';
}

export interface SubsystemStatus {
  id: string;
  name: string;
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  primaryParameter: string;
  primaryValue: string;
  secondaryParameter?: string;
  secondaryValue?: string;
  trend?: string;
  lastUpdated: string;
  healthPercent: number;
}

export interface Evidence {
  id: string;
  source: 'Telemetry' | 'Mission Log' | 'Procedure' | 'Historical Incident' | 'RAG';
  subsystem: string;
  parameter?: string;
  value: string;
  timestamp: string;
  expectedRange?: string;
  unit?: string;
  status?: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  relevance: number;
  description?: string;
  rawRecord?: Record<string, any> | string;
  sparklineData?: number[];
  relatedEvidenceIds?: string[];
}

export interface TelemetryPoint {
  timestamp: string; // e.g. "14:00", "14:05"
  timeMinutes: number;
  batteryCurrent: number; // A
  batteryTemperature: number; // °C
  batteryVoltage: number; // V
  stateOfCharge: number; // %
  solarArrayCurrent: number; // A
  componentTemperature: number; // °C
  radiatorTemperature: number; // °C
  thermalMargin: number; // °C
  signalStrength: number; // dBm
  packetLoss: number; // %
  isAnomaly?: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  description: string;
  source: 'Telemetry' | 'Log' | 'FDIR' | 'RAG' | 'System' | 'AI Copilot' | 'Operator';
  subsystem?: string;
  severity?: Severity;
  relatedEvidenceId?: string;
  details?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: 'OPERATOR' | 'SYSTEM' | 'AI';
  actorName?: string;
  action: string;
  object: string;
  evidenceCount?: string;
  result: 'Success' | 'Warning' | 'Failed';
  details?: string;
}

export interface DiagnosticStep {
  stepNumber: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  procedureRef?: string;
}

export interface ObservedFact {
  id: string;
  parameter: string;
  value: string;
  note: string;
  direction?: 'up' | 'down' | 'steady';
  status: 'nominal' | 'warning' | 'critical';
}

export interface InvestigationData {
  id: string;
  anomalyId: string;
  anomaly: Anomaly;
  confidence: number;
  confidenceLabel: string;
  confidenceExplanation: string;
  observedFacts: ObservedFact[];
  evidence: Evidence[];
  possibleExplanation: string;
  aiExplanationDetail: string;
  diagnosticSteps: DiagnosticStep[];
  findingsCount: {
    observedFacts: number;
    inferences: number;
    recommendations: number;
    evidence: number;
  };
  keyHypotheses: Array<{
    cause: string;
    probability: number;
    rationale: string;
  }>;
  reviewed: boolean;
}

export interface Procedure {
  id: string;
  title: string;
  subsystem: string;
  revision: string;
  purpose: string;
  steps: string[];
}

export interface HistoricalIncident {
  id: string;
  date: string;
  title: string;
  subsystem: string;
  similarity: number;
  resolution: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  supportingEvidence?: Array<{
    id: string;
    label: string;
    value: string;
    expected?: string;
  }>;
  confidence?: number;
  sourcesCount?: number;
  suggestedActions?: string[];
}
