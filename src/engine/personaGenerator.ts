import type { Persona, AgeGroup, Gender, Region, Job, IncomeLevel, Interest } from '../types';
import {
  AGE_DIST,
  GENDER_DIST,
  REGION_DIST,
  JOB_DIST_BY_AGE,
  INCOME_DIST_BY_AGE,
} from '../data/distributionTable';

function weightedRandom<T extends string>(dist: Record<T, number>): T {
  const r = Math.random();
  let cumulative = 0;
  for (const [key, prob] of Object.entries(dist) as [T, number][]) {
    cumulative += prob;
    if (r <= cumulative) return key;
  }
  return Object.keys(dist)[Object.keys(dist).length - 1] as T;
}

const INTERESTS_POOL: Interest[] = ['discount', 'brand', 'tech', 'health', 'culture', 'travel'];

function sampleInterests(age: AgeGroup, income: IncomeLevel): Interest[] {
  const isElder = age === '60s' || age === '70s' || age === '80s';
  const weights: Record<Interest, number> = {
    discount: income === 'low' || income === 'mid_low' ? 0.7 : 0.3,
    brand:    income === 'high' || income === 'mid_high' ? 0.6 : 0.3,
    tech:     age === '20s' || age === '30s' ? 0.6 : isElder ? 0.15 : 0.3,
    health:   isElder ? 0.75 : age === '40s' || age === '50s' ? 0.60 : 0.3,
    culture:  0.4,
    travel:   income === 'mid_high' || income === 'high' ? 0.5 : 0.25,
  };
  return INTERESTS_POOL.filter((interest) => Math.random() < weights[interest]);
}

function derivePriceSensitivity(income: IncomeLevel, age: AgeGroup): number {
  const base: Record<IncomeLevel, number> = { low: 0.85, mid_low: 0.65, mid: 0.45, mid_high: 0.30, high: 0.15 };
  const ageModifier: Partial<Record<AgeGroup, number>> = { '10s': 0.10, '20s': 0.05, '50s': 0.05, '60s': 0.08, '70s': 0.12, '80s': 0.15 };
  return Math.min(1, Math.max(0, base[income] + (ageModifier[age] ?? 0) + (Math.random() - 0.5) * 0.1));
}

function deriveTechSavviness(age: AgeGroup, job: Job): number {
  const ageFactor: Record<AgeGroup, number> = { '10s': 0.75, '20s': 0.80, '30s': 0.65, '40s': 0.50, '50s': 0.35, '60s': 0.25, '70s': 0.15, '80s': 0.10 };
  const jobBonus: Partial<Record<Job, number>> = { professional: 0.15, office: 0.05 };
  return Math.min(1, Math.max(0, ageFactor[age] + (jobBonus[job] ?? 0) + (Math.random() - 0.5) * 0.1));
}

function deriveBrandLoyalty(income: IncomeLevel): number {
  const base: Record<IncomeLevel, number> = { low: 0.25, mid_low: 0.35, mid: 0.50, mid_high: 0.65, high: 0.80 };
  return Math.min(1, Math.max(0, base[income] + (Math.random() - 0.5) * 0.1));
}

export function generatePersonas(count: number): Persona[] {
  const personas: Persona[] = [];
  for (let i = 0; i < count; i++) {
    const age = weightedRandom<AgeGroup>(AGE_DIST);
    const gender = weightedRandom<Gender>(GENDER_DIST);
    const region = weightedRandom<Region>(REGION_DIST);
    const job = weightedRandom<Job>(JOB_DIST_BY_AGE[age]);
    const income = weightedRandom<IncomeLevel>(INCOME_DIST_BY_AGE[age]);
    const interests = sampleInterests(age, income);

    personas.push({
      id: i,
      age,
      gender,
      region,
      job,
      income,
      interests,
      price_sensitivity: derivePriceSensitivity(income, age),
      tech_savviness: deriveTechSavviness(age, job),
      brand_loyalty: deriveBrandLoyalty(income),
    });
  }
  return personas;
}
