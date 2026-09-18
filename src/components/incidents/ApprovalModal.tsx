import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Incident } from '../../types/incident';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  incident?: Incident;
  isSubmitting?: boolean;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  incident,
  isSubmitting = false,
}) => {
  if (!incident) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <span>Remediation Action Approval Required</span>
        </div>
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel / Reject
          </Button>
          <Button variant="glow" onClick={onConfirm} isLoading={isSubmitting} icon={<ShieldCheck className="w-4 h-4" />}>
            Approve & Execute Action
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs font-mono">
        <p className="text-sm font-sans text-slate-300 leading-relaxed">
          The Aegis AI Engine recommends executing an autonomous remediation for incident{' '}
          <strong className="text-indigo-400">{incident.incident_id}</strong>.
        </p>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Recommended Action:</span>
            <span className="text-indigo-300 font-bold">{incident.recommended_action || 'ROLLBACK_DEPLOYMENT'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Target Microservice:</span>
            <span className="text-slate-200">{incident.affected_services[0] || 'payment-service'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Risk Assessment Level:</span>
            <span className="text-amber-400 font-bold">{incident.risk_level || 'MEDIUM'} RISK</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">AI Confidence Score:</span>
            <span className="text-purple-400 font-bold">{incident.confidence || 94}%</span>
          </div>
        </div>

        <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-amber-300 leading-relaxed font-sans">
          ⚠ <strong>Expected Operational Impact:</strong> Temporary pod restart on target cluster. Previous stable configuration v2.4.0 will be restored.
        </div>
      </div>
    </Modal>
  );
};
