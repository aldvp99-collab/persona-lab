import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { useSimulationStore } from '../../store/simulationStore';
import { useLangStore } from '../../store/langStore';
import { AGE_LABEL, JOB_LABEL, INCOME_LABEL } from '../../data/labelConfig';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

export default function Dashboard() {
  const { result } = useSimulationStore();
  const { lang, t } = useLangStore();
  if (!result) return null;

  const ageGroups = ['10s', '20s', '30s', '40s', '50s', '60s', '70s', '80s'] as const;
  const ageData = ageGroups.map((age) => ({
    age: AGE_LABEL[lang][age],
    ...Object.fromEntries(result.options.map((opt) => [opt.label, opt.segments.age[age]])),
  }));

  const incomeGroups = ['low', 'mid_low', 'mid', 'mid_high', 'high'] as const;
  const incomeData = incomeGroups.map((inc) => ({
    income: INCOME_LABEL[lang][inc],
    ...Object.fromEntries(result.options.map((opt) => [opt.label, opt.segments.income[inc]])),
  }));

  const attrTypeLabel = (type: 'age' | 'job' | 'income') =>
    ({ age: t.attrAge, job: t.attrJob, income: t.attrIncome })[type];

  const attrValueLabel = (type: 'age' | 'job' | 'income', key: string) => {
    const maps = { age: AGE_LABEL[lang], job: JOB_LABEL[lang], income: INCOME_LABEL[lang] };
    return maps[type][key] ?? key;
  };

  const pieData = result.options.map((opt) => ({ name: opt.label, value: opt.count }));

  return (
    <div className="space-y-5">
      {/* 요약 카드 */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${Math.min(result.options.length + 1, 4)}, minmax(0, 1fr))` }}
      >
        {result.options.map((opt, i) => (
          <div key={opt.optionId} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-gray-400 mb-1">{opt.label}</p>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: COLORS[i] }}>
              {opt.percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">{opt.count.toLocaleString()}{t.selectedSuffix}</p>
          </div>
        ))}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-gray-400 mb-1">{t.totalLabel}</p>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-800">
            {result.totalPersonas.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">{t.noResponseLabel} {result.noResponse}</p>
        </div>
      </div>

      {/* 파이차트 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-4">{t.ratioTitle}</h3>
        <div className="h-[240px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                outerRadius="70%"
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ''} ${((percent ?? 0) * 100).toFixed(1)}%`
                }
              >
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => (typeof v === 'number' ? v.toLocaleString() : v) + t.peopleSuffix} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 연령대별 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-4">{t.ageTitle}</h3>
        <div className="h-[240px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData} margin={{ left: -10 }}>
              <XAxis dataKey="age" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {result.options.map((opt, i) => (
                <Bar key={opt.optionId} dataKey={opt.label} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 소득별 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-4">{t.incomeTitle}</h3>
        <div className="h-[240px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeData} margin={{ left: -10 }}>
              <XAxis dataKey="income" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {result.options.map((opt, i) => (
                <Bar key={opt.optionId} dataKey={opt.label} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 세그먼트 상위 속성 */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {result.options.map((opt, i) => (
          <div key={opt.optionId} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold mb-4" style={{ color: COLORS[i] }}>
              {t.topSegTitle(opt.label)}
            </h3>
            <ul className="space-y-3">
              {opt.topAttributes.map((attr, j) => {
                const label = `${attrTypeLabel(attr.type)}: ${attrValueLabel(attr.type, attr.key)}`;
                return (
                  <li key={j} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-600 shrink-0 min-w-0 truncate">{label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-20 sm:w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(attr.impact * 100, 100).toFixed(0)}%`, backgroundColor: COLORS[i] }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">
                        {(attr.impact * 100).toFixed(1)}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
