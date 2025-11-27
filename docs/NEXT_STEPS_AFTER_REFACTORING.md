# 리팩토링 완료 후 다음 단계 제안

## 완료된 리팩토링 (1~8)

✅ **1. hexToRgba 중복 제거**
- `MoodDashboard.tsx`에서 로컬 함수 제거, `@/lib/utils` 사용

✅ **2. 디바이스 업데이트 로직 추출**
- `useDeviceSync` 훅 생성 (`src/hooks/useDeviceSync.ts`)

✅ **3. 색상 계산 로직 분리**
- `useMoodColors` 훅 생성 (`src/app/(main)/home/components/MoodDashboard/hooks/useMoodColors.ts`)

✅ **4. 하트 애니메이션 로직 분리**
- `useHeartAnimation` 훅 생성 (`src/app/(main)/home/components/MoodDashboard/hooks/useHeartAnimation.ts`)

✅ **5. 세그먼트 선택 로직 분리**
- `useSegmentSelector` 훅 생성 (`src/app/(main)/home/components/MoodDashboard/hooks/useSegmentSelector.ts`)

✅ **6. MoodStreamSegment와 Mood 타입 일치**
- `moodStreamConverter.ts` 유틸리티 생성
- 타입 안전한 변환 함수로 복잡한 타입 캐스팅 제거

✅ **7. HomeContent props 그룹화**
- `moodState`, `deviceState`, `backgroundState`로 그룹화
- Props 개수: 9개 → 3개 객체로 감소

✅ **8. 성능 최적화**
- `useMemo`: `currentScentLevel`, `rawMoodColor`, `pastelMoodColor`, `deviceGridMood`
- `useCallback`: `handleRefreshRequest`, `handleRefreshWithStream`

---

## 다음 단계 제안

### 우선순위 1: LLM 다양성 개선 (이미 논의됨)

**목표**: 같은 무드 이름이라도 날씨/감정/시간대에 따라 다양한 색상/아이콘 생성

**작업 내용**:
1. **캐시 키 세분화**
   - 날씨 정보 (`temperature`, `sky`) 추가
   - 감정 이벤트 요약 추가
   - `src/lib/cache/llmCache.ts` 수정

2. **프롬프트 다양성 지시 추가**
   - "같은 무드 이름이라도 날씨/감정/시간대에 따라 고유한 표현 생성" 지시 추가
   - `src/lib/llm/optimizePrompt.ts` 수정

3. **Temperature 조정**
   - `0.7` → `0.8` 또는 `0.85`로 상향
   - `src/app/api/ai/background-params/route.ts` 수정

**예상 효과**:
- "bright morning bliss" 같은 무드도 맑은 날/비 오는 날에 따라 다른 색상/아이콘 생성
- 더 창의적이고 다양한 UI 표현

---

### 우선순위 2: Device 컴포넌트 리팩토링

**현재 문제점**:
- `DeviceGrid`, `DeviceCardSmall`, `DeviceCardExpanded`에 props drilling
- 디바이스 핸들러 로직이 여러 곳에 분산
- 타입 안정성 개선 여지

**제안 작업**:
1. **Device Context 생성** (선택적)
   - `DeviceContext`로 디바이스 상태 공유
   - Props drilling 감소

2. **디바이스 핸들러 통합**
   - `useDeviceHandlers` 개선
   - 모든 디바이스 액션을 한 곳에서 관리

3. **디바이스 타입 안정성 개선**
   - `Device` 타입 확장
   - 각 디바이스 타입별 전용 인터페이스

---

### 우선순위 3: 에러 처리 및 로딩 상태 개선

**현재 상태**:
- 일부 API 호출에 에러 처리 부족
- 로딩 상태가 일관되지 않음

**제안 작업**:
1. **에러 바운더리 추가**
   - `ErrorBoundary` 컴포넌트 생성
   - LLM 호출 실패 시 사용자 친화적 메시지

2. **로딩 상태 통합**
   - 로딩 상태를 Context로 관리
   - 일관된 스켈레톤 UI

3. **재시도 로직**
   - API 호출 실패 시 자동 재시도
   - 사용자에게 재시도 옵션 제공

---

### 우선순위 4: 테스트 작성

**제안 작업**:
1. **단위 테스트**
   - 새로 만든 훅들 (`useMoodColors`, `useHeartAnimation`, `useSegmentSelector`, `useDeviceSync`)
   - 유틸리티 함수 (`moodStreamConverter`)

2. **통합 테스트**
   - `MoodDashboard` 컴포넌트
   - `HomeContent` 컴포넌트

3. **E2E 테스트** (선택적)
   - 무드 새로고침 플로우
   - 세그먼트 선택 플로우

---

### 우선순위 5: 문서화 개선

**제안 작업**:
1. **컴포넌트 문서화**
   - 각 컴포넌트의 역할과 props 설명
   - 사용 예시 추가

2. **아키텍처 다이어그램**
   - 컴포넌트 계층 구조
   - 데이터 흐름도

3. **API 문서화**
   - LLM API 입력/출력 명세
   - 디바이스 API 명세

---

### 우선순위 6: 추가 성능 최적화

**제안 작업**:
1. **React.memo 적용**
   - `MoodHeader`, `ScentControl`, `AlbumSection` 등 작은 컴포넌트
   - 불필요한 리렌더링 방지

2. **가상화 (Virtualization)**
   - 디바이스 그리드가 많아질 경우를 대비
   - `react-window` 또는 `react-virtual` 사용

3. **이미지 최적화**
   - 앨범 아트 이미지 lazy loading
   - WebP 포맷 사용

---

## 권장 진행 순서

1. **즉시**: LLM 다양성 개선 (우선순위 1)
   - 사용자가 이미 요청한 작업
   - 사용자 경험에 직접적인 영향

2. **단기**: Device 컴포넌트 리팩토링 (우선순위 2)
   - 코드 일관성 향상
   - 유지보수성 개선

3. **중기**: 에러 처리 및 로딩 상태 개선 (우선순위 3)
   - 안정성 향상
   - 사용자 경험 개선

4. **장기**: 테스트 작성 및 문서화 (우선순위 4, 5)
   - 코드 품질 보장
   - 팀 협업 효율성 향상

---

## 참고사항

- 모든 리팩토링은 **기능 변경 없이** 구조만 개선
- 기존 동작은 모두 유지됨
- 린터 에러 없음 확인 완료

