import type { AgeGroup, Gender, Region } from '../types';
import type { DistributionData } from '../data/distributionTable';
import { STATIC_DISTRIBUTIONS } from '../data/distributionTable';

// e-Stat REST API v3
// https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData
const BASE = 'https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData';
const FETCH_TIMEOUT_MS = 10_000;

// ── Prefecture code (2-digit) → Region ───────────────────────────────────────
const PREF_TO_REGION: Record<string, Region> = {
  '01': 'hokkaido',
  '02': 'tohoku', '03': 'tohoku', '04': 'tohoku',
  '05': 'tohoku', '06': 'tohoku', '07': 'tohoku',
  '08': 'kanto',  '09': 'kanto',  '10': 'kanto',
  '11': 'kanto',  '12': 'kanto',  '13': 'kanto',  '14': 'kanto',
  '15': 'chubu',  '16': 'chubu',  '17': 'chubu',  '18': 'chubu',
  '19': 'chubu',  '20': 'chubu',  '21': 'chubu',  '22': 'chubu',  '23': 'chubu',
  '24': 'kinki',  '25': 'kinki',  '26': 'kinki',  '27': 'kinki',
  '28': 'kinki',  '29': 'kinki',  '30': 'kinki',
  '31': 'chugoku_shikoku', '32': 'chugoku_shikoku', '33': 'chugoku_shikoku',
  '34': 'chugoku_shikoku', '35': 'chugoku_shikoku', '36': 'chugoku_shikoku',
  '37': 'chugoku_shikoku', '38': 'chugoku_shikoku', '39': 'chugoku_shikoku',
  '40': 'kyushu', '41': 'kyushu', '42': 'kyushu', '43': 'kyushu',
  '44': 'kyushu', '45': 'kyushu', '46': 'kyushu',
  '47': 'okinawa',
};

// ── Low-level types ──────────────────────────────────────────────────────────
type EStatValue = Record<string, string>;

interface EStatClass { '@code': string; '@name': string }
interface EStatClassObj { '@id': string; '@name': string; CLASS: EStatClass | EStatClass[] }
interface EStatResponse {
  GET_STATS_DATA: {
    RESULT: { STATUS: number; ERROR_MSG: string };
    STATISTICAL_DATA: {
      CLASS_INF: { CLASS_OBJ: EStatClassObj | EStatClassObj[] };
      DATA_INF: { VALUE: EStatValue | EStatValue[] };
    };
  };
}

function toArr<T>(v: T | T[]): T[] { return Array.isArray(v) ? v : [v]; }

function normalize<K extends string>(counts: Record<K, number>): Record<K, number> {
  const total = (Object.values(counts) as number[]).reduce((s, v) => s + v, 0);
  if (total === 0) throw new Error('normalize: total is 0');
  const out = {} as Record<K, number>;
  for (const [k, v] of Object.entries(counts) as [K, number][]) {
    out[k] = v / total;
  }
  return out;
}

// 10초 타임아웃 + CLASS_INF 포함 fetch
async function fetchTable(statsDataId: string, appId: string, extra?: Record<string, string>) {
  const url = new URL(BASE);
  url.searchParams.set('appId', appId);
  url.searchParams.set('statsDataId', statsDataId);
  url.searchParams.set('metaGetFlg', 'Y');
  url.searchParams.set('explanationGetFlg', 'N');
  if (extra) Object.entries(extra).forEach(([k, v]) => url.searchParams.set(k, v));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: EStatResponse = await res.json();
    const { STATUS, ERROR_MSG } = json.GET_STATS_DATA.RESULT;
    if (STATUS !== 0) throw new Error(ERROR_MSG);
    const stat = json.GET_STATS_DATA.STATISTICAL_DATA;
    return {
      classObjs: toArr(stat.CLASS_INF.CLASS_OBJ),
      values: toArr(stat.DATA_INF.VALUE),
    };
  } finally {
    clearTimeout(timer);
  }
}

// ── Age/Sex helpers ──────────────────────────────────────────────────────────
function parseSexName(name: string): 'male' | 'female' | 'total' | null {
  if (/^男$/.test(name)) return 'male';
  if (/^女$/.test(name)) return 'female';
  if (/総数|合計|^計$/.test(name)) return 'total';
  return null;
}

function ageStartToGroup(start: number): AgeGroup | null {
  if (start < 10) return null;
  if (start < 20) return '10s';
  if (start < 30) return '20s';
  if (start < 40) return '30s';
  if (start < 50) return '40s';
  if (start < 60) return '50s';
  if (start < 70) return '60s';
  if (start < 80) return '70s';
  return '80s';
}

function parseAgeStart(name: string): number | null {
  const m = name.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

// ── Fetch AGE_DIST + GENDER_DIST (人口推計 2023, statsDataId: 0003412726) ────
async function fetchAgeGender(appId: string): Promise<{
  AGE_DIST: Record<AgeGroup, number>;
  GENDER_DIST: Record<Gender, number>;
}> {
  const { classObjs, values } = await fetchTable('0003412726', appId, { cdArea: '00000' });

  let sexDimKey = '';
  let ageDimKey = '';
  const sexCodeMap = new Map<string, 'male' | 'female' | 'total'>();
  const ageCodeMap = new Map<string, AgeGroup | null>();

  for (const obj of classObjs) {
    const classes = toArr(obj.CLASS);
    if (/男女|性別/.test(obj['@name']) && !sexDimKey) {
      sexDimKey = obj['@id'];
      for (const cls of classes) {
        const sex = parseSexName(cls['@name']);
        if (sex) sexCodeMap.set(cls['@code'], sex);
      }
    }
    if (/年齢/.test(obj['@name']) && !ageDimKey) {
      ageDimKey = obj['@id'];
      for (const cls of classes) {
        const start = parseAgeStart(cls['@name']);
        ageCodeMap.set(cls['@code'], start !== null ? ageStartToGroup(start) : null);
      }
    }
  }

  if (!sexDimKey || !ageDimKey) throw new Error('age/sex dimension not found');

  const ageCounts: Partial<Record<AgeGroup, number>> = {};
  let male = 0;
  let female = 0;

  for (const v of values) {
    const n = parseInt(v['$'] ?? '0', 10);
    if (isNaN(n) || n <= 0) continue;
    const sex = sexCodeMap.get(v[`@${sexDimKey}`] ?? '');
    const ageGroup = ageCodeMap.get(v[`@${ageDimKey}`] ?? '');
    if (sex === 'total' && ageGroup) ageCounts[ageGroup] = (ageCounts[ageGroup] ?? 0) + n;
    if (sex === 'male' && ageGroup) male += n;
    if (sex === 'female' && ageGroup) female += n;
  }

  // 総数カラムがない場合は male+female から再構築
  // Bug fix: undefined チェック（0 は有効な値なので falsy チェック不可）
  if (ageCounts['10s'] === undefined && male + female > 0) {
    for (const v of values) {
      const n = parseInt(v['$'] ?? '0', 10);
      if (isNaN(n) || n <= 0) continue;
      const sex = sexCodeMap.get(v[`@${sexDimKey}`] ?? '');
      const ageGroup = ageCodeMap.get(v[`@${ageDimKey}`] ?? '');
      if ((sex === 'male' || sex === 'female') && ageGroup) {
        ageCounts[ageGroup] = (ageCounts[ageGroup] ?? 0) + n;
      }
    }
    male = male || 1;
    female = female || 1;
  }

  const requiredGroups: AgeGroup[] = ['10s', '20s', '30s', '40s', '50s', '60s', '70s', '80s'];
  for (const g of requiredGroups) {
    if (ageCounts[g] === undefined) throw new Error(`missing age group: ${g}`);
  }

  const totalSex = male + female;
  return {
    AGE_DIST: normalize(ageCounts as Record<AgeGroup, number>),
    GENDER_DIST: { male: male / totalSex, female: female / totalSex },
  };
}

// ── Fetch REGION_DIST (国勢調査 2020, statsDataId: 0003410379) ───────────────
async function fetchRegion(appId: string): Promise<Record<Region, number>> {
  const { classObjs, values } = await fetchTable('0003410379', appId);

  let areaDimKey = '';
  const prefCodeMap = new Map<string, Region>();

  for (const obj of classObjs) {
    if (/都道府県|地域|area/i.test(obj['@name']) && !areaDimKey) {
      areaDimKey = obj['@id'];
      for (const cls of toArr(obj.CLASS)) {
        const region = PREF_TO_REGION[cls['@code'].slice(0, 2)];
        if (region) prefCodeMap.set(cls['@code'], region);
      }
    }
  }

  const regionCounts: Partial<Record<Region, number>> = {};

  for (const v of values) {
    const n = parseInt(v['$'] ?? '0', 10);
    if (isNaN(n) || n <= 0) continue;
    // 식별된 dimension key 우선, 없으면 @area 직접 참조
    const areaCode = (areaDimKey ? v[`@${areaDimKey}`] : undefined) ?? v['@area'] ?? '';
    const region = prefCodeMap.get(areaCode) ?? PREF_TO_REGION[areaCode.slice(0, 2)];
    if (region) regionCounts[region] = (regionCounts[region] ?? 0) + n;
  }

  const allRegions: Region[] = [
    'hokkaido', 'tohoku', 'kanto', 'chubu',
    'kinki', 'chugoku_shikoku', 'kyushu', 'okinawa',
  ];
  for (const r of allRegions) {
    if (regionCounts[r] === undefined) throw new Error(`missing region: ${r}`);
  }

  return normalize(regionCounts as Record<Region, number>);
}

// ── Public API ───────────────────────────────────────────────────────────────
export type DataSource = 'static' | 'api';

export async function tryFetchDistributions(
  apiKey: string,
): Promise<{ distributions: DistributionData; source: DataSource }> {
  const [ageGenderResult, regionResult] = await Promise.allSettled([
    fetchAgeGender(apiKey),
    fetchRegion(apiKey),
  ]);

  const distributions: DistributionData = { ...STATIC_DISTRIBUTIONS };
  let anySuccess = false;

  if (ageGenderResult.status === 'fulfilled') {
    distributions.AGE_DIST = ageGenderResult.value.AGE_DIST;
    distributions.GENDER_DIST = ageGenderResult.value.GENDER_DIST;
    anySuccess = true;
  } else {
    console.warn('[eStatApi] fetchAgeGender failed:', ageGenderResult.reason);
  }

  if (regionResult.status === 'fulfilled') {
    distributions.REGION_DIST = regionResult.value;
    anySuccess = true;
  } else {
    console.warn('[eStatApi] fetchRegion failed:', regionResult.reason);
  }

  return { source: anySuccess ? 'api' : 'static', distributions };
}
