import { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { useLangStore } from '../../store/langStore';
import { generateReport } from '../../services/reportGenerator';

export default function ReportPanel() {
  const { result, config, report, setReport, setError, error } = useSimulationStore();
  const { lang, t } = useLangStore();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!result) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const text = await generateReport(config, result, lang);
      setReport(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-bold text-gray-800">{t.reportTitle}</h2>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !!report}
          className="shrink-0 text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl transition-colors font-semibold shadow-sm"
        >
          {isGenerating ? t.generatingBtn : report ? t.generatedBtn : t.generateBtn}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {report && (
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-5 prose prose-sm max-w-none">
          {report}
        </div>
      )}

      {!report && !error && (
        <p className="text-sm text-gray-400">{t.reportDesc}</p>
      )}
    </div>
  );
}
