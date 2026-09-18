import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/api';
import { RealtimeClient } from '../api/websocket';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [activePage, setActivePage] = useState('dashboard'); // 'dashboard', 'events', 'incidents', 'workspace', 'audit', 'simulator'
  const [incidents, setIncidents] = useState([]);
  const [activeIncidentId, setActiveIncidentId] = useState(null);
  const [activeIncident, setActiveIncident] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState({ online: true, database: 'up', environment: 'production' });
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [simulationState, setSimulationState] = useState({ running: false, scenario: null });
  const [error, setError] = useState(null);

  const [loading, setLoading] = useState({
    incidents: false,
    activeIncident: false,
    investigating: false,
    remediating: false,
    simulator: false,
  });

  // Fetch system health
  const checkHealth = useCallback(async () => {
    try {
      const res = await api.getHealth();
      setSystemStatus({
        online: res.status === 'ok' || res.status === 'degraded',
        database: res.database || 'up',
        environment: res.environment || 'production',
      });
    } catch (err) {
      setSystemStatus({ online: false, database: 'down', environment: 'unknown' });
    }
  }, []);

  // Fetch list of incidents
  const refreshIncidents = useCallback(async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
      if (data.length > 0 && !activeIncidentId) {
        setActiveIncidentId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    }
  }, [activeIncidentId]);

  // Fetch single active incident details
  const refreshActiveIncident = useCallback(async (id = activeIncidentId) => {
    if (!id) return;
    try {
      const data = await api.getIncidentDetail(id);
      
      // Also fetch timeline audit logs for this incident
      let timeline = [];
      try {
        timeline = await api.getIncidentTimeline(id);
      } catch (e) {
        // Fallback
      }

      setActiveIncident({
        ...data,
        timeline,
      });
    } catch (err) {
      console.error(`Failed to fetch incident ${id}:`, err);
    }
  }, [activeIncidentId]);

  // Fetch telemetry alerts
  const refreshAlerts = useCallback(async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  }, []);

  // Fetch audit logs
  const refreshAuditLogs = useCallback(async () => {
    try {
      const data = await api.getAuditLogs();
      setAuditLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  }, []);

  // Fetch simulation status
  const refreshSimulationStatus = useCallback(async () => {
    try {
      const res = await api.getSimulationStatus();
      setSimulationState(res);
    } catch (err) {
      // Ignore
    }
  }, []);

  // Initial & periodic sync
  useEffect(() => {
    checkHealth();
    refreshIncidents();
    refreshAlerts();
    refreshAuditLogs();
    refreshSimulationStatus();

    const interval = setInterval(() => {
      refreshIncidents();
      refreshAlerts();
      refreshSimulationStatus();
      if (activeIncidentId) {
        refreshActiveIncident(activeIncidentId);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [checkHealth, refreshIncidents, refreshAlerts, refreshAuditLogs, refreshSimulationStatus, activeIncidentId, refreshActiveIncident]);

  // Sync active incident when selection changes
  useEffect(() => {
    if (activeIncidentId) {
      refreshActiveIncident(activeIncidentId);
    } else {
      setActiveIncident(null);
    }
  }, [activeIncidentId, refreshActiveIncident]);

  // WebSocket realtime client
  useEffect(() => {
    const wsClient = new RealtimeClient(
      (data) => {
        // Realtime update handler
        refreshIncidents();
        if (activeIncidentId) refreshActiveIncident(activeIncidentId);
      },
      (status) => {
        setIsWsConnected(status);
      }
    );

    wsClient.connect();
    return () => wsClient.disconnect();
  }, [refreshIncidents, refreshActiveIncident, activeIncidentId]);

  // Actions
  const selectIncident = (id) => {
    setActiveIncidentId(id);
    setActivePage('workspace');
  };

  const triggerInvestigation = async (id = activeIncidentId) => {
    if (!id) return;
    setLoading((prev) => ({ ...prev, investigating: true }));
    setError(null);
    try {
      await api.investigateIncident(id);
      await refreshActiveIncident(id);
      await refreshIncidents();
    } catch (err) {
      setError(`Investigation failed: ${err.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, investigating: false }));
    }
  };

  const approveAction = async (id = activeIncidentId, approvedBy, comment) => {
    if (!id) return;
    setLoading((prev) => ({ ...prev, remediating: true }));
    setError(null);
    try {
      await api.approveIncident(id, approvedBy, comment);
      await refreshActiveIncident(id);
      await refreshIncidents();
    } catch (err) {
      setError(`Approval failed: ${err.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, remediating: false }));
    }
  };

  const rejectAction = async (id = activeIncidentId, rejectedBy, comment) => {
    if (!id) return;
    setLoading((prev) => ({ ...prev, remediating: true }));
    setError(null);
    try {
      await api.rejectIncident(id, rejectedBy, comment);
      await refreshActiveIncident(id);
      await refreshIncidents();
    } catch (err) {
      setError(`Rejection failed: ${err.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, remediating: false }));
    }
  };

  const executeRemediation = async (id = activeIncidentId) => {
    if (!id) return;
    setLoading((prev) => ({ ...prev, remediating: true }));
    setError(null);
    try {
      await api.remediateIncident(id);
      await refreshActiveIncident(id);
      await refreshIncidents();
    } catch (err) {
      setError(`Remediation failed: ${err.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, remediating: false }));
    }
  };

  const triggerSimulator = async (scenario) => {
    setLoading((prev) => ({ ...prev, simulator: true }));
    setError(null);
    try {
      const res = await api.startSimulation(scenario);
      setSimulationState({ running: true, scenario });
      
      // Poll rapidly for 5 seconds for new incidents
      setTimeout(async () => {
        const newIncidents = await api.getIncidents();
        setIncidents(newIncidents);
        if (newIncidents.length > 0) {
          setActiveIncidentId(newIncidents[0].id);
        }
      }, 1500);

      return res;
    } catch (err) {
      setError(`Failed to trigger simulator scenario: ${err.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, simulator: false }));
    }
  };

  const value = {
    activePage,
    setActivePage,
    incidents,
    activeIncidentId,
    setActiveIncidentId: selectIncident,
    activeIncident,
    alerts,
    auditLogs,
    systemStatus,
    isWsConnected,
    simulationState,
    loading,
    error,
    setError,
    triggerInvestigation,
    approveAction,
    rejectAction,
    executeRemediation,
    triggerSimulator,
    refreshIncidents,
    refreshActiveIncident,
    refreshAlerts,
    refreshAuditLogs,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
