import { create } from 'zustand';
import type { SimulationConfig, SimulationResult, SimulationStatus } from '../types';

interface SimulationState {
  config: SimulationConfig;
  result: SimulationResult | null;
  report: string;
  status: SimulationStatus;
  error: string | null;

  setConfig: (config: Partial<SimulationConfig>) => void;
  setResult: (result: SimulationResult) => void;
  setReport: (report: string) => void;
  setStatus: (status: SimulationStatus) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const defaultConfig: SimulationConfig = {
  hypothesis: '',
  options: [
    { id: 'A', label: 'A안', description: '', tags: [] },
    { id: 'B', label: 'B안', description: '', tags: [] },
  ],
  populationSize: 1000,
};

export const useSimulationStore = create<SimulationState>((set) => ({
  config: defaultConfig,
  result: null,
  report: '',
  status: 'idle',
  error: null,

  setConfig: (partial) =>
    set((state) => ({ config: { ...state.config, ...partial } })),
  setResult: (result) => set({ result }),
  setReport: (report) => set({ report }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  reset: () => set({ result: null, report: '', status: 'idle', error: null }),
}));
