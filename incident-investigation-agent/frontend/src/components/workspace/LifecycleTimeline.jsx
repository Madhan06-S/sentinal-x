import React from 'react';

const STAGES = [
  'DETECT',
  'FILTER',
  'CORRELATE',
  'CREATED',
  'INVESTIGATE',
  'RAG EVIDENCE',
  'HYPOTHESES',
  'DECISION',
  'APPROVE',
  'REMEDIATE',
  'VERIFY',
  'RESOLVED',
];

const STATUS_STAGE_MAP = {
  OPEN: 3,
  INVESTIGATING: 6,
  DECISION_PENDING: 7,
  AWAITING_APPROVAL: 8,
  REMEDIATING: 9,
  VERIFYING: 10,
  RESOLVED: 11,
  FAILED: 6,
  ESCALATED: 7,
};

export default function LifecycleTimeline({ status }) {
  const currentIdx = STATUS_STAGE_MAP[status] ?? 3;
  const isFailedOrEscalated = status === 'FAILED' || status === 'ESCALATED';

  return (
    <div className="stepper-bar">
      {STAGES.map((stage, idx) => {
        const isCompleted = idx <= currentIdx && !isFailedOrEscalated;
        const isActive = idx === currentIdx;

        return (
          <div
            key={stage}
            className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
          >
            <div className="step-bullet">{idx + 1}</div>
            <span>{stage}</span>
          </div>
        );
      })}
    </div>
  );
}
