import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Check,
  XCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Activity,
  ArrowUpRight,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Incident } from '../../types/incident';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { RootCauseGraph } from './RootCauseGraph';
import { approveRemediation, rejectRemediation } from '../../api/incidents';
import { exportAuditJSON } from '../../utils/exportAudit';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, ComposedChart, Line, ReferenceLine, XAxis, YAxis, Tooltip } from 'recharts';

interface IncidentSlideOverProps {
  incident: Incident;
  onClose: () => void;
}

export const IncidentSlideOver: React.FC<IncidentSlideOverProps> = ({ incident, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reasoning' | 'blast_radius' | 'remediation'>('overview');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [expandedRationale, setExpandedRationale] = useState<Record<string, boolean>>({});

  const queryClient = useQueryClient();

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveRemediation(incident.incident_id);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incident', incident.incident_id] });
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await rejectRemediation(incident.incident_id, 'Rejected by SRE operator from Sentinel-X Command Center');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incident', incident.incident_id] });
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleExportIncident = () => {
    exportAuditJSON(incident, incident.incident_id);
  };

  const toggleRationale = (id: string) => {
    setExpandedRationale((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Status Stepper Data (PagerDuty / Incident.io pattern)
  // Stepper state sync: Stepper must NOT advance past "Identified" until approval + execution actually happen
  const getStepStatus = (stepKey: string) => {
    const st = incident.status;
    if (st === 'RESOLVED') return 'completed';
    if (stepKey === 'INVESTIGATING') return 'completed';
    if (stepKey === 'IDENTIFIED') {
      return st !== 'OPEN' ? 'completed' : 'current';
    }
    if (stepKey === 'REMEDIATING') {
      if (st === 'REMEDIATING') return 'executing';
      if (st === 'AWAITING_APPROVAL') return 'awaiting';
      return 'upcoming';
    }
    if (stepKey === 'RESOLVED') {
      return (st as string) === 'RESOLVED' ? 'completed' : 'upcoming';
    }
    return 'upcoming';
  };

  const steps = [
    { key: 'INVESTIGATING', label: 'Investigating', time: '12:44:02' },
    { key: 'IDENTIFIED', label: 'Identified', time: '12:44:05' },
    { key: 'REMEDIATING', label: 'Remediating', time: '12:44:12' },
    { key: 'RESOLVED', label: 'Resolved', time: (incident.status as string) === 'RESOLVED' ? '12:45:30' : 'Pending' },
  ];

  // Remediation Action Queue Items
  const actionsList = incident.remediation_actions && incident.remediation_actions.length > 0
    ? incident.remediation_actions.map((act: any) => ({
        id: act.id,
        title: act.action_type || act.action_name || 'REMEDIATION_ACTION',
        version: act.parameters?.target_version || incident.affected_services?.[0] || 'payment-service',
        target: act.parameters?.target_service || incident.affected_services?.[0] || 'payment-service',
        risk: act.risk_level || 'MEDIUM',
        status: act.status || 'PENDING',
        timestamp: act.created_at ? new Date(act.created_at).toLocaleTimeString() : '12:44:12',
        rationale: act.rationale || 'AI proposed remediation action',
        resultText: act.execution_result || 'Verified successfully',
      }))
    : incident.recommended_action
    ? [
        {
          id: 'act-101',
          title: incident.recommended_action || 'ROLLBACK_DEPLOYMENT',
          version: 'v2.4.0',
          target: incident.affected_services?.[0] || 'payment-service',
          risk: incident.risk_level || 'MEDIUM',
          status: incident.status === 'AWAITING_APPROVAL'
            ? 'AWAITING_APPROVAL'
            : (incident.status as string) === 'RECOMMEND_ONLY'
            ? 'RECOMMEND_ONLY'
            : incident.status === 'REMEDIATING'
            ? 'EXECUTING'
            : incident.status === 'RESOLVED'
            ? 'VERIFIED'
            : 'PENDING',
          timestamp: '12:44:12',
          rationale:
            'Deployment v2.4.1 introduced a memory leak in payment-db connection pool (HikariCP active connections 100/100). Rolling back to stable v2.4.0 image will release socket allocations and lower HTTP 504 gateway timeouts.',
          resultText: 'Error rate recovered to 0.08% in 14s (threshold < 5.0%)',
        },
      ]
    : [];

  // Verification Monitor chart samples
  const verificationChartData = [
    { time: '12:44:12', errorRate: 78.4 },
    { time: '12:44:16', errorRate: 45.2 },
    { time: '12:44:20', errorRate: 18.0 },
    { time: '12:44:24', errorRate: 6.5 },
    { time: '12:44:28', errorRate: 2.1 },
    { time: '12:44:30', errorRate: 0.8 },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs"
        />

        {/* Right Slide-over Panel with Sticky Header & Scrollable Body */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-4xl bg-white border-l border-[#E5E9F0] shadow-dropdown flex flex-col h-full"
          >
            {/* Sticky Header + Stepper Section */}
            <div className="sticky top-0 z-20 bg-white border-b border-[#E5E9F0] shadow-2xs">
              {/* Top Bar */}
              <div className="px-6 py-3 border-b border-[#E5E9F0] flex items-center justify-between bg-[#F8FAFC]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[15px] font-bold text-blue-600">{incident.incident_id}</span>
                  <SeverityBadge severity={incident.severity} size="sm" />
                  <StatusBadge status={incident.status} size="sm" />
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-[#E5E9F0] rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & Service Metadata */}
              <div className="px-6 py-2.5 bg-white">
                <h2 className="text-[15px] font-semibold text-slate-900 leading-snug">{incident.title}</h2>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  Target Service:{' '}
                  <span className="font-bold text-slate-700">{incident.affected_services?.[0] || 'payment-service'}</span> | Opened:{' '}
                  {new Date(incident.created_at).toLocaleTimeString()}
                </p>
              </div>

              {/* Status Stepper (Fixed spacing, z-index above line, clean state sync) */}
              <div className="px-6 py-3 bg-[#F8FAFC] border-t border-[#E5E9F0]">
                <div className="grid grid-cols-4 gap-2">
                  {steps.map((step, idx) => {
                    const state = getStepStatus(step.key);
                    return (
                      <div key={step.key} className="relative flex flex-col items-center text-center">
                        {/* Connector Line Behind Circles */}
                        <div className="flex items-center w-full mb-2">
                          {idx > 0 && (
                            <div
                              className={`flex-1 h-0.5 ${
                                state === 'completed' || state === 'executing' ? 'bg-blue-600' : 'bg-slate-200'
                              }`}
                            />
                          )}
                          {/* Circle Badge (z-10) */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 z-10 transition-all ${
                              state === 'completed'
                                ? 'bg-blue-600 text-white'
                                : state === 'executing'
                                ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                                : state === 'awaiting'
                                ? 'bg-amber-100 text-amber-700 border-2 border-amber-600'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {state === 'completed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : state === 'executing' ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          {idx < steps.length - 1 && (
                            <div
                              className={`flex-1 h-0.5 ${
                                state === 'completed' ? 'bg-blue-600' : 'bg-slate-200'
                              }`}
                            />
                          )}
                        </div>
                        {/* Label (8px gap below circle, z-10) */}
                        <span className="text-[11px] font-medium text-slate-800 leading-none z-10">{step.label}</span>
                        {/* Timestamp (4px gap below label) */}
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5 mt-1 z-10">
                          <Clock className="w-2.5 h-2.5" />
                          {step.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-t border-[#E5E9F0] px-6 bg-white gap-2">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'reasoning', label: 'Agent Reasoning' },
                  { id: 'blast_radius', label: 'Blast Radius Graph' },
                  { id: 'remediation', label: 'Remediation Workflow' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 text-[12px] font-mono font-medium border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F7F8FA]">
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <div className="bg-white border border-[#E5E9F0] rounded-xl p-5 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-blue-600" /> Root Cause Hypothesis
                      </div>
                      <p className="text-[15px] font-bold text-slate-900 leading-snug">
                        {incident.root_cause ||
                          incident.ai_investigation?.probable_root_cause ||
                          'Database connection pool exhaustion following deployment v2.4.1'}
                      </p>
                      <p className="text-[12px] text-slate-600 leading-relaxed">
                        {incident.ai_investigation?.hypothesis ||
                          'HikariCP active connections spiked to max threshold (100/100) immediately following code push.'}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 bg-[#F8FAFC] border border-[#E5E9F0] rounded-xl shrink-0">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="32" cy="32" r="26" stroke="#E5E9F0" strokeWidth="5" fill="transparent" />
                          <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke="#2563EB"
                            strokeWidth="5"
                            strokeDasharray={163.3}
                            strokeDashoffset={163.3 - (163.3 * (incident.confidence || 94)) / 100}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <span className="absolute font-mono text-[14px] font-bold text-slate-900">
                          {incident.confidence || 94}%
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 mt-1 font-mono">Confidence</span>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E5E9F0] rounded-xl p-5 shadow-card space-y-3">
                    <h4 className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                      Correlated Telemetry Alerts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {incident.correlated_alert_ids?.map((aid) => (
                        <span
                          key={aid}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-mono text-[11px] font-medium"
                        >
                          Alert: {aid}
                        </span>
                      )) || (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-mono text-[11px] font-medium">
                          Alert: ALT-9021 (PAYMENT_TIMEOUT)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reasoning' && (
                <div className="bg-white border border-[#E5E9F0] rounded-xl p-5 shadow-card space-y-4">
                  <h4 className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                    Agent Multi-Stage Reasoning Chain
                  </h4>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E9F0]">
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                      <h5 className="text-[13px] font-bold text-slate-900 font-mono">Stage 1: Ingestion & Noise Filtering</h5>
                      <p className="text-[12px] text-slate-600 mt-0.5">
                        SHA256 deduplication applied; 47 alerts reduced to 1 correlated incident cluster.
                      </p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                      <h5 className="text-[13px] font-bold text-slate-900 font-mono">Stage 2: RAG & LLM Investigation</h5>
                      <p className="text-[12px] text-slate-600 mt-0.5">
                        Retrieved historical resolution doc DB-104. Groq isolated deployment v2.4.1.
                      </p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-amber-600 ring-4 ring-amber-100" />
                      <h5 className="text-[13px] font-bold text-slate-900 font-mono">Stage 3: Decision & Policy Check</h5>
                      <p className="text-[12px] text-slate-600 mt-0.5">
                        Recommended ROLLBACK_DEPLOYMENT. Policy engine assigned HIGH risk → Awaiting SRE Approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'blast_radius' && (
                <div className="bg-white border border-[#E5E9F0] rounded-xl p-4 shadow-card h-[460px]">
                  <RootCauseGraph incidentId={incident.incident_id} />
                </div>
              )}

              {activeTab === 'remediation' && (
                <div className="space-y-6 font-sans">
                  {/* SECTION 2 — APPROVAL GATE SUMMARY (rendered when awaiting approval) */}
                  {incident.status === 'AWAITING_APPROVAL' && (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl shadow-xs space-y-2 text-amber-900">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-[13px]">
                          <ShieldCheck className="w-4 h-4 text-amber-700" />
                          <span>Human Approval Mandated (Autonomy Level L3 Semi-Autonomous)</span>
                        </div>
                        <Link
                          to="/settings"
                          className="text-[11px] font-mono text-amber-800 hover:text-amber-950 font-semibold underline flex items-center gap-1"
                        >
                          Configure Autonomy Settings <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <p className="text-[12px] leading-relaxed">
                        This remediation carries a HIGH risk assessment score. To execute automatically without operator approval, switch autonomy policy to L4 Full Autonomy in Settings.
                      </p>
                    </div>
                  )}

                  {/* SECTION 3 — VERIFICATION MONITOR (rendered during/after execution) */}
                  {(incident.status === 'REMEDIATING' || incident.status === 'RESOLVED') && (
                    <div className="bg-white border border-[#E5E9F0] rounded-xl p-4 shadow-card space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase text-slate-700 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-blue-600" /> Live Verification Telemetry Monitor
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                          RECOVERY THRESHOLD &lt; 5.0%
                        </span>
                      </div>

                      <div className="h-28 w-full pt-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={verificationChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                            <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} fontFamily="monospace" />
                            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} fontFamily="monospace" unit="%" />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E9F0', borderRadius: '8px', fontSize: '11px' }}
                              formatter={(val: any) => [`${val}%`, 'Error Rate']}
                            />
                            <ReferenceLine y={5.0} stroke="#059669" strokeDasharray="3 3" label={{ value: 'SLO Target (5%)', fill: '#059669', fontSize: 10 }} />
                            <Line type="monotone" dataKey="errorRate" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: '#2563EB' }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* SECTION 1 — ACTION QUEUE VERTICAL STEPPER */}
                  <div className="bg-white border border-[#E5E9F0] rounded-xl p-5 shadow-card space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E5E9F0] pb-3">
                      <h4 className="text-[12px] font-mono font-bold uppercase tracking-wider text-slate-700">
                        Remediation Action Pipeline Queue
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">
                        {actionsList.length} Action Step{actionsList.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {actionsList.length === 0 ? (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-700 font-sans">
                        <div className="flex items-center gap-2 font-bold text-[13px]">
                          <ShieldCheck className="w-4 h-4 text-slate-600" />
                          <span>Advisory mode — no action proposed</span>
                        </div>
                        <p className="text-[12px] leading-relaxed">
                          Sentinel-X AI analyzed telemetry and identified root cause in L1 Advisory policy mode. Zero remediation actions were proposed or executed.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E5E9F0]">
                      {actionsList.map((act) => {
                        const isExpanded = expandedRationale[act.id];

                        return (
                          <div key={act.id} className="relative group">
                            {/* Step Indicator Dot */}
                            <span
                              className={`absolute -left-6 top-3.5 w-3.5 h-3.5 rounded-full border-2 ${
                                act.status === 'VERIFIED'
                                  ? 'bg-emerald-600 border-emerald-200 ring-4 ring-emerald-50'
                                  : act.status === 'EXECUTING'
                                  ? 'bg-blue-600 border-blue-200 ring-4 ring-blue-100 animate-ping'
                                  : act.status === 'AWAITING_APPROVAL'
                                  ? 'bg-amber-600 border-amber-200 ring-4 ring-amber-50'
                                  : 'bg-slate-300 border-slate-100'
                              }`}
                            />

                            {/* Action Card */}
                            <div className="p-4 bg-[#F8FAFC] border border-[#E5E9F0] rounded-xl space-y-3 hover:border-slate-300 transition-all">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-[14px] font-bold font-mono text-slate-900">{act.title}</h5>
                                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                    {act.version}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                    Risk: {act.risk}
                                  </span>
                                  <StatusBadge
                                    status={
                                      act.status === 'VERIFIED'
                                        ? 'success'
                                        : act.status === 'EXECUTING'
                                        ? 'warning'
                                        : act.status === 'AWAITING_APPROVAL'
                                        ? 'warning'
                                        : 'info'
                                    }
                                    text={act.status}
                                    size="sm"
                                  />
                                </div>
                              </div>

                              {/* Rationale (2-line expandable) */}
                              <div className="text-[12px] text-slate-600 leading-relaxed font-sans">
                                <p className={isExpanded ? '' : 'line-clamp-2'}>{act.rationale}</p>
                                <button
                                  onClick={() => toggleRationale(act.id)}
                                  className="text-[11px] font-mono text-blue-600 hover:text-blue-700 font-semibold mt-1 flex items-center gap-1 cursor-pointer"
                                >
                                  {isExpanded ? (
                                    <>
                                      Hide rationale <ChevronUp className="w-3 h-3" />
                                    </>
                                  ) : (
                                    <>
                                      Expand rationale <ChevronDown className="w-3 h-3" />
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Inline Controls if AWAITING APPROVAL */}
                              {act.status === 'AWAITING_APPROVAL' && (
                                <div className="pt-3 border-t border-[#E5E9F0] flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-mono text-amber-800 font-semibold flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Proposed at {act.timestamp} — Signoff required
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Button variant="danger" size="sm" onClick={handleReject} isLoading={isRejecting}>
                                      Reject
                                    </Button>
                                    <Button variant="primary" size="sm" onClick={handleApprove} isLoading={isApproving}>
                                      Approve Remediation
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* RECOMMEND_ONLY note for L2 Guarded mode */}
                              {act.status === 'RECOMMEND_ONLY' && (
                                <div className="pt-3 border-t border-[#E5E9F0] flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-mono text-slate-600 font-semibold flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-slate-500" /> Guarded mode — recommendation only, manual execution required
                                  </span>
                                </div>
                              )}

                              {/* Executing State Progress Bar */}
                              {act.status === 'EXECUTING' && (
                                <div className="space-y-1.5 pt-2 border-t border-[#E5E9F0]">
                                  <div className="flex justify-between text-[11px] font-mono text-blue-700 font-semibold">
                                    <span className="flex items-center gap-1">
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing container image rollback...
                                    </span>
                                    <span>60%</span>
                                  </div>
                                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full rounded-full w-[60%] transition-all duration-300" />
                                  </div>
                                </div>
                              )}

                              {/* Verified Result Banner */}
                              {act.status === 'VERIFIED' && (
                                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px] text-emerald-900 font-mono">
                                  <span className="flex items-center gap-1.5 font-semibold">
                                    <Check className="w-4 h-4 text-emerald-600" /> {act.resultText}
                                  </span>
                                  <span className="text-emerald-700">{act.timestamp}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Case-File Verdict (Hidden when AWAITING_APPROVAL; Export File only when resolved/escalated; Close renamed) */}
            {incident.status !== 'AWAITING_APPROVAL' && (
              <div className="px-6 py-3.5 border-t border-[#E5E9F0] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-7 bg-blue-600 rounded-full shrink-0" />
                  <div>
                    <h5 className="text-[12px] font-bold text-slate-900 font-mono">Case Verdict File: {incident.incident_id}</h5>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Status: {incident.status} | Risk Level: {incident.risk_level || 'MEDIUM'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(incident.status === 'RESOLVED' || incident.status === 'FAILED') && (
                    <Button variant="outline" size="sm" onClick={handleExportIncident} icon={<Download className="w-3.5 h-3.5" />}>
                      Export File
                    </Button>
                  )}
                  <Button variant="primary" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
