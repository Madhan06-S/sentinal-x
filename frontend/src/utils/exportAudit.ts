import { realtimeService } from '../services/realtime';

export const exportAuditJSON = (data: any, incidentId?: string) => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const mins = pad(now.getMinutes());

  const timestamp = `${year}${month}${day}-${hours}${mins}`;
  const dateOnly = `${year}${month}${day}`;

  const filename = incidentId
    ? `sentinel-x-audit-${incidentId}-${timestamp}.json`
    : `sentinel-x-audit-full-${dateOnly}.json`;

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Show Toast
  realtimeService.emit({
    type: 'CUSTOM_TOAST',
    payload: {
      title: 'Audit report exported',
      message: `Exported ${filename}`,
      type: 'success',
    },
  });
};
