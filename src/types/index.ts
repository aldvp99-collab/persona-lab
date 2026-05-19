export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60s' | '70s' | '80s';
export type Gender = 'male' | 'female';
export type Region =
  | 'hokkaido'        // 北海道
  | 'tohoku'          // 東北 (青森・岩手・宮城・秋田・山形・福島)
  | 'kanto'           // 関東 (東京・神奈川・埼玉・千葉・茨城・栃木・群馬)
  | 'chubu'           // 中部 (愛知・静岡・新潟・長野・岐阜・富山・石川・福井・山梨)
  | 'kinki'           // 近畿 (大阪・兵庫・京都・三重・滋賀・奈良・和歌山)
  | 'chugoku_shikoku' // 中国・四国 (広島・岡山・山口・鳥取・島根・愛媛・高知・香川・徳島)
  | 'kyushu'          // 九州 (福岡・佐賀・長崎・熊本・大分・宮崎・鹿児島)
  | 'okinawa';        // 沖縄
export type Job = 'office' | 'professional' | 'self_employed' | 'student' | 'homemaker' | 'service' | 'other';
export type IncomeLevel = 'low' | 'mid_low' | 'mid' | 'mid_high' | 'high';
export type Interest = 'discount' | 'brand' | 'tech' | 'health' | 'culture' | 'travel';

export interface Persona {
  id: number;
  age: AgeGroup;
  gender: Gender;
  region: Region;
  job: Job;
  income: IncomeLevel;
  interests: Interest[];
  price_sensitivity: number;   // 0~1
  tech_savviness: number;      // 0~1
  brand_loyalty: number;       // 0~1
}

export interface SimulationOption {
  id: string;
  label: string;       // e.g. "A안"
  description: string;
  price?: number;
  tags: string[];      // e.g. ["premium", "feature-rich"]
}

export interface SimulationConfig {
  hypothesis: string;
  options: SimulationOption[];
  populationSize: number;
  targetSegment?: Partial<Pick<Persona, 'age' | 'gender' | 'region' | 'job' | 'income'>>;
}

export interface PersonaChoice {
  personaId: number;
  chosenOptionId: string;
  scores: Record<string, number>;
}

export interface SegmentBreakdown {
  age: Record<AgeGroup, number>;
  gender: Record<Gender, number>;
  region: Record<Region, number>;
  job: Record<Job, number>;
  income: Record<IncomeLevel, number>;
}

export type AttrType = 'age' | 'job' | 'income';

export interface OptionResult {
  optionId: string;
  label: string;
  count: number;
  percentage: number;
  segments: SegmentBreakdown;
  topAttributes: { type: AttrType; key: string; impact: number }[];
}

export interface SimulationResult {
  totalPersonas: number;
  options: OptionResult[];
  noResponse: number;
  runAt: string;
}

export type SimulationStatus = 'idle' | 'running' | 'done' | 'error';
