import { AllowedRemediationAction, RemediationResponse } from '../types/incident';

/**
 * Triggers safe remediation on NexaCart.
 * Only predefined actions are allowed:
 * ROLLBACK_DEPLOYMENT, RESTART_SERVICE, RECOVER_DATABASE, RESET_PAYMENT_SERVICE
 */
export async function triggerLocalRemediation(action: AllowedRemediationAction): Promise<RemediationResponse> {
  const allowed: AllowedRemediationAction[] = [
    'ROLLBACK_DEPLOYMENT',
    'RESTART_SERVICE',
    'RECOVER_DATABASE',
    'RESET_PAYMENT_SERVICE',
  ];

  if (!allowed.includes(action)) {
    throw new Error(`Unauthorized remediation action: ${action}`);
  }

  const res = await fetch('/api/remediation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Remediation failed with status ${res.status}`);
  }

  return await res.json();
}
