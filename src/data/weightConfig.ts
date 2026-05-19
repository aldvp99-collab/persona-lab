import type { AgeGroup, IncomeLevel, Job } from '../types';

// 가중치 테이블: 태그별로 각 속성이 얼마나 선택 확률에 영향을 주는지 정의
// 양수 = 선호, 음수 = 비선호

export interface TagWeights {
  price_sensitivity_boost: number;   // price_sensitivity 가 높을수록 이 태그의 매력도 증가
  tech_savviness_boost: number;
  brand_loyalty_boost: number;
  age_boost: Partial<Record<AgeGroup, number>>;
  income_boost: Partial<Record<IncomeLevel, number>>;
  job_boost: Partial<Record<Job, number>>;
}

export const TAG_WEIGHTS: Record<string, TagWeights> = {
  cheap: {
    price_sensitivity_boost: 2.0,
    tech_savviness_boost: -0.2,
    brand_loyalty_boost: -0.5,
    age_boost: { '20s': 0.3, '30s': 0.2, '70s': 0.2, '80s': 0.3 },
    income_boost: { low: 0.8, mid_low: 0.5 },
    job_boost: { student: 0.6 },
  },
  premium: {
    price_sensitivity_boost: -1.5,
    tech_savviness_boost: 0.3,
    brand_loyalty_boost: 1.2,
    age_boost: { '40s': 0.3, '50s': 0.2, '60s': 0.2 },
    income_boost: { mid_high: 0.6, high: 1.0 },
    job_boost: { professional: 0.5, office: 0.3 },
  },
  'feature-rich': {
    price_sensitivity_boost: -0.5,
    tech_savviness_boost: 1.5,
    brand_loyalty_boost: 0.2,
    age_boost: { '20s': 0.4, '30s': 0.3 },
    income_boost: { mid: 0.2, mid_high: 0.4, high: 0.5 },
    job_boost: { professional: 0.8 },
  },
  simple: {
    price_sensitivity_boost: 0.3,
    tech_savviness_boost: -0.8,
    brand_loyalty_boost: 0.2,
    age_boost: { '50s': 0.3, '60s': 0.5, '70s': 0.7, '80s': 0.9 },
    income_boost: {},
    job_boost: { homemaker: 0.4, service: 0.2 },
  },
  trendy: {
    price_sensitivity_boost: -0.2,
    tech_savviness_boost: 0.8,
    brand_loyalty_boost: 0.5,
    age_boost: { '10s': 0.8, '20s': 0.6 },
    income_boost: {},
    job_boost: { student: 0.5 },
  },
  practical: {
    price_sensitivity_boost: 0.5,
    tech_savviness_boost: 0.1,
    brand_loyalty_boost: -0.2,
    age_boost: { '30s': 0.4, '40s': 0.4, '60s': 0.3 },
    income_boost: { mid: 0.3 },
    job_boost: { office: 0.4, homemaker: 0.3 },
  },
};

export const BASE_SCORE = 1.0;
