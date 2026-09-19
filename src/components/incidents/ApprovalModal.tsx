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
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="w-5 h-5" />
          <span>Remediation Action Approval Required</span>
        </div>
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Reject
          </Button>
          <Button variant="primary" onClick={onConfirm} isLoading={isSubmitting} icon={ShieldCheck}>
            Approve & Execute Action
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs font-mono">
        <p className="text-sm font-sans text-slate-700 leading-relaxed">
          The Aegis AI Engine recommends executing an autonomous remediation for incident{' '}
          <strong className="text-blue-600 font-mono">{incident.incident_id}</strong>.
        </p>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-500">Recommended Action:</span>
            <span className="text-blue-600 font-bold">{incident.recommended_action || 'ROLLBACK_DEPLOYMENT'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Target Microservice:</span>
            <span className="text-slate-900 font-semibold">{incident.affected_services[0] || 'payment-service'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Risk Assessment Level:</span>
            <span className="text-amber-700 font-bold">{incident.risk_level || 'MEDIUM'} RISK</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">AI Confidence Score:</span>
            <span className="text-purple-600 font-bold">{incident.confidence || 94}%</span>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 leading-relaxed font-sans">
          ⚠ <strong>Expected Operational Impact:</strong> Temporary pod restart on target cluster. Previous stable configuration will be restored.
        </div>
      </div>
    </Modal>
  );
};

