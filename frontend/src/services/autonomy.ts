import { apiClient, USE_MOCK_API } from '../api/client';
import { simulationEngine } from '../mocks/simulationEngine';

export type AutonomyLevelKey = 'L1' | 'L2' | 'L3' | 'L4';

export interface AutonomyDetails {
  autonomy_level: AutonomyLevelKey;
  level: AutonomyLevelKey;
  name: string;
  title: string;
  description: string;
}

export const CANONICAL_AUTONOMY_LEVELS: Record<AutonomyLevelKey, AutonomyDetails> = {
  L1: {
    autonomy_level: 'L1',
    level: 'L1',
    name: 'L1: Advisory',
    title: 'Advisory',
    description: 'AI analyzes and reports only, zero remediation proposed.',
  },
  L2: {
    autonomy_level: 'L2',
    level: 'L2',
    name: 'L2: Guarded',
    title: 'Guarded',
    description: 'AI proposes actions, NEVER executes; human runs them manually.',
  },
  L3: {
    autonomy_level: 'L3',
    level: 'L3',
    name: 'L3: Semi-Auto',
    title: 'Semi-Auto',
    description: 'AI auto-executes LOW-risk actions; MEDIUM/HIGH require human approval.',
  },
  L4: {
    autonomy_level: 'L4',
    level: 'L4',
    name: 'L4: Full-Auto',
    title: 'Full-Auto',
    description: 'AI auto-executes LOW+MEDIUM risk; HIGH still requires human approval.',
  },
};

export const AUTONOMY_LEVELS = [
  { id: 'L1' as AutonomyLevelKey, name: 'L1 Advisory', desc: 'AI analyzes and reports only, zero remediation proposed.' },
  { id: 'L2' as AutonomyLevelKey, name: 'L2 Guarded', desc: 'AI proposes actions, NEVER executes; human runs them manually.' },
  { id: 'L3' as AutonomyLevelKey, name: 'L3 Semi-Auto', desc: 'AI auto-executes LOW-risk actions; MEDIUM/HIGH require human approval.' },
  { id: 'L4' as AutonomyLevelKey, name: 'L4 Full-Auto', desc: 'AI auto-executes LOW+MEDIUM risk; HIGH still requires human approval.' },
];

type AutonomyListener = (details: AutonomyDetails) => void;

class AutonomyStore {
  private currentLevel: AutonomyLevelKey = 'L3';
  private listeners: Set<AutonomyListener> = new Set();

  constructor() {
    this.fetchCurrentLevel();
  }

  public getDetails(): AutonomyDetails {
    return CANONICAL_AUTONOMY_LEVELS[this.currentLevel] || CANONICAL_AUTONOMY_LEVELS.L3;
  }

  public getLevel(): AutonomyLevelKey {
    return this.currentLevel;
  }

  public async setLevel(levelKey: AutonomyLevelKey): Promise<AutonomyDetails> {
    const prevLevel = this.currentLevel;
    this.currentLevel = levelKey;
    this.notify();

    if (USE_MOCK_API) {
      simulationEngine.setAutonomyLevel(levelKey);
      return this.getDetails();
    }

    try {
      const res = await apiClient.post('/autonomy', { autonomy_level: levelKey });
      const level = (res.data.autonomy_level || res.data.level || levelKey) as AutonomyLevelKey;
      this.currentLevel = level;
      this.notify();
      return this.getDetails();
    } catch (err) {
      console.error('[AutonomyStore] Failed to update autonomy level on backend:', err);
      this.currentLevel = prevLevel;
      this.notify();
      throw err;
    }
  }

  public async fetchCurrentLevel(): Promise<AutonomyDetails> {
    if (USE_MOCK_API) {
      const lvl = simulationEngine.getAutonomyLevel() as AutonomyLevelKey;
      if (lvl) this.currentLevel = lvl;
      this.notify();
      return this.getDetails();
    }

    try {
      const res = await apiClient.get('/autonomy');
      const level = (res.data.autonomy_level || res.data.level || 'L3') as AutonomyLevelKey;
      this.currentLevel = level;
      this.notify();
      return this.getDetails();
    } catch (err) {
      return this.getDetails();
    }
  }

  public subscribe(listener: AutonomyListener) {
    this.listeners.add(listener);
    listener(this.getDetails());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const details = this.getDetails();
    this.listeners.forEach((fn) => fn(details));
  }
}

export const autonomyStore = new AutonomyStore();
