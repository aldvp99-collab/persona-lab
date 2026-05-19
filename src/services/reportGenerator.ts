import type { SimulationConfig, SimulationResult, OptionResult } from '../types';
import type { Lang, Strings } from '../i18n/strings';
import { strings } from '../i18n/strings';
import { AGE_LABEL, JOB_LABEL, INCOME_LABEL } from '../data/labelConfig';

function fmt(n: number) { return `${n.toFixed(1)}%`; }

function attrLabel(attr: { type: 'age' | 'job' | 'income'; key: string }, lang: Lang, t: Strings): string {
  const typeStr = { age: t.attrAge, job: t.attrJob, income: t.attrIncome }[attr.type];
  const maps = { age: AGE_LABEL[lang], job: JOB_LABEL[lang], income: INCOME_LABEL[lang] };
  return `${typeStr}: ${maps[attr.type][attr.key] ?? attr.key}`;
}

function topSegLine(opt: OptionResult, lang: Lang, t: Strings): string {
  const topAge   = Object.entries(opt.segments.age).sort(([,a],[,b]) => b - a)[0];
  const topJob   = Object.entries(opt.segments.job).sort(([,a],[,b]) => b - a)[0];
  const topInc   = Object.entries(opt.segments.income).sort(([,a],[,b]) => b - a)[0];
  return [
    `${t.attrAge} ${AGE_LABEL[lang][topAge[0]] ?? topAge[0]}`,
    `${t.attrJob} ${JOB_LABEL[lang][topJob[0]] ?? topJob[0]}`,
    `${t.attrIncome} ${INCOME_LABEL[lang][topInc[0]] ?? topInc[0]}`,
  ].join(' / ');
}

export function generateReport(
  config: SimulationConfig,
  result: SimulationResult,
  lang: Lang = 'ko',
): Promise<string> {
  const t = strings[lang];
  const sorted = [...result.options].sort((a, b) => b.percentage - a.percentage);
  const winner = sorted[0];
  const runnerUp = sorted[1];
  const gap = winner.percentage - runnerUp.percentage;

  const winnerLine = gap < 3
    ? t.reportTie(winner.label, runnerUp.label, fmt(winner.percentage), fmt(runnerUp.percentage))
    : t.reportWinner(winner.label, fmt(winner.percentage), runnerUp.label, gap.toFixed(1));

  const lines: string[] = [];

  lines.push(`## ${t.reportH1}`);
  lines.push(winnerLine);
  lines.push('');

  lines.push(`## ${t.reportH2}`);
  for (const opt of result.options) {
    lines.push(`**${opt.label}** (${fmt(opt.percentage)}, ${opt.count.toLocaleString()}${t.peopleSuffix})`);
    lines.push(`- ${t.reportTopSeg}: ${topSegLine(opt, lang, t)}`);
    if (opt.topAttributes.length > 0) {
      const attrs = opt.topAttributes.slice(0, 3)
        .map((a) => `${attrLabel(a, lang, t)} (${fmt(a.impact * 100)})`)
        .join(', ');
      lines.push(`- ${t.reportTopAttr}: ${attrs}`);
    }
  }
  lines.push('');

  lines.push(`## ${t.reportH3}`);
  if (!config.hypothesis.trim()) {
    lines.push(t.reportHypothesisNone);
  } else {
    lines.push(`${t.reportHypothesisLabel}: "${config.hypothesis}"`);
    lines.push(`${t.reportHypothesisResult}: ${t.reportHypothesisWinnerLine(winner.label, fmt(winner.percentage))} ${t.reportHypothesisNote}`);
  }
  lines.push('');

  lines.push(`## ${t.reportH4}`);
  lines.push(`- ${t.reportAdvice1(winner.label)}`);
  lines.push(`- ${t.reportAdvice2(result.noResponse, fmt((result.noResponse / result.totalPersonas) * 100))}`);
  lines.push('');
  lines.push(`> ${t.reportFooter}`);

  return Promise.resolve(lines.join('\n'));
}
