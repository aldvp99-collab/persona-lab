import type { Persona, SimulationOption, PersonaChoice } from '../types';
import { TAG_WEIGHTS, BASE_SCORE } from '../data/weightConfig';

function scoreOption(persona: Persona, option: SimulationOption): number {
  let score = BASE_SCORE;

  for (const tag of option.tags) {
    const weights = TAG_WEIGHTS[tag];
    if (!weights) continue;

    score += persona.price_sensitivity * weights.price_sensitivity_boost;
    score += persona.tech_savviness * weights.tech_savviness_boost;
    score += persona.brand_loyalty * weights.brand_loyalty_boost;
    score += weights.age_boost[persona.age] ?? 0;
    score += weights.income_boost[persona.income] ?? 0;
    score += weights.job_boost[persona.job] ?? 0;
  }

  if (option.price !== undefined) {
    const priceImpact = option.price / 10000;
    score -= persona.price_sensitivity * priceImpact * 0.5;
  }

  return Math.max(0.01, score);
}

function softmax(scores: number[]): number[] {
  const expScores = scores.map((s) => Math.exp(s));
  const sum = expScores.reduce((a, b) => a + b, 0);
  return expScores.map((e) => e / sum);
}

export function simulateChoices(
  personas: Persona[],
  options: SimulationOption[]
): PersonaChoice[] {
  return personas.map((persona) => {
    const rawScores = options.map((opt) => scoreOption(persona, opt));
    const probs = softmax(rawScores);
    const r = Math.random();
    let cumulative = 0;
    let chosenIndex = options.length - 1;
    for (let i = 0; i < probs.length; i++) {
      cumulative += probs[i];
      if (r <= cumulative) { chosenIndex = i; break; }
    }
    const scores: Record<string, number> = {};
    options.forEach((opt, i) => { scores[opt.id] = rawScores[i]; });
    return { personaId: persona.id, chosenOptionId: options[chosenIndex].id, scores };
  });
}
