# 리팩토링 제안서

## 1. 현재 상태 분석

### 1.1 완료된 리팩토링 (이전 작업)
- ✅ `hexToRgba` 중복 제거
- ✅ 디바이스 업데이트 로직을 `useDeviceSync` 훅으로 추출
- ✅ 색상 계산 로직을 `useMoodColors` 훅으로 분리
- ✅ 하트 애니메이션 로직을 `useHeartAnimation` 훅으로 분리
- ✅ 세그먼트 선택 로직을 `useSegmentSelector` 훅으로 분리
- ✅ `MoodStreamSegment`와 `Mood` 타입 일치 (변환 함수 생성)
- ✅ `HomeContent` props 그룹화
- ✅ `useMemo`, `useCallback`으로 성능 최적화

### 1.2 병합 후 발견된 문제

#### 🔴 빌드 에러 (즉시 수정 필요)
1. **TypeScript `any` 타입 사용**
   - 위치: `src/lib/preprocessing/prepareOpenAIInput.ts:112, 123`
   - 영향: 빌드 실패
   - 원인: HJ 코드에서 타입 명시 누락

#### ⚠️ 코드 품질 문제 (수정 권장)
2. **사용되지 않는 변수들**
   - `src/lib/moodSignals/fetchDailySignals.ts`: `userId`
   - `src/lib/openai.ts`: `prompt`, `moodAttributes`, `fewShotExamples`
   - `src/lib/preferences/updatePreferences.ts`: `clamp`, `rgbDistanceScore`, `_reward`
   - `src/lib/preprocessing/preprocess.ts`: `calculateDailySleepScore`
   - `src/lib/sleep/calculateSleepScore.ts`: `best_mov`
   - `src/lib/stress/calculateStressIndex.ts`: `HR_min`, `best_mov`
   - `src/lib/weather/mapGrid.ts`: `RADDEG`

3. **Prisma Client 중복 생성 (이미 수정됨)**
   - ✅ `getPreferences.ts`, `updatePreferences.ts`에서 싱글톤 사용으로 변경

#### 📝 문서 정리 필요
4. **문서 과다 및 중복**
   - 현재 24개 문서 파일
   - 설명용 문서와 팀 문서 혼재
   - 중복 내용 다수

---

## 2. 리팩토링 계획

### Phase 1: 빌드 에러 수정 (최우선)

#### 1.1 TypeScript `any` 타입 제거
**목표**: 빌드 통과
**작업**:
- `src/lib/cache/llmCache.ts:212` - `any` 타입 구체화
- `src/lib/llm/validateResponse.ts:17,18,19,20` - `any` 타입 구체화
- `src/lib/llm/optimizePrompt.ts:9,45,67` - `any` 타입 구체화
- 타입 정의 추가 또는 인터페이스 확장

**예상 시간**: 1시간

---

### Phase 2: 코드 품질 개선

#### 2.1 사용되지 않는 변수 제거
**목표**: 린터 경고 제거, 코드 정리
**작업**:
- 사용되지 않는 변수 제거 또는 `_` prefix 추가
- 실제로 사용되어야 하는 변수는 로직 수정

**예상 시간**: 1시간

#### 2.2 타입 안정성 추가 개선
**목표**: 타입 안정성 향상
**작업**:
- HJ 코드의 타입 정의 보완
- 인터페이스 명확화

**예상 시간**: 1시간

---

### Phase 3: 문서 정리 및 통합

#### 3.1 문서 분류
**팀 문서 (유지)**:
- `README.md` - 프로젝트 개요
- `SETUP_GUIDE.md` - 설정 가이드
- `API_SPECIFICATION.md` - API 명세
- `PROJECT_STRUCTURE.md` - 프로젝트 구조

**설명용 문서 (통합/삭제)**:
- `HOME_REFACTORING_PLAN.md` → 통합 문서로 이동
- `NEXT_STEPS_AFTER_REFACTORING.md` → 통합 문서로 이동
- `GIT_MERGE_STRATEGY.md` → 통합 문서로 이동
- `MERGE_ISSUES_FOUND.md` → 통합 문서로 이동
- `LLM_INPUT_OUTPUT_FLOW.md` → 통합 문서로 이동
- `LLM_INPUT_PARAMETERS.md` → 통합 문서로 이동
- `LLM_OUTPUT_USAGE_AUDIT.md` → 통합 문서로 이동
- `LLM_VARIETY_ISSUE.md` → 통합 문서로 이동
- `MOOD_STREAM_ARCHITECTURE.md` → 통합 문서로 이동
- `MOOD_STREAM_IMPLEMENTATION.md` → 통합 문서로 이동
- `MOOD_SET_PAGE_SPECIFICATION.md` → 통합 문서로 이동
- `OPENAI_INTEGRATION.md` → 통합 문서로 이동
- `COST_OPTIMIZATION.md` → 통합 문서로 이동
- `PC_DESKTOP_BACKGROUND_ARCHITECTURE.md` → 통합 문서로 이동
- `FINAL_MOOD_INFERENCE_ARCHITECTURE.md` → 통합 문서로 이동
- `MOOD_INFERENCE_COMPARISON.md` → 통합 문서로 이동
- `UNUSED_FIELDS_REASON.md` → 통합 문서로 이동
- `API_RESPONSE_MAPPING.md` → 통합 문서로 이동
- `CURRENT_STATUS.md` → 통합 문서로 이동
- `RESPONSIVE_DESIGN.md` → 통합 문서로 이동

**통합 문서 생성**:
- `DEVELOPMENT_NOTES.md` - 모든 개발 과정 및 결정사항 통합

#### 3.2 통합 문서 구조
```markdown
# Development Notes

## 1. 리팩토링 이력
- Home 컴포넌트 리팩토링
- 병합 후 수정사항

## 2. 아키텍처 결정
- LLM 통합
- 무드 스트림 구조
- 타입 시스템

## 3. API 설계
- LLM 입력/출력
- 무드 스트림 API
- 디바이스 API

## 4. 이슈 및 해결
- 병합 이슈
- 빌드 에러
- 성능 최적화

## 5. 향후 계획
- 다음 단계
- 개선 사항
```

**예상 시간**: 2시간

---

## 3. 실행 계획

### Step 1: 빌드 에러 수정
1. `prepareOpenAIInput.ts`의 `any` 타입 수정
2. 빌드 테스트
3. 커밋: `fix: TypeScript any 타입 제거`

### Step 2: 코드 품질 개선
1. 사용되지 않는 변수 제거
2. 타입 안정성 개선
3. 빌드 테스트
4. 커밋: `refactor: 코드 품질 개선 및 타입 안정성 향상`

### Step 3: 문서 정리
1. 통합 문서 생성
2. 기존 문서 내용 통합
3. 불필요한 문서 삭제
4. 커밋: `docs: 문서 정리 및 통합`

### Step 4: 최종 검증
1. 전체 빌드 테스트
2. 린터 검사
3. 최종 커밋 및 푸시

---

## 4. 예상 효과

### 코드 품질
- ✅ 빌드 에러 0개
- ✅ 린터 경고 최소화
- ✅ 타입 안정성 향상

### 문서 관리
- ✅ 문서 수: 24개 → 5개 (팀 문서) + 1개 (통합 문서)
- ✅ 중복 제거
- ✅ 유지보수 용이

### 개발 효율
- ✅ 명확한 문서 구조
- ✅ 빠른 정보 검색
- ✅ 팀 협업 효율 향상

---

## 5. 우선순위

### 🔴 즉시 (빌드 에러)
1. TypeScript `any` 타입 제거

### 🟡 높음 (코드 품질)
2. 사용되지 않는 변수 제거
3. 타입 안정성 개선

### 🟢 중간 (문서 정리)
4. 문서 통합 및 정리

---

## 6. 리스크 및 대응

### 리스크
- 문서 통합 과정에서 정보 손실 가능
- 타입 수정 시 런타임 에러 가능

### 대응
- 문서 통합 전 백업
- 타입 수정 후 충분한 테스트
- 단계별 커밋으로 롤백 가능

---

## 7. 예상 소요 시간

- Phase 1 (빌드 에러): 30분
- Phase 2 (코드 품질): 2시간
- Phase 3 (문서 정리): 2시간
- **총 예상 시간**: 4.5시간

