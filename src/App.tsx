import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Anomalies } from './pages/Anomalies';
import { Investigation } from './pages/Investigation';
import { EvidencePage } from './pages/Evidence';
import { TelemetryPage } from './pages/Telemetry';
import { TimelinePage } from './pages/Timeline';
import { AuditPage } from './pages/Audit';
import { CopilotChatPage } from './pages/CopilotChat';
import { DemoModePage } from './pages/DemoMode';
import { ProceduresPage } from './pages/Procedures';
import { HistoricalIncidentsPage } from './pages/HistoricalIncidents';
import { SettingsPage } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Core Routes specified in build specification Section 7 */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/anomalies" element={<Anomalies />} />
        <Route path="/investigation/:id" element={<Investigation />} />
        <Route path="/evidence/:id" element={<EvidencePage />} />
        <Route path="/telemetry" element={<TelemetryPage />} />
        <Route path="/timeline/:id" element={<TimelinePage />} />
        <Route path="/audit/:id" element={<AuditPage />} />

        {/* Extended Screens from image.png */}
        <Route path="/copilot" element={<CopilotChatPage />} />
        <Route path="/demo" element={<DemoModePage />} />
        <Route path="/procedures" element={<ProceduresPage />} />
        <Route path="/historical" element={<HistoricalIncidentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
