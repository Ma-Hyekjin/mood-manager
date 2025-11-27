# Development Notes

이 문서는 프로젝트 개발 과정에서의 주요 결정사항, 아키텍처 설계, 이슈 해결 과정을 기록합니다.

---

## 1. 리팩토링 이력

### Home 컴포넌트 리팩토링 (완료)

#### Phase 1: 유틸리티 및 타입 정리
- ✅ `hexToRgba` 중복 제거 (`MoodDashboard.tsx` → `@/lib/utils`)
- ✅ 디바이스 업데이트 로직을 `useDeviceSync` 훅으로 추출
- ✅ `MoodStreamSegment`와 `Mood` 타입 일치 (`moodStreamConverter.ts` 생성)

#### Phase 2: 상태 관리 개선
- ✅ `HomeContent`의 디바이스 업데이트 로직을 `useDeviceSync` 훅으로 분리
- ✅ LLM 호출 로직은 `useBackgroundParams` 훅으로 관리

#### Phase 3: 컴포넌트 분리
- ✅ `MoodDashboard`의 색상 계산 로직을 `useMoodColors` 훅으로 분리
- ✅ 하트 애니메이션 로직을 `useHeartAnimation` 훅으로 분리
- ✅ 세그먼트 선택 로직을 `useSegmentSelector` 훅으로 분리

#### Phase 4: Props 최적화
- ✅ `HomeContent` props를 `moodState`, `deviceState`, `backgroundState`로 그룹화
- ✅ Props 개수: 9개 → 3개 객체로 감소

#### Phase 5: 성능 최적화
- ✅ `useMemo`: `currentScentLevel`, `rawMoodColor`, `pastelMoodColor`, `deviceGridMood`
- ✅ `useCallback`: `handleRefreshRequest`, `handleRefreshWithStream`

### 병합 후 리팩토링 (완료)

#### TypeScript 타입 안정성 향상
- ✅ `any` 타입 제거:
  - `optimizePrompt.ts`: `MoodStreamSegmentMood` 인터페이스 정의
  - `validateResponse.ts`: `RawLLMResponse` 인터페이스 정의, `unknown` 사용
  - `llmCache.ts`: `BackgroundParamsResponse` 타입 사용
  - `useMoodStreamManager.ts`: `Mood` 타입 사용
  - `moods/current/route.ts`: `updateData` 타입 명시
- ✅ Next.js 15 `params` Promise 타입 수정

#### 코드 품질 개선
- ✅ 사용되지 않는 변수 제거/주석 처리:
  - `fetchDailySignals.ts`: `userId` → `_userId`
  - `openai.ts`: `prompt`, `fewShotExamples` 주석 처리
  - `updatePreferences.ts`: `clamp`, `rgbDistanceScore` 제거
  - `preprocess.ts`: `calculateDailySleepScore` import 주석 처리
  - `calculateSleepScore.ts`: `best_mov` 주석 처리
  - `calculateStressIndex.ts`: `HR_min`, `best_mov` 주석 처리
  - `mapGrid.ts`: `RADDEG` 주석 처리

#### Prisma 통합
- ✅ Prisma Client 중복 생성 문제 수정
- ✅ `getPreferences.ts`, `updatePreferences.ts`에서 싱글톤 사용

---

## 2. 아키텍처 결정

### 2.1 무드스트림 구조

**핵심 원칙**: 하나의 무드스트림 내에서는 동일한 무드를 기반으로 함

```
[1분 단위 예측값] → [3분 단위 세그먼트] → [10개 세그먼트 = 30분]
```

- **1분 단위 예측**: 백엔드에서 시계열 + 마르코프 체인으로 생성
- **3분 단위 분절**: 프론트엔드에서 3분씩 묶어서 10개 세그먼트 생성
- **무드 결정**: 첫 번째 세그먼트의 무드를 전체 스트림의 대표 무드로 사용
- **세그먼트별 변동**: 무드는 동일하지만 음악 장르와 향 타입은 세그먼트별로 다를 수 있음

### 2.2 LLM 통합 전략

**목적**: 백엔드 예측값을 기반으로 UI 표현 파라미터 생성

**입력**:
- 전처리된 데이터 (스트레스, 수면, 날씨, 감정 이벤트)
- 무드스트림 세그먼트 정보
- 사용자 선호도

**출력**:
- `moodAlias`: 무드 별명 (예: "겨울비의 평온")
- `moodColor`: 무드 색상 (HEX)
- `musicSelection`: 음악 제목/스타일
- `lighting`: 밝기, 색온도
- `backgroundIcon`: 배경 아이콘 카테고리
- `backgroundWind`: 풍향, 풍속
- `animationSpeed`, `iconOpacity`: 애니메이션 파라미터

**호출 시점**:
- `stream` 모드: 무드스트림 재생성 시 (10개 세그먼트 전체)
- `scent` 모드: 향 버튼 클릭 시 (현재 세그먼트만)
- `music` 모드: 앨범 버튼 클릭 시 (현재 세그먼트만)

### 2.3 타입 시스템

**타입 안정성 원칙**:
- `any` 타입 사용 금지
- 타입 변환은 명시적 인터페이스 사용
- `unknown`을 통한 안전한 타입 체크

**주요 타입**:
- `Mood`: 무드 기본 정보
- `MoodStreamSegment`: 무드스트림 세그먼트
- `BackgroundParams`: LLM 출력 파라미터
- `Device`: 디바이스 정보

---

## 3. API 설계

### 3.1 무드스트림 API

**GET /api/moods/current**
- 현재 무드스트림 조회
- 응답: `currentMood`, `moodStream` (10개 세그먼트)

**PUT /api/moods/current/refresh**
- 무드스트림 재생성
- 시계열 + 마르코프 체인으로 새로운 스트림 생성

### 3.2 LLM API

**POST /api/ai/background-params**
- LLM으로 배경 파라미터 생성
- 모드: `stream` (전체), `scent` (향), `music` (음악)
- 캐싱: 같은 조건에서 1시간 동안 캐시 사용

### 3.3 전처리 API

**GET /api/preprocessing**
- 오늘 날짜의 전처리된 데이터 조회
- 스트레스, 수면, 날씨, 감정 이벤트
- 204 응답 시 기본값 사용

### 3.4 무드 저장 API

**POST /api/moods/saved**
- 무드 저장

**GET /api/moods/saved**
- 저장된 무드 목록 조회

**DELETE /api/moods/saved/{savedMoodId}**
- 저장된 무드 삭제

**POST /api/moods/saved/{savedMoodId}/apply**
- 저장된 무드를 현재 무드로 적용

---

## 4. 이슈 및 해결

### 4.1 병합 이슈

**문제**: HJ 브랜치와 feature/hyeokjin 브랜치 병합 시 충돌

**해결**:
- Prisma 위치 통일 (최상위 `prisma/schema.prisma` 사용)
- 리팩토링 구조 유지하면서 HJ의 API 연동 통합
- `home/page.tsx`: 리팩토링 구조 + 로딩 상태 추가
- `device.ts`: `temperature` + `scentInterval` 모두 유지

### 4.2 빌드 에러

**문제**: TypeScript `any` 타입 사용으로 인한 빌드 실패

**해결**:
- 모든 `any` 타입을 구체적인 타입으로 변경
- 인터페이스 정의 추가
- `unknown`을 통한 안전한 타입 체크

### 4.3 코드 품질

**문제**: 사용되지 않는 변수로 인한 린터 경고

**해결**:
- 사용되지 않는 변수 제거 또는 주석 처리
- 향후 사용 예정인 변수는 `_` prefix 추가

### 4.4 Prisma Client 중복 생성

**문제**: 여러 파일에서 각각 `new PrismaClient()` 생성

**해결**:
- `@/lib/prisma`의 싱글톤 인스턴스 사용
- HMR 환경에서도 안정적으로 동작

---

## 5. 향후 계획

### 5.1 LLM 다양성 개선

**목표**: 같은 무드 이름이라도 날씨/감정/시간대에 따라 다양한 색상/아이콘 생성

**작업**:
1. 캐시 키 세분화 (날씨, 감정 이벤트 추가)
2. 프롬프트에 다양성 지시 추가
3. Temperature 조정 (0.7 → 0.8)

### 5.2 Device 컴포넌트 리팩토링

**목표**: Props drilling 감소, 타입 안정성 향상

**작업**:
1. Device Context 생성 (선택적)
2. 디바이스 핸들러 통합
3. 타입 안정성 개선

### 5.3 에러 처리 및 로딩 상태

**목표**: 일관된 에러 처리 및 로딩 상태

**작업**:
1. ErrorBoundary 추가
2. 로딩 상태 통합
3. 재시도 로직

---

## 6. 기술 스택 및 의존성

### 프론트엔드
- Next.js 15.5.6
- React 19.1.0
- TypeScript 5.9.3
- Tailwind CSS 4

### 백엔드
- Prisma 6.19.0
- NextAuth 4.24.13
- Firebase Admin 13.6.0

### AI/ML
- OpenAI API (gpt-4o-mini)
- Few-shot Learning

### 데이터베이스
- MySQL (Prisma ORM)
- Firestore (실시간 데이터)

---

## 7. 참고 문서

### 팀 문서
- `README.md`: 프로젝트 개요
- `SETUP_GUIDE.md`: 설치 및 실행 가이드
- `API_SPECIFICATION.md`: API 명세
- `PROJECT_STRUCTURE.md`: 프로젝트 구조

### 통합된 내용 (이 문서에 포함)
- 리팩토링 계획 및 완료 사항
- LLM 입력/출력 파라미터
- 무드스트림 아키텍처
- OpenAI 통합 가이드
- 비용 최적화 전략
- 병합 전략 및 이슈 해결
- 현재 진행 상황

---

## 8. 주요 결정사항

### 8.1 무드 결정 방식
- 시계열 + 마르코프 체인으로 30분 무드스트림 예측
- 첫 번째 세그먼트의 무드를 전체 스트림의 대표 무드로 사용
- 세그먼트별로 음악 장르와 향 타입은 다를 수 있음

### 8.2 LLM 활용 범위
- 백엔드 예측값을 기반으로 UI 표현 파라미터 생성
- 실시간 추론이 아닌 예측 기반 (30분 스트림)
- Few-shot Learning으로 일관된 응답 보장

### 8.3 타입 안정성
- `any` 타입 사용 금지
- 명시적 인터페이스 정의
- 타입 변환은 안전한 방식으로

### 8.4 코드 구조
- 단일 책임 원칙 적용
- 커스텀 훅으로 로직 분리
- Props 그룹화로 가독성 향상

---

## 9. 변경 이력

### 2024-11-27
- Home 컴포넌트 리팩토링 완료 (1-8)
- HJ 브랜치 병합 및 충돌 해결
- TypeScript `any` 타입 제거
- 사용되지 않는 변수 제거
- Prisma Client 중복 생성 문제 수정
- 문서 정리 및 통합

