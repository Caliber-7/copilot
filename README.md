# Mission Operations Copilot — SC-01 Spacecraft Workstation

[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3.10-22c55e)](https://recharts.org/)

An aerospace-grade mission control operations workstation built for spacecraft anomaly investigation, real-time telemetry analysis, temporal event correlation, and AI-assisted diagnostics.

---

## 🚀 Key Features & Workstation Modules

### 1. Mission Dashboard
- **Spacecraft State**: Real-time telemetry monitoring for **SC-01** (Mission Day 142) with synchronized UTC clock and simulation safety boundary indicator.
- **Subsystem Metrics**: Live status cards for `POWER`, `THERMAL`, `COMMUNICATION`, and `ATTITUDE` with primary and secondary channel readouts and trend vectors.
- **Mission Progress & Timeline**: Circular orbital progress indicator (78%) and milestone timeline from Launch to Mission End.
- **Active Investigation Queue**: Quick-launch queue linking directly to ongoing anomaly investigations.

### 2. Anomaly Center
- Comprehensive anomaly registry with multi-parameter filtering:
  - Severity: `High`, `Medium`, `Low`
  - Subsystems: `Power`, `Thermal`, `Communication`, `Attitude`, `Payload`
  - Status: `Investigating`, `New`, `Evidence Collected`, `Closed`
  - Full-text search and paginated anomaly inspection.

### 3. Investigation Workspace (Centerpiece)
- **Verified Facts vs. AI Hypotheses**: Strict visual separation between hardware-verified telemetry data and AI-generated inferences.
- **Multi-Tab Investigation Console**:
  - `Overview`: Anomaly alert card, AI Copilot synthesis, Key findings metrics, observed facts, embedded telemetry preview, and traceable diagnostic steps.
  - `Telemetry`: High-rate 10Hz synchronized engineering time series.
  - `Logs`: Subsystem OBC sequencer and FDIR threshold trip logs.
  - `Procedures`: Contingency flight rules (e.g. `SOP-OPS-PWR-204`).
  - `Historical Incidents`: Case-based reasoning matches (e.g. `INC-102` with 89% similarity).
  - `Timeline`: Chronological cross-subsystem event sequence.
  - `Audit Trail`: Immutable record of operator actions and RAG retrievals.
  - `AI Copilot`: Interactive diagnostic assistant.
- **Operator Sign-Off**: Interactive **"Mark as Reviewed"** capability that updates workstation status and logs the action to the audit trail.

### 4. Evidence Explorer
- Master-detail telemetry packet inspector (`TEL-4821`, `TEL-4830`, `LOG-223`, `PWR-204`, `INC-102`).
- Sparkline trend visualizations, expected range tolerances, and a **"View Original Record"** raw telemetry viewer.

### 5. Telemetry Explorer
- Parameter multi-channel selector with independent toggles (Current, Temp, Voltage, State of Charge, Thermal Margin, etc.).
- Dual-axis engineering charts with flagged anomaly windows.

### 6. Demo Mode
- Single-click presentation launcher that pre-populates all simulated telemetry streams, mission logs, flight rules, and AI investigation packages for live judging.

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Server**: Vite 6
- **Styling**: Tailwind CSS (Aerospace Dark Mission Control Theme)
- **Charts**: Recharts (Dual-axis, reference areas, custom telemetry tooltips)
- **Icons**: Lucide React
- **Routing**: React Router DOM v7

---

## 📁 Project Structure

```text
copilot/
├── src/
│   ├── components/
│   │   ├── anomalies/       # Anomaly table, filters, and severity badges
│   │   ├── audit/           # Immutable audit trail table
│   │   ├── dashboard/       # Metric cards, subsystem status, alerts, queue
│   │   ├── evidence/        # Telemetry detail cards and raw packet modal
│   │   ├── investigation/   # Workspace header, observed facts, hypotheses, diagnostic steps
│   │   ├── layout/          # AppShell, Sidebar, Topbar, PageHeader
│   │   ├── telemetry/       # Parameter toggles and dual-axis chart
│   │   └── timeline/        # Chronological event stream
│   ├── data/
│   │   └── mockData.ts      # Spacecraft telemetry and incident dataset
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Anomalies.tsx
│   │   ├── Investigation.tsx
│   │   ├── Evidence.tsx
│   │   ├── Telemetry.tsx
│   │   ├── Timeline.tsx
│   │   ├── Audit.tsx
│   │   ├── CopilotChat.tsx
│   │   ├── DemoMode.tsx
│   │   ├── Procedures.tsx
│   │   ├── HistoricalIncidents.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   └── api.ts           # Modular API layer (ready for FastAPI integration)
│   ├── types/
│   │   └── mission.ts       # Domain TypeScript interfaces
│   ├── App.tsx              # Application route mapping
│   ├── main.tsx             # React entry point
│   └── index.css            # Custom console styling
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚦 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Caliber-7/copilot.git
cd copilot

# Install dependencies
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Production Build
```bash
npm run build
npm run preview
```

---

## 🔒 Safety Boundary Disclaimer

> **SIMULATION ENVIRONMENT — NO SPACECRAFT COMMAND EXECUTION**
>
> This application is an investigation and decision-support system. It provides traceable recommendations and telemetry diagnostics only. It does not contain capabilities to transmit real spacecraft hardware commands.
