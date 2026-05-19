import type {
  Persona,
  PersonaChoice,
  SimulationOption,
  SimulationResult,
  OptionResult,
  SegmentBreakdown,
  AttrType,
  AgeGroup,
  Job,
  IncomeLevel,
} from '../types';

function emptySegments(): SegmentBreakdown {
  return {
    age: { '10s': 0, '20s': 0, '30s': 0, '40s': 0, '50s': 0, '60s': 0, '70s': 0, '80s': 0 },
    gender: { male: 0, female: 0 },
    region: { hokkaido: 0, tohoku: 0, kanto: 0, chubu: 0, kinki: 0, chugoku_shikoku: 0, kyushu: 0, okinawa: 0 },
    job: { office: 0, professional: 0, self_employed: 0, student: 0, homemaker: 0, service: 0, other: 0 },
    income: { low: 0, mid_low: 0, mid: 0, mid_high: 0, high: 0 },
  };
}

function topAttributes(segments: SegmentBreakdown, total: number) {
  const attrs: { type: AttrType; key: string; impact: number }[] = [];
  for (const [age, count] of Object.entries(segments.age) as [AgeGroup, number][]) {
    if (count > 0) attrs.push({ type: 'age', key: age, impact: count / total });
  }
  for (const [job, count] of Object.entries(segments.job) as [Job, number][]) {
    if (count > 0) attrs.push({ type: 'job', key: job, impact: count / total });
  }
  for (const [income, count] of Object.entries(segments.income) as [IncomeLevel, number][]) {
    if (count > 0) attrs.push({ type: 'income', key: income, impact: count / total });
  }
  return attrs.sort((a, b) => b.impact - a.impact).slice(0, 5);
}

export function aggregateResults(
  personas: Persona[],
  choices: PersonaChoice[],
  options: SimulationOption[]
): SimulationResult {
  const personaMap = new Map<number, Persona>(personas.map((p) => [p.id, p]));

  const buckets: Record<string, { count: number; segments: SegmentBreakdown }> = {};
  for (const opt of options) {
    buckets[opt.id] = { count: 0, segments: emptySegments() };
  }

  let noResponse = 0;

  for (const choice of choices) {
    const persona = personaMap.get(choice.personaId);
    if (!persona) { noResponse++; continue; }
    const bucket = buckets[choice.chosenOptionId];
    if (!bucket) { noResponse++; continue; }

    bucket.count++;
    bucket.segments.age[persona.age]++;
    bucket.segments.gender[persona.gender]++;
    bucket.segments.region[persona.region]++;
    bucket.segments.job[persona.job]++;
    bucket.segments.income[persona.income]++;
  }

  const total = personas.length - noResponse;

  const optionResults: OptionResult[] = options.map((opt) => {
    const bucket = buckets[opt.id];
    return {
      optionId: opt.id,
      label: opt.label,
      count: bucket.count,
      percentage: total > 0 ? (bucket.count / total) * 100 : 0,
      segments: bucket.segments,
      topAttributes: topAttributes(bucket.segments, bucket.count || 1),
    };
  });

  return {
    totalPersonas: personas.length,
    options: optionResults,
    noResponse,
    runAt: new Date().toISOString(),
  };
}
