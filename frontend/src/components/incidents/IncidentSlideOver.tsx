import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle, ShieldAlert, Cpu, CheckCircle2, RotateCcw, Download, Layers, Activity, FileText } from 'lucide-react';
import { Incident } from '../../types/incident';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { RootCauseGraph } from './RootCauseGraph';
import { approveRemediation, rejectRemediation } from '../../api/incidents';
import { useQueryClient } from '@tanstack/react-query';

interface IncidentSlideOverProps {
  incident: Incident;
  onClose: () => void;
}

export const IncidentSlideOver: React.FC<IncidentSlideOverProps> = ({ incident, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reasoning' | 'blast_radius' | 'remediation'>('overview');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const queryClient = useQueryClient();

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveRemediation(incident.incident_id);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await rejectRemediation(incident.incident_id, 'Rejected by SRE from Aegis Command Center');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleExportIncident = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(incident, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${incident.incident_id}_verdict.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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

        {/* 60% Width Right Slide-over Panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-4xl bg-white border-l border-[#E5E9F0] shadow-dropdown flex flex-col h-full"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E9F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[16px] font-bold text-blue-600">{incident.incident_id}</span>
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

            {/* Title Summary */}
            <div className="px-6 py-3 border-b border-[#E5E9F0] bg-white">
              <h2 className="text-[16px] font-semibold text-slate-900 leading-snug">{incident.title}</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Target Service: <span className="font-mono font-medium text-slate-700">{incident.affected_services?.[0] || 'payment-service'}</span> | Created: {new Date(incident.created_at).toLocaleString()}
              </p>
            </div>

            {/* Inner Tabs Navigation */}
            <div className="flex border-b border-[#E5E9F0] px-6 bg-[#F8FAFC] gap-2">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'reasoning', label: 'Reasoning' },
                { id: 'blast_radius', label: 'Blast Radius (RCA)' },
                { id: 'remediation', label: 'Remediation' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F7F8FA]">
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  {/* Root Cause Card & 64px Circular Confidence Meter */}
                  <div className="bg-white border border-[#E5E9F0] rounded-[10px] p-5 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-blue-600" /> Probable Root Cause
                      </div>
                      <p className="text-[15px] font-bold text-slate-900 leading-snug">
                        {incident.root_cause || incident.ai_investigation?.probable_root_cause || 'Database connection pool exhaustion following deployment v2.4.1'}
                      </p>
                      <p className="text-[12px] text-slate-600 leading-relaxed">
                        {incident.ai_investigation?.hypothesis || 'HikariCP active connections spiked to max threshold (100/100) immediately following code push.'}
                      </p>
                    </div>

                    {/* Circular Confidence Meter (64px) */}
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

                  {/* Evidence Chips */}
                  <div className="bg-white border border-[#E5E9F0] rounded-[10px] p-5 shadow-card space-y-3">
                    <h4 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider">Correlated Alert Signals & Evidence</h4>
                    <div className="flex flex-wrap gap-2">
                      {incident.correlated_alert_ids?.map((aid) => (
                        <span
                          key={aid}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-mono text-[11px] font-medium cursor-pointer hover:bg-blue-100"
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
                <div className="bg-white border border-[#E5E9F0] rounded-[10px] p-5 shadow-card space-y-4">
                  <h4 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider">Agent Multi-Stage Reasoning Chain</h4>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E9F0]">
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                      <h5 className="text-[13px] font-bold text-slate-900 font-mono">Stage 1: Ingestion & Noise Filtering</h5>
                      <p className="text-[12px] text-slate-600 mt-0.5">SHA256 deduplication applied; 47 alerts reduced to 1 correlated incident cluster.</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                      <h5 className="text-[13px] font-bold text-slate-900 font-mono">Stage 2: RAG & LLM Investigation</h5>
                      <p className="text-[12px] text-slate-600 mt-0.5">Retrieved historical resolution doc DB-104. Groq Llama 3.3 isolated deployment v2.4.1.</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-amber-600 ring-4 ring-amber-100" />
                      <h5 className="text-[13px] font-bold text-slate-900 font-mono">Stage 3: Decision & Policy Check</h5>
                      <p className="text-[12px] text-slate-600 mt-0.5">Recommended ROLLBACK_DEPLOYMENT. Policy engine assigned HIGH risk → Awaiting SRE Approval.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'blast_radius' && (
                <div className="bg-white border border-[#E5E9F0] rounded-[10px] p-4 shadow-card h-[400px]">
                  <RootCauseGraph incidentId={incident.incident_id} />
                </div>
              )}

              {activeTab === 'remediation' && (
                <div className="space-y-4">
                  {/* Status Stepper */}
                  <div className="bg-white border border-[#E5E9F0] rounded-[10px] p-5 shadow-card space-y-4">
                    <h4 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider">Remediation Action Workflow</h4>
                    <div className="grid grid-cols-4 gap-2 text-center text-[12px]">
                      {['Pending', 'Awaiting Approval', 'Executing', 'Verified'].map((step, idx) => (
                        <div
                          key={step}
                          className={`p-2.5 rounded-lg border font-medium ${
                            idx === 1
                              ? 'bg-amber-50 text-amber-700 border-amber-200 font-semibold'
                              : idx < 1
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-[#F8FAFC] text-slate-400 border-[#E5E9F0]'
                          }`}
                        >
                          {step}
                        </div>
                      ))}
                    </div>

                    {/* Action Card & Approve/Reject */}
                    <div className="p-4 bg-[#F8FAFC] border border-[#E5E9F0] rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] uppercase font-mono font-semibold text-slate-500">Recommended Action</span>
                        <h5 className="text-[16px] font-bold font-mono text-slate-900 mt-0.5">ROLLBACK_DEPLOYMENT</h5>
                        <p className="text-[12px] text-slate-600 mt-0.5">Reverts payment-service to stable release v2.4.0</p>
                      </div>

                      {incident.status === 'AWAITING_APPROVAL' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="danger" size="sm" onClick={handleReject} isLoading={isRejecting}>
                            Reject
                          </Button>
                          <Button variant="primary" size="sm" onClick={handleApprove} isLoading={isApproving}>
                            Approve Remediation
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Case-File Verdict Card */}
            <div className="px-6 py-4 border-t border-[#E5E9F0] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full shrink-0" />
                <div>
                  <h5 className="text-[13px] font-bold text-slate-900 font-mono">Case Verdict File: {incident.incident_id}</h5>
                  <p className="text-[11px] text-slate-500">Status: {incident.status} | Risk Level: {incident.risk_level || 'HIGH'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={handleExportIncident} icon={<Download className="w-3.5 h-3.5" />}>
                  Export File
                </Button>
                <Button variant="primary" size="sm" onClick={onClose}>
                  Close Panel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
