import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { DeploymentTable } from '../components/deployments/DeploymentTable';
import { useDeployments } from '../hooks/useDeployments';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { GitCommit } from 'lucide-react';

export const DeploymentsPage: React.FC = () => {
  const { data: deployments } = useDeployments();
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [newService, setNewService] = useState('orders-service');
  const [newVersion, setNewVersion] = useState('v2.4.1');
  const [changeSummary, setChangeSummary] = useState('Production deployment for database query optimization');
  const [isFaulty, setIsFaulty] = useState(false);

  const handleDeploySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeployModalOpen(false);
  };

  return (
    <PageContainer
      title="Deployments Registry"
      description="Microservice release history, git tag tracking, and automated failure correlation"
    >
      <DeploymentTable
        deployments={deployments}
        onDeployClick={() => setIsDeployModalOpen(true)}
      />

      {/* Deploy Modal */}
      <Modal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        title="Deploy Microservice Release"
      >
        <form onSubmit={handleDeploySubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Target Microservice</label>
            <select
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="orders-service">orders-service</option>
              <option value="payment-gateway">payment-gateway</option>
              <option value="inventory-service">inventory-service</option>
              <option value="auth-service">auth-service</option>
              <option value="api-gateway">api-gateway</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Git Tag / Version</label>
            <input
              type="text"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Change Summary</label>
            <textarea
              rows={3}
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
            <input
              type="checkbox"
              id="faultyCheck"
              checked={isFaulty}
              onChange={(e) => setIsFaulty(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="faultyCheck" className="text-xs font-semibold cursor-pointer">
              Simulate Controlled Failure (Triggers Sentinel-X auto-detection)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="ghost" size="sm" onClick={() => setIsDeployModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={GitCommit}>
              Trigger Deployment
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
