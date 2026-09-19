import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Layers,
  Cpu,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Database,
  ArrowRight,
  Sparkles,
  Server,
  FileCode,
  Search,
  Lock,
  RefreshCw,
  Clock,
  Terminal,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Check,
  X,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  Sliders,
  BookOpen,
  Merge,
  Maximize2
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Type definitions for interactive architecture elements
interface PipelineNode {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  color: 'blue' | 'cyan' | 'purple' | 'amber' | 'emerald' | 'red';
}

export const ArchitecturePage: React.FC = () => {
  const [activePipelineNode, setActivePipelineNode] = useState<string>('normalization');
  const [alertsMerged, setAlertsMerged] = useState<boolean>(true);
  const [selectedPolicyRisk, setSelectedPolicyRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED'>('HIGH');
  const [approvalState, setApprovalState] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationPassed, setVerificationPassed] = useState<boolean>(true);

  // Pipeline nodes definition
  const pipelineNodes: PipelineNode[] = [
    {
      id: 'ingestion',
      title: 'Event Ingestion',
      subtitle: 'FastAPI Webhook Server',
      badge: 'INPUT LAYER',
      description: 'Ingests async telemetry signals from application logs, GitHub deployment webhooks, and active health checks via high-throughput HTTP endpoints.',
      icon: Terminal,
      color: 'blue'
    },
    {
      id: 'normalization',
      title: 'Normalization',
      subtitle: 'Canonical Schema',
      badge: 'ETL STAGE 1',
      description: 'Convert GitHub, application and simulator events into one internal event schema.',
      icon: RefreshCw,
      color: 'cyan'
    },
    {
      id: 'filtering',
      title: 'Noise Filtering',
      subtitle: 'Signal Cleansing',
      badge: 'ETL STAGE 2',
      description: 'Remove low-value signals before AI processing.',
      icon: Sliders,
      color: 'purple'
    },
    {
      id: 'deduplication',
      title: 'Deduplication',
      subtitle: 'Window Fingerprinting',
      badge: 'ETL STAGE 3',
      description: 'Fingerprint repeated events and group duplicates within time windows.',
      icon: Layers,
      color: 'amber'
    },
    {
      id: 'correlation',
      title: 'Alert Correlation',
      subtitle: 'Graph & Time Topology',
      badge: 'ETL STAGE 4',
      description: 'Use time, service relationships and error relationships to connect related alerts.',
      icon: GitBranch,
      color: 'emerald'
    },
    {
      id: 'incident',
      title: 'Incident Creation',
      subtitle: 'Unified Context Cluster',
      badge: 'OUTPUT STAGE',
      description: 'Synthesizes correlated signal clusters into a single canonical incident object ready for AI investigation.',
      icon: AlertTriangle,
      color: 'red'
    }
  ];

  const policyMatrix = [
    { action: 'CLEAR_CACHE', risk: 'LOW', target: 'Payment Redis Cluster', status: 'AUTO-APPROVED', color: 'emerald' },
    { action: 'RESTART_SERVICE', risk: 'MEDIUM', target: 'Payment API Container', status: 'GUARDED EXECUTION', color: 'amber' },
    { action: 'SCALE_SERVICE', risk: 'MEDIUM', target: 'Worker Replicas (+3)', status: 'GUARDED EXECUTION', color: 'amber' },
    { action: 'ROLLBACK_DEPLOYMENT', risk: 'HIGH', target: 'Payment App v2.4.1 → v2.4.0', status: 'REQUIRES HUMAN APPROVAL', color: 'red' },
    { action: 'DELETE_DATABASE', risk: 'BLOCKED', target: 'Production Database', status: 'HARD BLOCKED BY ENGINE', color: 'purple' }
  ];

  const activeNodeData = pipelineNodes.find((n) => n.id === activePipelineNode) || pipelineNodes[1];

  const handleVerifyToggle = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationPassed((prev) => !prev);
    }, 800);
  };

  return (
    <div className="min-h-screen dark-pitch-bg dark-grid-bg text-slate-100 font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      
      {/* Background Ambient Lighting Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] dark-grid-glow pointer-events-none z-0" />
      <div className="fixed top-[1200px] right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[160px] pointer-events-none z-0" />
      <div className="fixed top-[2400px] left-0 w-[500px] h-[500px] bg-cyan-600/5 blur-[160px] pointer-events-none z-0" />

      {/* FIXED MINIMAL NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel-dark border-b border-slate-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-extrabold text-sm tracking-wider text-slate-100 flex items-center gap-2">
                SENTINEL-X <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 uppercase">Architecture Spec</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Section Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono font-medium text-slate-400">
          <a href="#system-architecture" className="hover:text-cyan-400 transition-colors">1. Architecture</a>
          <a href="#event-pipeline" className="hover:text-cyan-400 transition-colors">2. Pipeline</a>
          <a href="#ai-investigation" className="hover:text-cyan-400 transition-colors">3. Investigation</a>
          <a href="#decision-safety" className="hover:text-cyan-400 transition-colors">4. Decision Policy</a>
          <a href="#remediation-verification" className="hover:text-cyan-400 transition-colors">5. Remediation</a>
          <a href="#closed-loop" className="hover:text-cyan-400 transition-colors">6. Closed Loop</a>
        </div>

        {/* CTA to Main App */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-mono font-semibold transition-all cursor-pointer shadow-xs hover:border-cyan-400"
          >
            <span>Open Dashboard</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32 relative z-10">

        {/* ==================================================
            1. HERO SECTION
           ================================================== */}
        <section id="hero" className="space-y-12 text-center pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Open-Source Incident Resolution Engine for Small Apps</span>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
              From Alert Overload to <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400">
                Autonomous Incident Resolution
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto">
              An open-source decision-making layer for small applications.
            </p>

            <div className="inline-block glass-panel-dark px-6 py-3.5 rounded-2xl border border-slate-800/80 text-xs sm:text-sm font-mono text-cyan-300/90 shadow-xl">
              “Collect signals. Correlate incidents. Investigate with evidence. Recommend safe actions. Verify recovery.”
            </div>
          </div>

          {/* HORIZONTAL ARCHITECTURE FLOW PIPELINE */}
          <div className="glass-panel-dark p-6 sm:p-8 rounded-2xl border border-slate-800/90 shadow-2xl relative overflow-hidden">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest text-left mb-6 font-bold flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="flex items-center gap-2 text-cyan-400">
                <Activity className="w-4 h-4" /> Autonomous Execution Pipeline
              </span>
              <span className="text-slate-500 text-[10px]">PITCH VISUALIZATION STEP 1 OF 7</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 items-center relative">
              {[
                { step: '01', title: 'APPLICATION', desc: 'Telemetry Logs', color: 'border-slate-700 text-slate-300 bg-slate-900/60' },
                { step: '02', title: 'SIGNALS', desc: 'Logs + Webhooks', color: 'border-blue-500/40 text-blue-400 bg-blue-950/40' },
                { step: '03', title: 'INCIDENT', desc: '5 Alerts → 1 Incident', color: 'border-amber-500/40 text-amber-400 bg-amber-950/40' },
                { step: '04', title: 'AI INVESTIGATION', desc: 'Groq + RAG Docs', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40' },
                { step: '05', title: 'DECISION', desc: 'Policy Matrix', color: 'border-purple-500/40 text-purple-400 bg-purple-950/40' },
                { step: '06', title: 'REMEDIATION', desc: 'Safe Auto/Human', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-950/40' },
                { step: '07', title: 'VERIFIED', desc: 'Metrics Pass', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40' }
              ].map((item, idx) => (
                <div key={item.step} className="relative flex flex-col items-center group">
                  <div className={`w-full p-3 rounded-xl border text-center font-mono space-y-1 transition-all duration-300 hover:scale-105 ${item.color}`}>
                    <span className="text-[10px] text-slate-400 block font-bold">{item.step}</span>
                    <span className="text-xs font-extrabold block truncate tracking-wide">{item.title}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{item.desc}</span>
                  </div>

                  {/* Flow Arrow for desktop */}
                  {idx < 6 && (
                    <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                      <ChevronRight className="w-4 h-4 text-cyan-500/60 animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Subtle animated particles moving along flow path */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Telemetry Ingest Active
              </span>
              <span className="text-slate-400">Target SLA: &lt; 15s Detection-to-Verification</span>
            </div>
          </div>
        </section>


        {/* ==================================================
            2. SYSTEM ARCHITECTURE & PROCESSING PIPELINE
           ================================================== */}
        <section id="system-architecture" className="space-y-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-950/80 border border-blue-800/60 text-xs font-mono text-blue-400">
              <Layers className="w-3.5 h-3.5" /> CORE ARCHITECTURE SPECIFICATION
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              System Architecture
            </h2>
            <p className="text-slate-400 text-base max-w-3xl">
              From raw operational signals to verified incident resolution.
            </p>
          </div>

          {/* INPUT LAYER & PROCESSING PIPELINE DIAGRAM */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* INPUT LAYER (Left side cards) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>1. Multi-Signal Ingestion Layer</span>
                <span className="text-cyan-400 text-[10px]">3 Sources</span>
              </div>

              {/* Source Card 1 */}
              <div className="glass-panel-dark p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all space-y-2 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-400 flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" /> Developer App
                  </span>
                  <span className="text-[10px] font-mono bg-blue-950 px-2 py-0.5 rounded text-blue-300 border border-blue-800/50">LOG STREAMS</span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Application Logs, Exception Traces, HTTP Status Telemetry
                </p>
              </div>

              {/* Source Card 2 */}
              <div className="glass-panel-dark p-4 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all space-y-2 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-purple-400" /> GitHub Repository
                  </span>
                  <span className="text-[10px] font-mono bg-purple-950 px-2 py-0.5 rounded text-purple-300 border border-purple-800/50">WEBHOOKS</span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Push Events, Deployment Commits, PR Merges, Workflow Signals
                </p>
              </div>

              {/* Source Card 3 */}
              <div className="glass-panel-dark p-4 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all space-y-2 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" /> Event Simulator
                  </span>
                  <span className="text-[10px] font-mono bg-amber-950 px-2 py-0.5 rounded text-amber-300 border border-amber-800/50">MONITORING API</span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Controlled Chaos Injection, Synthetic Probes & SLA Checks
                </p>
              </div>
            </div>

            {/* PROCESSING PIPELINE NODES (Right side pipeline stream) */}
            <div id="event-pipeline" className="lg:col-span-8 glass-panel-dark p-6 rounded-2xl border border-slate-800/90 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" /> 2. FastAPI Pipeline Stages (Click Node to Inspect)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Interactive Visual Map</span>
              </div>

              {/* Node grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {pipelineNodes.map((node) => {
                  const Icon = node.icon;
                  const isActive = activePipelineNode === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setActivePipelineNode(node.id)}
                      className={`p-3.5 rounded-xl text-left border font-mono transition-all cursor-pointer relative overflow-hidden ${
                        isActive
                          ? 'glass-panel-cyan border-cyan-400/80 shadow-lg scale-102'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {node.badge}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white block truncate">{node.title}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{node.subtitle}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Node Explanation Panel */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNodeData.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" /> Node Deep Dive: {activeNodeData.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {activeNodeData.subtitle}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-200 leading-relaxed">
                    “{activeNodeData.description}”
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>


        {/* ==================================================
            3. INCIDENT CREATION & ALERT CLUSTERING
           ================================================== */}
        <section id="incident-creation" className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950/80 border border-amber-800/60 text-xs font-mono text-amber-400">
              <Merge className="w-3.5 h-3.5" /> SIGNAL CLUSTERING ENGINE
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Incident Creation & Alert Consolidation
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl">
              Converting 5 fragmented operational alerts into 1 unified incident context.
            </p>
          </div>

          <div className="glass-panel-dark p-6 sm:p-8 rounded-2xl border border-slate-800/90 space-y-8">
            {/* PROMINENT VISUAL MESSAGE BANNER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-red-950/40 to-slate-950 border border-amber-500/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-extrabold font-mono text-lg shrink-0">
                  ⚡
                </div>
                <div>
                  <span className="text-sm font-extrabold font-mono text-amber-300 block tracking-wider">
                    5 ALERTS → 1 INCIDENT
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    Reduces noise by 80% using temporal proximity & service topology mapping.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setAlertsMerged(!alertsMerged)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 cursor-pointer transition-colors shrink-0 flex items-center gap-2"
              >
                <Merge className="w-3.5 h-3.5 text-cyan-400" />
                <span>{alertsMerged ? 'Expand 5 Alerts' : 'Merge into 1 Incident'}</span>
              </button>
            </div>

            {/* INCIDENT CARD DEMO */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: The Unified Incident Card */}
              <div className="lg:col-span-7 glass-panel-red p-6 rounded-xl border border-red-500/40 space-y-5">
                <div className="flex items-center justify-between border-b border-red-900/50 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-red-400 text-sm">INC-001</span>
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      PAYMENT SERVICE DEGRADATION
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-800">
                      CRITICAL
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                      INVESTIGATING
                    </span>
                  </div>
                </div>

                {/* Incident Timeline */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Correlated Signal Timeline</div>
                  <div className="space-y-2">
                    {[
                      { time: '10:00', event: 'GitHub Deployment v2.4.1 pushed by @alex', icon: GitBranch, color: 'text-purple-400' },
                      { time: '10:02', event: 'Memory Spike (94% heap utilization)', icon: Activity, color: 'text-amber-400' },
                      { time: '10:04', event: 'DB Connection Exhaustion (100/100 pool)', icon: Database, color: 'text-red-400' },
                      { time: '10:06', event: 'API Latency Spike (4.8 sec p99)', icon: Clock, color: 'text-red-400' },
                      { time: '10:08', event: 'Payment Failure (31% checkout error rate)', icon: X, color: 'text-red-500 font-bold' }
                    ].map((t, idx) => {
                      const IconComp = t.icon;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-slate-800/80">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-bold text-slate-400 w-10">{t.time}</span>
                            <IconComp className={`w-3.5 h-3.5 ${t.color}`} />
                            <span className={`text-xs ${t.color}`}>{t.event}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">CORRELATED</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Correlation Graph */}
              <div className="lg:col-span-5 bg-slate-950/90 p-5 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Topology Graph Relationship
                  </span>
                  <p className="text-xs font-mono text-slate-300 leading-relaxed">
                    Correlation engine links logs across time windows, shared service dependencies, and error trace IDs to build single incident state.
                  </p>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Total Raw Signals</span>
                    <span className="font-bold text-amber-400">5 Events</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Fingerprint Cluster ID</span>
                    <span className="font-bold text-cyan-400">fp_pay_mem_db_091</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Generated Incidents</span>
                    <span className="font-bold text-emerald-400">1 Incident</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ==================================================
            4. AI INVESTIGATION & RAG KNOWLEDGE BASE
           ================================================== */}
        <section id="ai-investigation" className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-800/60 text-xs font-mono text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" /> EVIDENCE-GROUNDED AI REASONING
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              AI Investigation & RAG Retrieval
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl">
              Synthesizing live incident signals with historical knowledge bases using Groq LLM.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* RAG Knowledge Base Panel */}
            <div className="lg:col-span-5 glass-panel-cyan p-6 rounded-2xl border border-cyan-500/40 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-cyan-900/60">
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" /> RAG Knowledge Base
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    VECTOR STORE
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-300 leading-relaxed mb-4">
                  Deterministic retrieval passes grounded documentation into the LLM context window.
                </p>

                <div className="space-y-2 font-mono text-xs">
                  {[
                    { label: 'ERROR CODES', detail: 'ERR_DB_POOL_EXHAUSTED' },
                    { label: 'TROUBLESHOOTING DOCS', detail: 'SOP-042 Memory Leaks' },
                    { label: 'SERVICE DOCUMENTATION', detail: 'Payment Microservice Spec' },
                    { label: 'HISTORICAL INCIDENTS', detail: 'INC-883 Deployment Leak' },
                    { label: 'KNOWN RESOLUTIONS', detail: 'Rollback v2.4.1 Script' }
                  ].map((doc, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-950/90 border border-cyan-900/50 flex items-center justify-between text-cyan-100">
                      <span className="text-[11px] font-bold text-cyan-400">{doc.label}</span>
                      <span className="text-[10px] text-slate-400">{doc.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hybrid Retrieval Formula Card */}
              <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-[11px] font-mono text-cyan-200 text-center font-bold">
                EXACT ERROR CODE + METADATA FILTER + SEMANTIC SIMILARITY = RELEVANT CONTEXT
              </div>
            </div>

            {/* Groq LLM Investigator Node */}
            <div className="lg:col-span-7 glass-panel-dark p-6 rounded-2xl border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-mono font-extrabold text-white">Groq LLM Investigator</span>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                  Llama 3 70B Engine
                </span>
              </div>

              {/* Generated Hypotheses & Evidence Comparison */}
              <div className="space-y-3 font-mono text-xs">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Investigator Output Data Structure</div>
                
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-purple-400 block">1. Hypotheses Evaluated:</span>
                  <div className="text-slate-300 text-[11px] space-y-1">
                    <p>• H1: Memory leak introduced in release v2.4.1 commit <code className="text-cyan-300">#4f892a</code> (Matched)</p>
                    <p>• H2: External payment gateway API outage (Contradicted by 200 OK healthchecks)</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-amber-400 block">2. RCA Explanation:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Deployment v2.4.1 contains unclosed DB connection handles in the payment webhook listener thread pool. Under load, connections exhaust within 4 minutes, causing memory buildup and API timeouts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ==================================================
            5. ROOT CAUSE & EVIDENCE EVALUATION
           ================================================== */}
        <section id="root-cause" className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-950/80 border border-purple-800/60 text-xs font-mono text-purple-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> PROBABLE ROOT CAUSE & CONFIDENCE
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Evidence Evaluation Engine
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl">
              Calculating deterministic confidence scores based on empirical evidence.
            </p>
          </div>

          <div className="glass-panel-dark p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left side: Root Cause Display + Confidence Circular Dial */}
              <div className="md:col-span-5 glass-panel-cyan p-6 rounded-xl border border-cyan-500/40 text-center space-y-4">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                  PROBABLE ROOT CAUSE
                </span>
                
                <h3 className="text-lg font-mono font-extrabold text-white">
                  Recent Deployment <span className="text-cyan-300">v2.4.1</span>
                </h3>

                {/* Circular Confidence Meter */}
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center my-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-cyan-400"
                      strokeDasharray="92, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center font-mono">
                    <span className="text-2xl font-extrabold text-white">92%</span>
                    <span className="text-[9px] text-cyan-300 uppercase font-bold">Confidence</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-cyan-300/80 bg-cyan-950/70 p-2.5 rounded-lg border border-cyan-800/60">
                  “Confidence is calculated from backend evidence, not blindly trusted from the LLM.”
                </div>
              </div>

              {/* Right side: Evidence Checklist */}
              <div className="md:col-span-7 space-y-3 font-mono text-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Supporting Empirical Evidence Chain
                </span>

                <div className="space-y-2.5">
                  {[
                    'Deployment v2.4.1 preceded memory spike by 120 seconds',
                    'Memory spike (94%) preceded DB pool exhaustion',
                    'DB pool exhaustion (100/100) preceded API failures',
                    'Historical pattern matched by RAG Knowledge Base (INC-883)'
                  ].map((evidence, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3 text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{evidence}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ==================================================
            6. BUSINESS IMPACT ANALYSIS
           ================================================== */}
        <section id="business-impact" className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-950/80 border border-indigo-800/60 text-xs font-mono text-indigo-400">
              <Layers className="w-3.5 h-3.5" /> BUSINESS IMPACT MAP
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Business Function Mapping
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl">
              Mapping infrastructure degradation directly to affected business functionality.
            </p>
          </div>

          <div className="glass-panel-dark p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
            
            {/* Dependency Chain Flow */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-center">
              <div className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300 w-full md:w-auto font-bold">DATABASE</div>
              <ChevronRight className="hidden md:block w-4 h-4 text-slate-500" />
              <div className="p-3 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 w-full md:w-auto font-bold">PAYMENT SERVICE</div>
              <ChevronRight className="hidden md:block w-4 h-4 text-slate-500" />
              <div className="p-3 rounded bg-red-950/60 border border-red-800/60 text-red-300 w-full md:w-auto font-bold">PAYMENT PROCESSING</div>
              <ChevronRight className="hidden md:block w-4 h-4 text-slate-500" />
              <div className="p-3 rounded bg-red-900 text-white font-extrabold w-full md:w-auto">USER TRANSACTION FAILURE</div>
            </div>

            {/* Impact Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Affected Service</span>
                <span className="text-sm font-bold text-white block">Payment Service</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Business Function</span>
                <span className="text-sm font-bold text-amber-400 block">Payment Processing</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">User Impact</span>
                <span className="text-sm font-bold text-red-400 block">Users may be unable to complete transactions.</span>
              </div>
            </div>
          </div>
        </section>


        {/* ==================================================
            7. DECISION + SAFETY LAYER (Policy Matrix)
           ================================================== */}
        <section id="decision-safety" className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-950/80 border border-red-800/60 text-xs font-mono text-red-400">
              <Lock className="w-3.5 h-3.5" /> RISK POLICY & HUMAN IN THE LOOP
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              AI Recommends. Policy Decides.
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl">
              Enforcing strict safety guardrails. High-risk actions require explicit human approval.
            </p>
          </div>

          <div className="glass-panel-dark p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-8">
            
            {/* Policy Flow Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
              <span>ROOT CAUSE</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span>BUSINESS IMPACT</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span className="text-cyan-400 font-bold">AI RECOMMENDATION</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span className="text-purple-400 font-bold">RISK POLICY ENGINE</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span className="text-emerald-400 font-bold">SAFE ACTION</span>
            </div>

            {/* Policy Matrix Table */}
            <div className="space-y-3 font-mono text-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Engine Safety Risk Matrix
              </span>

              <div className="space-y-2">
                {policyMatrix.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      item.risk === 'HIGH'
                        ? 'glass-panel-red border-red-500/50'
                        : item.risk === 'BLOCKED'
                        ? 'bg-purple-950/30 border-purple-900/60 text-purple-300'
                        : item.risk === 'MEDIUM'
                        ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-xs">{item.action}</span>
                      <span className="text-[10px] text-slate-400">({item.target})</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        item.risk === 'HIGH' ? 'bg-red-950 text-red-400 border border-red-800' :
                        item.risk === 'BLOCKED' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                        item.risk === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        RISK: {item.risk}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HIGH RISK HUMAN APPROVAL INTERCEPT DEMO */}
            <div className="p-6 rounded-xl bg-slate-950 border border-red-500/40 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-mono">
                  <Lock className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-white">HIGH RISK ACTION INTERCEPT DEMO</span>
                </div>
                <span className="text-[10px] font-mono text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                  HUMAN APPROVAL GATE
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="font-mono text-xs space-y-1">
                  <span className="text-slate-300 block">Recommended Action: <code className="text-cyan-300 font-bold">ROLLBACK_DEPLOYMENT v2.4.1 → v2.4.0</code></span>
                  <span className="text-slate-400 text-[11px] block">Risk Classification: HIGH · Engine requires engineer confirmation to trigger execution.</span>
                </div>

                {/* Presentation buttons (demo only) */}
                <div className="flex items-center gap-3 shrink-0 font-mono">
                  {approvalState === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => setApprovalState('APPROVED')}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> APPROVE
                      </button>
                      <button
                        onClick={() => setApprovalState('REJECTED')}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> REJECT
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        approvalState === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-red-950 text-red-300 border border-red-500'
                      }`}>
                        {approvalState === 'APPROVED' ? '✓ APPROVED BY ENGINEER' : '✕ REJECTED BY ENGINEER'}
                      </span>
                      <button
                        onClick={() => setApprovalState('PENDING')}
                        className="text-[10px] text-slate-400 underline hover:text-slate-200 cursor-pointer"
                      >
                        Reset Demo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ==================================================
            8. REMEDIATION & VERIFICATION
           ================================================== */}
        <section id="remediation-verification" className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-800/60 text-xs font-mono text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> SAFE REMEDIATION & RECOVERY
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Remediation & Closed Verification
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl">
              Remediation is not complete until recovery metrics are strictly verified.
            </p>
          </div>

          <div className="glass-panel-dark p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-8">
            
            {/* SIMULATED REMEDIATION BADGE & BEFORE/AFTER METRICS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Remediation Telemetry Delta
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-xs">
                  SIMULATED REMEDIATION
                </span>
              </div>

              {/* BEFORE / ACTION / AFTER GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                
                {/* BEFORE */}
                <div className="glass-panel-red p-5 rounded-xl border border-red-500/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-extrabold text-red-400 uppercase">BEFORE ACTION</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-800">
                      DEGRADED
                    </span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between p-2 rounded bg-slate-950/80">
                      <span className="text-slate-400">Memory</span>
                      <span className="font-bold text-red-400">94%</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950/80">
                      <span className="text-slate-400">DB Connections</span>
                      <span className="font-bold text-red-400">100 / 100</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950/80">
                      <span className="text-slate-400">API Latency</span>
                      <span className="font-bold text-red-400">4.8 sec</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950/80">
                      <span className="text-slate-400">Failure Rate</span>
                      <span className="font-bold text-red-400">31%</span>
                    </div>
                  </div>
                </div>

                {/* ACTION EXECUTED */}
                <div className="glass-panel-cyan p-5 rounded-xl border border-cyan-500/40 flex flex-col justify-center items-center text-center space-y-3 font-mono">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">EXECUTED ACTION</span>
                  <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-500/60 text-white font-extrabold text-sm w-full">
                    ROLLBACK_DEPLOYMENT
                  </div>
                  <span className="text-[10px] text-cyan-300">Target: v2.4.1 → v2.4.0</span>
                </div>

                {/* AFTER */}
                <div className="glass-panel-emerald p-5 rounded-xl border border-emerald-500/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-extrabold text-emerald-400 uppercase">AFTER ACTION</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      HEALTHY
                    </span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between p-2 rounded bg-slate-950/80">
                      <span className="text-slate-400">Memory</span>
                      <span className="font-bold text-emerald-400">45%</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950/80">
                      <span className="text-slate-400">DB Connections</span>
                      <span className="font-bold text-emerald-400">42 / 100</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950/80">
                      <span className="text-slate-400">API Latency</span>
                      <span className="font-bold text-emerald-400">180 ms</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950/80">
                      <span className="text-slate-400">Failure Rate</span>
                      <span className="font-bold text-emerald-400">0.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VERIFICATION CRITERIA SUB-SECTION */}
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3 font-mono">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Continuous Recovery Verification Rules
                </span>

                <button
                  onClick={handleVerifyToggle}
                  disabled={isVerifying}
                  className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-400 cursor-pointer transition-colors flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>Toggle Test Result State</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                {[
                  { metric: 'Memory < 70%', current: verificationPassed ? '45%' : '88%', pass: verificationPassed },
                  { metric: 'DB connections < 80%', current: verificationPassed ? '42%' : '95%', pass: verificationPassed },
                  { metric: 'API latency < 500ms', current: verificationPassed ? '180ms' : '1.2s', pass: verificationPassed },
                  { metric: 'Error rate < 5%', current: verificationPassed ? '0.8%' : '14%', pass: verificationPassed }
                ].map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 ${
                    item.pass ? 'bg-emerald-950/30 border-emerald-900/60' : 'bg-red-950/30 border-red-900/60'
                  }`}>
                    <span className="text-[11px] text-slate-300 font-bold">{item.metric}</span>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold ${item.pass ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.current}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        item.pass ? 'bg-emerald-900 text-emerald-200' : 'bg-red-900 text-red-200'
                      }`}>
                        {item.pass ? '✓ PASS' : '✕ FAIL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* RESOLVED / ESCALATE DECISION BRANCH */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs">
                <span className="text-slate-300">AUTOMATED DECISION BRANCH:</span>

                {verificationPassed ? (
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-400 font-extrabold text-sm flex items-center gap-2 shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> IF ALL PASS → INCIDENT RESOLVED
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 rounded-lg bg-red-950 border border-red-500 text-red-400 font-extrabold text-sm flex items-center gap-2 shadow-lg">
                      <AlertTriangle className="w-4 h-4 text-red-400" /> IF ANY FAIL → FAILED & ESCALATE
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>


        {/* ==================================================
            9. COMPLETE CLOSED-LOOP ARCHITECTURE
           ================================================== */}
        <section id="closed-loop" className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-800/60 text-xs font-mono text-cyan-400">
              <RefreshCw className="w-3.5 h-3.5" /> SELF-IMPROVING FEEDBACK LOOP
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Complete Closed-Loop Architecture
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl">
              Resolved incidents dynamically update the vector store to strengthen future AI investigations.
            </p>
          </div>

          <div className="glass-panel-dark p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-8 relative overflow-hidden">
            
            {/* Master Architecture Stage Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 font-mono text-[11px] text-center">
              {[
                'APPLICATION', 'INGESTION', 'NORMALIZATION', 'FILTERING',
                'CORRELATION', 'INCIDENT', 'RAG KNOWLEDGE', 'AI INVESTIGATION',
                'ROOT CAUSE', 'IMPACT MAP', 'DECISION ENGINE', 'RISK POLICY',
                'APPROVAL GATE', 'REMEDIATION', 'VERIFICATION', 'RESOLVED'
              ].map((stage, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold truncate">
                  <span className="text-[9px] text-slate-500 block">{(idx + 1).toString().padStart(2, '0')}</span>
                  {stage}
                </div>
              ))}
            </div>

            {/* FEEDBACK LOOP VISUAL CARD */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-slate-950 border border-cyan-500/40 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 font-mono">
                <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest block">
                  Self-Improving Knowledge Loop
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200">
                  <span className="font-bold text-emerald-400">RESOLVED INCIDENT</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-cyan-300">HISTORICAL INCIDENT RECORD</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-purple-400">RAG KNOWLEDGE BASE</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white">FUTURE INVESTIGATION</span>
                </div>
              </div>

              <div className="px-4 py-3 rounded-lg bg-cyan-950 border border-cyan-500/60 text-cyan-300 font-mono text-xs font-bold text-center shrink-0">
                +1 Knowledge Embed
              </div>
            </div>
          </div>
        </section>


        {/* ==================================================
            10. FINAL PHILOSOPHY & STATEMENT
           ================================================== */}
        <section id="philosophy" className="text-center py-16 space-y-12">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight font-sans tracking-tight">
              “Thousands of signals. <br />
              One incident. <br />
              One probable cause. <br />
              <span className="text-cyan-400">One intelligent decision.”</span>
            </h2>

            <div className="space-y-3 font-mono">
              <p className="text-xl font-bold text-slate-200">
                “We are not building another monitoring dashboard.”
              </p>
              <p className="text-lg font-bold text-cyan-400">
                “We are building the decision-making layer between detection and resolution.”
              </p>
            </div>

            <p className="text-xs font-mono text-slate-400 tracking-wider">
              Designed for student developers, indie developers and small teams running web applications.
            </p>
          </div>
        </section>


        {/* ==================================================
            11. TECH STACK STRIP
           ================================================== */}
        <footer id="tech-stack" className="border-t border-slate-800/80 pt-10 space-y-6 text-center">
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Architecture Technology Stack
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
            {[
              { name: 'Python', role: 'Engine Core' },
              { name: 'FastAPI', role: 'Async Pipeline' },
              { name: 'SQLite', role: 'State Store' },
              { name: 'React', role: 'Command UI' },
              { name: 'TypeScript', role: 'Safety Types' },
              { name: 'RAG', role: 'Vector Store' },
              { name: 'Groq', role: 'LLM Inference' },
              { name: 'GitHub Webhooks', role: 'Deployment Signal' }
            ].map((tech) => (
              <div key={tech.name} className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
                <span className="font-bold text-white">{tech.name}</span>
                <span className="text-[10px] text-slate-500">· {tech.role}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] font-mono text-slate-400 pt-4">
            Sentinel-X · Open-Source Autonomous Incident Resolution Engine Architecture
          </p>
        </footer>

      </div>
    </div>
  );
};

export default ArchitecturePage;
