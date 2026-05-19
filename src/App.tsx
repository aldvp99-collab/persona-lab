import { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from './store/simulationStore';
import { useLangStore } from './store/langStore';
import { STATIC_DISTRIBUTIONS } from './data/distributionTable';
import type { DistributionData } from './data/distributionTable';
import { tryFetchDistributions } from './services/eStatApi';
import type { DataSource } from './services/eStatApi';
import InputForm from './components/InputForm/InputForm';
import Dashboard from './components/Dashboard/Dashboard';
import ReportPanel from './components/ReportPanel/ReportPanel';

export default function App() {
  const { config, setResult, setStatus, setError, status, result, reset } = useSimulationStore();
  const { lang, t, setLang } = useLangStore();
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(true);

  const workerRef = useRef<Worker | null>(null);
  const distributionsRef = useRef<DistributionData>(STATIC_DISTRIBUTIONS);
  const [dataSource, setDataSource] = useState<DataSource>('static');

  // 앱 마운트 시 e-Stat API로 최신 분포 데이터 fetch 시도
  useEffect(() => {
    const apiKey = import.meta.env.VITE_ESTAT_API_KEY as string | undefined;
    let cancelled = false;

    if (apiKey?.trim()) {
      tryFetchDistributions(apiKey).then(({ distributions, source }) => {
        if (cancelled) return;
        distributionsRef.current = distributions;
        setDataSource(source);
      });
    }

    return () => {
      cancelled = true;
      workerRef.current?.terminate();
    };
  }, []);

  const handleRun = () => {
    workerRef.current?.terminate();
    reset();
    setStatus('running');
    setMobileSettingsOpen(false);

    const worker = new Worker(
      new URL('./engine/simulationWorker.ts', import.meta.url),
      { type: 'module' },
    );
    workerRef.current = worker;

    worker.onmessage = ({ data }) => {
      if (data.type === 'done') {
        setResult(data.result);
        setStatus('done');
      } else {
        setError(data.message ?? t.errorMsg);
        setStatus('error');
      }
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = (e) => {
      setError(e.message ?? t.errorMsg);
      setStatus('error');
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage({ config, distributions: distributionsRef.current });
  };

  const handleReset = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    reset();
    setMobileSettingsOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── 헤더 ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
          {/* 로고 */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200">
              <span className="text-white text-xs font-extrabold tracking-tight">PL</span>
            </div>
            <div className="min-w-0">
              <span className="text-[15px] font-extrabold text-gray-900 tracking-tight">PersonaLAB</span>
              <span className="ml-2 text-[11px] text-gray-400 hidden sm:inline">{t.appDesc}</span>
            </div>
          </div>

          {/* 우측 컨트롤 */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* 데이터 소스 배지 */}
            <span className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              dataSource === 'api'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-50 text-gray-400 border-gray-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dataSource === 'api' ? 'bg-emerald-400' : 'bg-gray-300'}`} />
              {dataSource === 'api' ? t.dataSourceApi : t.dataSourceStatic}
            </span>

            {/* 언어 토글 */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[13px] font-semibold">
              <button
                onClick={() => setLang('ko')}
                className={`px-3.5 py-1.5 transition-colors ${lang === 'ko' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                한국
              </button>
              <button
                onClick={() => setLang('ja')}
                className={`px-3.5 py-1.5 transition-colors ${lang === 'ja' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                日本
              </button>
            </div>
            {status === 'done' && (
              <button
                onClick={handleReset}
                className="text-[13px] text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-3.5 py-1.5 rounded-lg transition-colors font-medium"
              >
                {t.reset}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── 본문 ── */}
      <main className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-12 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-10">

          {/* 사이드바 */}
          <aside className="w-full lg:w-[420px] lg:shrink-0">
            {/* 모바일 토글 버튼 */}
            <button
              className="lg:hidden w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-semibold text-gray-700 shadow-sm mb-3"
              onClick={() => setMobileSettingsOpen((v) => !v)}
            >
              <span>{t.settingsTitle}</span>
              <span className="text-gray-400">{mobileSettingsOpen ? '▲' : '▼'}</span>
            </button>
            <div className={`lg:sticky lg:top-24 ${mobileSettingsOpen ? 'block' : 'hidden lg:block'}`}>
              <InputForm onRun={handleRun} />
            </div>
          </aside>

          {/* 결과 영역 */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* 실행 중 */}
            {status === 'running' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 rounded-2xl mb-5">
                  <div className="w-7 h-7 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-gray-700 font-semibold text-base">{t.simRunning(config.populationSize)}</p>
              </div>
            )}

            {/* 에러 */}
            {status === 'error' && (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-10 text-center">
                <p className="text-red-600 font-semibold">{t.errorMsg}</p>
              </div>
            )}

            {/* 결과 */}
            {status === 'done' && result && (
              <>
                <Dashboard />
                <ReportPanel />
              </>
            )}

            {/* ── 랜딩 화면 ── */}
            {status === 'idle' && (
              <div className="space-y-5">

                {/* 히어로 카드 */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* 그라데이션 헤더 */}
                  <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-8 sm:px-10 py-10 sm:py-12">
                    <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-5">
                      <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                      <span className="text-white/90 text-xs font-semibold tracking-wide">e-Stat 2023</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
                      PersonaLAB
                    </h2>
                    <p className="text-indigo-200 text-sm sm:text-[15px] leading-relaxed max-w-lg">
                      {t.landingTagline}
                    </p>
                  </div>

                  {/* 기능 3분할 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                    {([
                      {
                        title: t.feat1Title,
                        desc: t.feat1Desc,
                        color: 'bg-indigo-50 text-indigo-600',
                        icon: (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        ),
                      },
                      {
                        title: t.feat2Title,
                        desc: t.feat2Desc,
                        color: 'bg-violet-50 text-violet-600',
                        icon: (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        ),
                      },
                      {
                        title: t.feat3Title,
                        desc: t.feat3Desc,
                        color: 'bg-emerald-50 text-emerald-600',
                        icon: (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        ),
                      },
                    ] as const).map((f) => (
                      <div key={f.title} className="px-7 py-6">
                        <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3 ${f.color}`}>
                          {f.icon}
                        </div>
                        <p className="text-sm font-bold text-gray-800 mb-1.5">{f.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 사용법 + 데이터 커버리지 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* 사용법 */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-7 py-6">
                    <p className="text-sm font-bold text-gray-800 mb-5">{t.howToTitle}</p>
                    <div className="space-y-5">
                      {([
                        { n: '1', title: t.step1Title, desc: t.step1Desc },
                        { n: '2', title: t.step2Title, desc: t.step2Desc },
                        { n: '3', title: t.step3Title, desc: t.step3Desc },
                      ] as const).map((s) => (
                        <div key={s.n} className="flex gap-4 items-start">
                          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-bold">{s.n}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 leading-none mb-1">{s.title}</p>
                            <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 데이터 커버리지 */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-7 py-6">
                    <p className="text-sm font-bold text-gray-800 mb-5">{t.dataTitle}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { value: '8', label: t.stat1 },
                        { value: '8', label: t.stat2 },
                        { value: '7', label: t.stat3 },
                        { value: '5', label: t.stat4 },
                      ] as const).map((s) => (
                        <div key={s.label} className="bg-slate-50 rounded-xl p-4 text-center border border-gray-100">
                          <p className="text-3xl font-extrabold text-indigo-600 leading-none mb-1.5">{s.value}</p>
                          <p className="text-[11px] text-gray-500 font-medium leading-snug">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
