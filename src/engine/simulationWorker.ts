import { generatePersonas } from './personaGenerator';
import { simulateChoices } from './reactionEngine';
import { aggregateResults } from './aggregator';
import type { SimulationConfig, SimulationResult } from '../types';
import type { DistributionData } from '../data/distributionTable';

interface WorkerInput {
  config: SimulationConfig;
  distributions: DistributionData;
}

interface WorkerDone {
  type: 'done';
  result: SimulationResult;
}

interface WorkerError {
  type: 'error';
  message: string;
}

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { config, distributions } = e.data;
  try {
    const personas = generatePersonas(config.populationSize, distributions, config.targetSegment);
    const choices = simulateChoices(personas, config.options);
    const result = aggregateResults(personas, choices, config.options);
    const msg: WorkerDone = { type: 'done', result };
    self.postMessage(msg);
  } catch (err) {
    const msg: WorkerError = {
      type: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
    };
    self.postMessage(msg);
  }
};
