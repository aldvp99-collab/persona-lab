# PersonaLAB

e-Stat（日本統計局）公開統計基盤の仮想ペルソナで、リリース前の A/B/C 選択肢への日本消費者反応をシミュレーションするツール。

> e-Stat 공개통계 기반 가상 페르소나로 출시 전 A/B/C 선택지에 대한 일본 소비자 반응을 시뮬레이션하는 도구.

---

## Features

- **페르소나 생성** — e-Stat 국세조사 2020 · 인구추계 2023 기반 연령/성별/지역/직업/소득 분포로 최대 10만 명의 가상 인구 샘플링
- **A/B/C/D 시뮬레이션** — 가격·태그·속성 가중치 × softmax 확률로 각 선택지 반응 계산
- **세그먼트 분석** — 연령대·소득·직업별 선호 분포 차트 + 주요 속성 시각화
- **결과 요약** — 규칙 기반 자동 요약 리포트 생성 (Claude API 연동 옵션)
- **한국어 / 日本語** — 헤더 토글로 UI 전체 언어 전환

---

## Tech Stack

| 분류 | 기술 |
|------|------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| 상태관리 | Zustand |
| 차트 | Recharts |
| 빌드 | Vite |
| 데이터 | e-Stat 내장 분포 테이블 (실시간 API 연동 예정) |

---

## Getting Started

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

### 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일에서 아래 값을 설정합니다.

| 변수 | 설명 |
|------|------|
| `VITE_ESTAT_API_KEY` | e-Stat API 키 ([e-Stat API 신청](https://www.e-stat.go.jp/api/)) |
| `VITE_ANTHROPIC_API_KEY` | Claude API 키 (결과 요약 AI 리포트 옵션, 없으면 규칙 기반 요약으로 동작) |

---

## Project Structure

```
src/
├── engine/
│   ├── personaGenerator.ts   # e-Stat 분포 테이블 기반 페르소나 샘플링
│   ├── reactionEngine.ts     # 속성×가중치 → softmax 확률 선택
│   └── aggregator.ts         # 결과 집계 + 세그먼트 분석
├── services/
│   └── reportGenerator.ts    # 결과 요약 생성 (규칙 기반 / Claude API 전환 가능)
├── components/
│   ├── InputForm/            # 실험 설정 UI
│   ├── Dashboard/            # 결과 시각화
│   └── ReportPanel/          # 요약 리포트 UI
├── store/
│   ├── simulationStore.ts    # 시뮬레이션 전역 상태 (Zustand)
│   └── langStore.ts          # 언어 상태 (ko / ja)
├── data/
│   ├── distributionTable.ts  # e-Stat 기반 분포 테이블 (연령/성별/지역/직업/소득)
│   ├── weightConfig.ts       # 태그별 가중치 테이블
│   └── labelConfig.ts        # 연령/직업/소득/지역 레이블 (ko / ja)
├── i18n/
│   └── strings.ts            # UI 문자열 (한국어 / 日本語)
└── types/
    └── index.ts              # 공통 타입 정의
```

---

## Persona Attributes

| 속성 | 설명 | 범위 |
|------|------|------|
| `age` | 연령대 | 10s ~ 80s |
| `gender` | 성별 | male / female |
| `region` | 거주 광역권 | 8대 광역권 |
| `job` | 직업군 | 7개 직업군 |
| `income` | 연간 소득 | 5개 구간 (200만엔 미만 ~ 800만엔 이상) |
| `interests` | 관심사 | discount / brand / tech / health / culture / travel |
| `price_sensitivity` | 가격 민감도 | 0.0 ~ 1.0 |
| `tech_savviness` | 기술 친숙도 | 0.0 ~ 1.0 |
| `brand_loyalty` | 브랜드 충성도 | 0.0 ~ 1.0 |

---

## Data Sources

| 데이터 | 출처 | 통계표 ID |
|--------|------|-----------|
| 연령 분포 | e-Stat 人口推計 2023 | 0003412726 |
| 지역별 인구 | e-Stat 国勢調査 2020 | 0003412313 |
| 직업 분포 | e-Stat 就業構造基本調査 2022 | 0003461000 |
| 소득 분포 | e-Stat 就業構造基本調査 2022 | 0003461000 |

---

## Design Principles

- 엔진 함수는 순수 함수 (사이드이펙트 없음, 테스트 가능)
- 분포 테이블은 `distributionTable.ts`에서만, 가중치는 `weightConfig.ts`에서만 관리
- Claude API는 리포트 생성 1회만 호출 (루프 내 금지)
- 레이블 번역은 `labelConfig.ts`에서만 관리, 렌더 시점에 언어 적용

---

## Roadmap

- [ ] e-Stat API 실시간 fetch 연동
- [ ] Web Worker 적용 (10만 명 시뮬레이션 메인 스레드 블로킹 해소)
- [ ] Claude API 연동 AI 리포트
- [ ] 지역별 차트 추가
- [ ] Tailwind → 순수 CSS 전환

---

## License

MIT
