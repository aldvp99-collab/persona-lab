import { useRef } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { useLangStore } from '../../store/langStore';
import type { SimulationOption } from '../../types';

const AVAILABLE_TAGS = ['cheap', 'premium', 'feature-rich', 'simple', 'trendy', 'practical'];
const MIN_POP = 100;
const MAX_POP = 100000;

export default function InputForm({ onRun }: { onRun: () => void }) {
  const { config, setConfig, status } = useSimulationStore();
  const { t } = useLangStore();

  // 비제어 입력: ref로 직접 DOM 값을 읽고, 슬라이더가 움직일 때만 imperatively 동기화
  const popInputRef = useRef<HTMLInputElement>(null);

  const commitPop = (raw: string) => {
    const n = parseInt(raw, 10);
    const clamped = isNaN(n) ? config.populationSize : Math.min(MAX_POP, Math.max(MIN_POP, n));
    setConfig({ populationSize: clamped });
    if (popInputRef.current) popInputRef.current.value = String(clamped);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value);
    setConfig({ populationSize: n });
    // 입력창이 포커스 상태가 아닐 때만 동기화 (타이핑 중 방해 금지)
    if (popInputRef.current && document.activeElement !== popInputRef.current) {
      popInputRef.current.value = String(n);
    }
  };

  const updateOption = (index: number, patch: Partial<SimulationOption>) => {
    const updated = config.options.map((o, i) => i === index ? { ...o, ...patch } : o);
    setConfig({ options: updated });
  };

  const toggleTag = (optionIndex: number, tag: string) => {
    const option = config.options[optionIndex];
    const tags = option.tags.includes(tag)
      ? option.tags.filter((t) => t !== tag)
      : [...option.tags, tag];
    updateOption(optionIndex, { tags });
  };

  const addOption = () => {
    const { lang } = useLangStore.getState();
    const id = String.fromCharCode(65 + config.options.length);
    const suffix = lang === 'ja' ? '案' : '안';
    setConfig({
      options: [...config.options, { id, label: `${id}${suffix}`, description: '', tags: [] }],
    });
  };

  const removeOption = (index: number) => {
    if (config.options.length <= 2) return;
    setConfig({ options: config.options.filter((_, i) => i !== index) });
  };

  const isRunning = status === 'running';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
      <h2 className="text-lg font-bold text-gray-900">{t.settingsTitle}</h2>

      {/* 가설 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{t.hypothesis}</label>
        <textarea
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 placeholder-gray-400 transition"
          rows={3}
          placeholder={t.hypothesisPlaceholder}
          value={config.hypothesis}
          onChange={(e) => setConfig({ hypothesis: e.target.value })}
        />
      </div>

      {/* 선택지 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">{t.choices}</label>
          {config.options.length < 4 && (
            <button
              onClick={addOption}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition"
            >
              {t.addChoice}
            </button>
          )}
        </div>

        {config.options.map((option, idx) => (
          <div key={option.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-indigo-700 tracking-wide">{option.label}</span>
              {config.options.length > 2 && (
                <button
                  onClick={() => removeOption(idx)}
                  className="text-xs text-red-400 hover:text-red-600 transition"
                >
                  {t.deleteChoice}
                </button>
              )}
            </div>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition"
              placeholder={t.descPlaceholder(option.label)}
              value={option.description}
              onChange={(e) => updateOption(idx, { description: e.target.value })}
            />
            <input
              type="number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition"
              placeholder={t.pricePlaceholder}
              value={option.price ?? ''}
              onChange={(e) => updateOption(idx, { price: e.target.value ? Number(e.target.value) : undefined })}
            />
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">{t.tagsLabel}</p>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(idx, tag)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      option.tags.includes(tag)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 인원 수 — 슬라이더 + 직접 입력 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">{t.populationLabel}</label>
          <div className="flex items-center gap-1.5">
            <input
              ref={popInputRef}
              type="number"
              min={MIN_POP}
              max={MAX_POP}
              defaultValue={config.populationSize}
              onBlur={(e) => commitPop(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              className="w-24 text-right border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm text-gray-500 shrink-0">{t.peopleSuffix}</span>
          </div>
        </div>

        <input
          type="range"
          min={MIN_POP}
          max={MAX_POP}
          step={100}
          value={config.populationSize}
          onChange={handleSliderChange}
          className="w-full accent-indigo-600 h-2 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>{MIN_POP.toLocaleString()}{t.peopleSuffix}</span>
          <span>{MAX_POP.toLocaleString()}{t.peopleSuffix}</span>
        </div>
      </div>

      <button
        onClick={onRun}
        disabled={isRunning || !config.hypothesis.trim()}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
      >
        {isRunning ? t.runningBtn : t.runBtn}
      </button>
    </div>
  );
}
