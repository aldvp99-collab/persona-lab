# PersonaLAB

## 프로젝트 개요
가상 페르소나를 생성하여 출시 전 A/B/C 선택지 반응을 시뮬레이션하는 도구.
실제 사용자 없이 e-Stat(일본 통계국) 공공통계 기반 페르소나로 일본 소비자 반응을 예측한다.

## 기술 스택
- Frontend: React + Tailwind CSS (추후 Tailwind → 순수 CSS 전환 예정)
- Language: TypeScript (점진적 타입 적용 전략)
- 시뮬레이션: 브라우저 내 JS (Web Worker 적용 예정)
- 결과 요약: 규칙 기반 자동 요약 (Claude API 연동은 추후 옵션)
- 상태관리: Zustand
- 차트: Recharts
- 페르소나 데이터: e-Stat 공공통계 기반 분포 테이블 내장 + e-Stat API 연동 가능 (VITE_ESTAT_API_KEY)

## 디렉토리 구조
- `src/engine/personaGenerator.ts`    : e-Stat 분포 테이블 기반 페르소나 샘플링
- `src/engine/reactionEngine.ts`      : 속성×가중치 → softmax 확률 선택
- `src/engine/aggregator.ts`          : 결과 집계 + 세그먼트 분석
- `src/services/reportGenerator.ts`   : 규칙 기반 자동 요약 생성 (Claude API 연동 시 이 파일만 교체)
- `src/components/InputForm/`         : 선택지 입력 UI
- `src/components/Dashboard/`         : 결과 시각화 UI
- `src/components/ReportPanel/`       : AI 리포트 UI
- `src/store/simulationStore.ts`      : Zustand 전역 상태
- `src/data/distributionTable.ts`     : e-Stat 기반 분포 테이블 (연령/성별/소득/직업/지역)
- `src/data/weightConfig.ts`          : 가중치 테이블 (하드코딩 금지)

## 설계 원칙
- 엔진 함수는 순수 함수로 작성 (사이드이펙트 없음, 테스트 가능)
- 분포 테이블은 distributionTable.ts에서만 관리, 가중치 테이블은 weightConfig.ts에서만 관리
- 결과 요약은 현재 규칙 기반으로 동작 (Claude API 연동 시 reportGenerator.ts만 교체, 루프 내 호출 절대 금지)
- 10만 명 처리 시 메인 스레드 블로킹 주의 → Web Worker로 분리
- Tailwind 클래스는 컴포넌트 단위로 명확히 분리 (CSS 전환 대비)
- TS는 점진적 적용: 핵심 인터페이스 우선, 나머지는 추론 활용

## 페르소나 속성
age (10s~80s), gender, region, job, income, interests, price_sensitivity, tech_savviness, brand_loyalty

## 주의사항
- 페르소나 속성 추가 시 personaGenerator + reactionEngine + distributionTable 동시 수정
- distributionTable.ts는 e-Stat 통계 갱신 시 배포 단위로 업데이트, 또는 e-Stat API(VITE_ESTAT_API_KEY)로 최신 데이터 fetch 가능
- 분포 테이블 수치 변경 시 반드시 출처 e-Stat 통계표 ID를 주석으로 명시