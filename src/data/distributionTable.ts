import type { AgeGroup, Gender, Region, Job, IncomeLevel } from '../types';

export interface DistributionData {
  AGE_DIST: Record<AgeGroup, number>;
  GENDER_DIST: Record<Gender, number>;
  REGION_DIST: Record<Region, number>;
  JOB_DIST_BY_AGE: Record<AgeGroup, Record<Job, number>>;
  INCOME_DIST_BY_AGE: Record<AgeGroup, Record<IncomeLevel, number>>;
}

// e-Stat 人口推計 2023年10月1日現在 (統計表ID: 0003412726) — 10歳以上の年齢分布を正規化 (80s = 80歳以上)
export const AGE_DIST: Record<AgeGroup, number> = {
  '10s': 0.090,
  '20s': 0.103,
  '30s': 0.124,
  '40s': 0.158,
  '50s': 0.150,
  '60s': 0.134,
  '70s': 0.142,
  '80s': 0.099,
};

// e-Stat 人口推計 2023年10月1日現在 (統計表ID: 0003412726) — 男女別人口割合
export const GENDER_DIST: Record<Gender, number> = {
  male: 0.490,
  female: 0.510,
};

// e-Stat 国勢調査 2020 (統計表ID: 0003412313) — 8広域圏別人口割合
export const REGION_DIST: Record<Region, number> = {
  hokkaido: 0.042,
  tohoku: 0.071,
  kanto: 0.354,
  chubu: 0.176,
  kinki: 0.182,
  chugoku_shikoku: 0.057,
  kyushu: 0.106,
  okinawa: 0.012,
};

// e-Stat 就業構造基本調査 2022 (統計表ID: 0003461000) — 年齢階級別職業分布
export const JOB_DIST_BY_AGE: Record<AgeGroup, Record<Job, number>> = {
  '10s': { student: 0.85, service: 0.05, homemaker: 0.02, office: 0.01, professional: 0.01, self_employed: 0.01, other: 0.05 },
  '20s': { student: 0.30, office: 0.30, service: 0.15, professional: 0.12, self_employed: 0.05, homemaker: 0.05, other: 0.03 },
  '30s': { office: 0.35, homemaker: 0.18, professional: 0.17, self_employed: 0.13, service: 0.09, other: 0.06, student: 0.02 },
  '40s': { office: 0.32, self_employed: 0.20, homemaker: 0.17, professional: 0.16, service: 0.08, other: 0.06, student: 0.01 },
  '50s': { office: 0.26, self_employed: 0.22, homemaker: 0.18, professional: 0.13, service: 0.11, other: 0.09, student: 0.01 },
  '60s': { homemaker: 0.22, other: 0.20, self_employed: 0.18, office: 0.15, service: 0.12, professional: 0.08, student: 0.05 },
  '70s': { other: 0.40, homemaker: 0.28, self_employed: 0.10, service: 0.07, office: 0.05, professional: 0.05, student: 0.05 },
  '80s': { other: 0.55, homemaker: 0.30, self_employed: 0.05, service: 0.04, professional: 0.02, office: 0.01, student: 0.03 },
};

// e-Stat 就業構造基本調査 2022 年間収入階級別 (low: <200万, mid_low: 200-400万, mid: 400-600万, mid_high: 600-800万, high: 800万+)
export const INCOME_DIST_BY_AGE: Record<AgeGroup, Record<IncomeLevel, number>> = {
  '10s': { low: 0.55, mid_low: 0.25, mid: 0.12, mid_high: 0.05, high: 0.03 },
  '20s': { low: 0.30, mid_low: 0.32, mid: 0.22, mid_high: 0.10, high: 0.06 },
  '30s': { low: 0.18, mid_low: 0.24, mid: 0.28, mid_high: 0.19, high: 0.11 },
  '40s': { low: 0.14, mid_low: 0.20, mid: 0.27, mid_high: 0.24, high: 0.15 },
  '50s': { low: 0.15, mid_low: 0.21, mid: 0.26, mid_high: 0.23, high: 0.15 },
  '60s': { low: 0.20, mid_low: 0.28, mid: 0.25, mid_high: 0.18, high: 0.09 },
  '70s': { low: 0.30, mid_low: 0.32, mid: 0.22, mid_high: 0.11, high: 0.05 },
  '80s': { low: 0.40, mid_low: 0.32, mid: 0.18, mid_high: 0.07, high: 0.03 },
};

export const STATIC_DISTRIBUTIONS: DistributionData = {
  AGE_DIST,
  GENDER_DIST,
  REGION_DIST,
  JOB_DIST_BY_AGE,
  INCOME_DIST_BY_AGE,
};