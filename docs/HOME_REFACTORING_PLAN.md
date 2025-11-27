# Home 컴포넌트 리팩토링 계획

## 1. 현재 문제점 분석

### 1.1 중복 코드
- ✅ `hexToRgba`: `MoodDashboard.tsx`에 로컬 정의되어 있지만 `@/lib/utils`에도 존재
- ✅ 디바이스 업데이트 로직: `HomeContent.tsx`에 하드코딩되어 있음

### 1.2 Props Drilling
- `HomeContent`가 너무 많은 props를 받고 전달
- `MoodDashboard` → 여러 하위 컴포넌트로 props 전달
- `DeviceGrid` → `DeviceCardSmall/Expanded`로 props 전달

### 1.3 타입 안정성
- `handleSegmentSelect`에서 복잡한 타입 캐스팅 (`as unknown as`)
- `MoodStreamSegment`와 `Mood` 타입 불일치

### 1.4 상태 관리 분산
- `HomeContent`: `shouldFetchLLM`, 디바이스 업데이트 로직
- `MoodDashboard`: 하트 애니메이션, 더블클릭 상태
- `useMoodDashboard`: 무드 관련 상태들

### 1.5 컴포넌트 책임 과다
- `HomeContent`: 무드스트림 관리, LLM 호출, 디바이스 업데이트, 배경 렌더링
- `MoodDashboard`: 무드스트림 관리, 하트 애니메이션, 세그먼트 선택, 색상 계산

### 1.6 불필요한 리렌더링
- `useEffect` 의존성 배열 최적화 필요
- `setDevices` 함수가 매번 새로 생성될 수 있음

---

## 2. 리팩토링 목표

1. **코드 중복 제거**: 유틸리티 함수 통합, 공통 로직 추출
2. **Props Drilling 감소**: Context API 또는 커스텀 훅으로 상태 공유
3. **타입 안정성 향상**: 타입 캐스팅 최소화, 인터페이스 명확화
4. **컴포넌트 책임 분리**: 단일 책임 원칙 적용
5. **성능 최적화**: 불필요한 리렌더링 방지
6. **가독성 향상**: 명확한 네이밍, 주석 정리

---

## 3. 리팩토링 단계

### Phase 1: 유틸리티 및 타입 정리
- [ ] `hexToRgba` 중복 제거 (MoodDashboard에서 제거)
- [ ] 디바이스 업데이트 로직을 커스텀 훅으로 추출
- [ ] `MoodStreamSegment`와 `Mood` 타입 일치시키기

### Phase 2: 상태 관리 개선
- [ ] `HomeContent`의 디바이스 업데이트 로직을 `useDeviceSync` 훅으로 분리
- [ ] LLM 호출 로직을 `useLLMBackground` 훅으로 분리
- [ ] 무드스트림 관련 상태를 Context로 관리 (선택적)

### Phase 3: 컴포넌트 분리
- [ ] `MoodDashboard`의 색상 계산 로직을 `useMoodColors` 훅으로 분리
- [ ] 하트 애니메이션 로직을 `useHeartAnimation` 훅으로 분리
- [ ] 세그먼트 선택 로직을 `useSegmentSelector` 훅으로 분리

### Phase 4: Props 최적화
- [ ] `HomeContent` props를 객체로 그룹화
- [ ] `MoodDashboard` props 최적화
- [ ] 불필요한 props 전달 제거

### Phase 5: 성능 최적화
- [ ] `useMemo`, `useCallback` 적용
- [ ] `useEffect` 의존성 배열 최적화
- [ ] 컴포넌트 메모이제이션 (`React.memo`)

---

## 4. 구체적 변경 사항

### 4.1 유틸리티 함수 통합

**Before**:
```typescript
// MoodDashboard.tsx
function hexToRgba(hex: string, alpha: number): string {
  // ...
}
```

**After**:
```typescript
// MoodDashboard.tsx
import { hexToRgba } from "@/lib/utils";
```

---

### 4.2 디바이스 업데이트 로직 추출

**Before**:
```typescript
// HomeContent.tsx
useEffect(() => {
  setDevices((prev) => prev.map((d) => {
    // 복잡한 로직...
  }));
}, [backgroundParams, currentMood, setDevices]);
```

**After**:
```typescript
// hooks/useDeviceSync.ts
export function useDeviceSync(
  devices: Device[],
  backgroundParams: BackgroundParams | null,
  currentMood: Mood
) {
  // 디바이스 업데이트 로직
}

// HomeContent.tsx
const syncedDevices = useDeviceSync(devices, backgroundParams, currentMood);
```

---

### 4.3 색상 계산 로직 분리

**Before**:
```typescript
// MoodDashboard.tsx
const baseColor = backgroundParams?.moodColor || mood.color;
const accentColor = blendWithWhite(baseColor, 0.9);
```

**After**:
```typescript
// hooks/useMoodColors.ts
export function useMoodColors(
  mood: Mood,
  backgroundParams?: BackgroundParams | null
) {
  return useMemo(() => ({
    baseColor: backgroundParams?.moodColor || mood.color,
    accentColor: blendWithWhite(backgroundParams?.moodColor || mood.color, 0.9),
    displayAlias: backgroundParams?.moodAlias || mood.name,
  }), [mood, backgroundParams]);
}

// MoodDashboard.tsx
const { baseColor, accentColor, displayAlias } = useMoodColors(mood, backgroundParams);
```

---

### 4.4 타입 안정성 개선

**Before**:
```typescript
const t = target.mood as unknown as {
  id?: string;
  name?: string;
  // ...
};
```

**After**:
```typescript
// types/moodStream.ts
export interface MoodStreamSegmentMood {
  id: string;
  name: string;
  color: string;
  song: Mood["song"];
  scent: Mood["scent"];
}

// MoodDashboard.tsx
if (target?.mood) {
  const segmentMood = target.mood as MoodStreamSegmentMood;
  // 타입 안전하게 사용
}
```

---

### 4.5 Props 그룹화

**Before**:
```typescript
<HomeContent
  currentMood={currentMood}
  devices={devices}
  expandedId={expandedId}
  setExpandedId={setExpandedId}
  setDevices={setDevices}
  onOpenAddModal={() => setShowAddModal(true)}
  onMoodChange={setCurrentMood}
  onScentChange={handleScentChange}
  onSongChange={handleSongChange}
  onBackgroundParamsChange={setBackgroundParams}
/>
```

**After**:
```typescript
<HomeContent
  moodState={{
    current: currentMood,
    onChange: setCurrentMood,
    onScentChange: handleScentChange,
    onSongChange: handleSongChange,
  }}
  deviceState={{
    devices,
    setDevices,
    expandedId,
    setExpandedId,
    onOpenAddModal: () => setShowAddModal(true),
  }}
  backgroundState={{
    params: backgroundParams,
    onChange: setBackgroundParams,
  }}
/>
```

---

## 5. 우선순위

### 높음 (즉시)
1. ✅ `hexToRgba` 중복 제거
2. ✅ 디바이스 업데이트 로직 훅으로 추출
3. ✅ 색상 계산 로직 훅으로 분리

### 중간 (다음 단계)
4. 타입 안정성 개선
5. Props 그룹화
6. 하트 애니메이션 로직 분리

### 낮음 (선택적)
7. Context API 도입
8. 컴포넌트 메모이제이션
9. 성능 최적화

---

## 6. 예상 효과

1. **코드 가독성**: 중복 제거, 명확한 책임 분리
2. **유지보수성**: 로직 분리로 수정 용이
3. **타입 안정성**: 타입 캐스팅 최소화
4. **성능**: 불필요한 리렌더링 감소
5. **테스트 용이성**: 작은 단위로 분리된 로직

