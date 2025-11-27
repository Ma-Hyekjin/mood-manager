# LLM 출력 파라미터 사용 현황 및 문제점

## 1. 전체 필드 사용 현황

### ✅ 완전히 반영되는 필드

| 필드 | 사용 위치 | 반영 방식 |
|------|----------|----------|
| `moodAlias` | `MoodDashboard.tsx`, `MoodHeader.tsx` | 무드 이름 대신 표시 |
| `moodColor` | `MoodDashboard`, `ScentControl`, `DeviceGrid`, `Device`, `BottomNav`, `MoodDuration` | 카드 배경/테두리, 버튼, 디바이스 색상 |
| `lighting.brightness` | `HomeContent.tsx` (Device 업데이트) | Manager/Light 디바이스 밝기 |
| `backgroundIcon` | `ScentBackground.tsx` | 배경 파티클 아이콘 타입 |
| `backgroundWind` | `ScentBackground.tsx` | 파티클 이동 방향/속도 |
| `animationSpeed` | `ScentBackground.tsx` | 파티클 떨어지는 속도 |
| `iconOpacity` | `ScentBackground.tsx` | 파티클 투명도 |
| `source` | `MoodHeader.tsx` | "LLM: openai" 표시 |

---

### ⚠️ 부분적으로만 반영되는 필드

| 필드 | 현재 상태 | 문제점 |
|------|----------|--------|
| `musicSelection` | `useMoodDashboard.ts`의 `handleAlbumClick`에서만 사용 | **대시보드 새로고침 시 반영 안 됨** |
| | `AlbumSection.tsx`는 `mood.song.title` 직접 사용 | LLM이 생성한 `musicSelection`을 무시 |

**상세**:
- ✅ 앨범 버튼 클릭 시: `handleAlbumClick` → LLM `mode: "music"` 호출 → `data.musicSelection` 사용
- ❌ 대시보드 새로고침 시: `backgroundParams.musicSelection`이 생성되지만 `AlbumSection`에서 사용하지 않음

---

### ❌ 검증만 되고 실제로 사용되지 않는 필드

| 필드 | 검증 위치 | 실제 사용 위치 | 상태 |
|------|----------|---------------|------|
| `lighting.rgb` | `validateResponse.ts` (140-146줄) | 없음 | **미사용** |
| `lighting.temperature` | `validateResponse.ts` (156-158줄) | 없음 | **미사용** |
| `iconCount` | `validateResponse.ts` (192-194줄) | 없음 | **미사용** |
| `iconSize` | `validateResponse.ts` (196-198줄) | 없음 | **미사용** |
| `particleEffect` | `validateResponse.ts` (200줄) | 없음 | **미사용** |
| `gradientColors` | `validateResponse.ts` (203-210줄) | 없음 | **미사용** |
| `transitionDuration` | `validateResponse.ts` (212-214줄) | 없음 | **미사용** |

---

## 2. 문제점 및 개선 필요 사항

### 🔴 심각한 문제 (즉시 수정 필요)

#### 1. `musicSelection`이 대시보드 새로고침 시 반영 안 됨

**현재 동작**:
```typescript
// AlbumSection.tsx (27줄)
<p>{mood.song.title}</p>  // ← LLM의 musicSelection을 무시하고 기존 mood.song.title 사용
```

**문제**:
- LLM이 `musicSelection: "Focused Autumn Vibes - Piano"`를 생성해도
- UI에는 여전히 `mood.song.title` (예: "Autumn Leaves")가 표시됨

**해결 방법**:
```typescript
// AlbumSection.tsx 수정 필요
interface AlbumSectionProps {
  mood: Mood;
  onAlbumClick: () => void;
  musicSelection?: string;  // ← backgroundParams.musicSelection 전달
}

export default function AlbumSection({ mood, onAlbumClick, musicSelection }: AlbumSectionProps) {
  return (
    <p className="text-center text-xs font-medium mb-1.5 text-gray-800">
      {musicSelection || mood.song.title}  // ← LLM 출력 우선 사용
    </p>
  );
}
```

---

### 🟡 중간 우선순위 (선택적 개선)

#### 2. `lighting.rgb`와 `lighting.temperature` 미사용

**현재 상태**:
- LLM이 `lighting.rgb: [212, 165, 116]`, `lighting.temperature: 3500`를 생성
- 검증은 되지만 실제 디바이스 제어에 사용되지 않음

**의도 확인 필요**:
- `lighting.rgb`는 `moodColor`와 중복일 수 있음 (이미 HEX로 제공)
- `lighting.temperature`는 실제 조명 디바이스의 색온도 제어에 사용할 계획인지 확인 필요

**권장 사항**:
- 실제 조명 디바이스 API 연동 시 사용 예정이면 유지
- 사용 계획이 없으면 LLM 프롬프트에서 제거하여 토큰 절감

---

#### 3. 선택적 필드들 (`iconCount`, `iconSize`, `particleEffect`, `gradientColors`, `transitionDuration`) 미사용

**현재 상태**:
- LLM이 생성하고 검증은 되지만 실제 UI에 반영되지 않음

**의도 확인 필요**:
- 향후 기능 확장을 위한 예비 필드인지
- 아니면 불필요한 필드인지

**권장 사항**:
- **사용 계획이 있으면**: `ScentBackground.tsx`에 반영 로직 추가
- **사용 계획이 없으면**: LLM 프롬프트에서 제거하여 토큰 절감 및 응답 단순화

---

## 3. 흐름 일치성 확인

### ✅ 의도와 일치하는 부분

1. **대시보드 새로고침**:
   - ✅ 무드스트림 재생성 → LLM `mode: "stream"` 호출 → 전체 배경 파라미터 생성
   - ✅ `forceFresh: true`로 캐시 우회 → 항상 새로운 OpenAI 응답

2. **앨범 버튼 클릭**:
   - ✅ 현재 세그먼트 기반 → LLM `mode: "music"` 호출 → 음악/풍향만 재생성
   - ✅ `musicSelection` 사용하여 `mood.song.title` 업데이트

3. **스프레이 버튼 클릭**:
   - ✅ 다음 세그먼트 향 가져오기 또는 LLM `mode: "scent"` 호출
   - ✅ 향/아이콘만 재생성

4. **색상 반영**:
   - ✅ `moodColor` → 대시보드, 디바이스, 네비게이션에 일관되게 반영
   - ✅ Raw/Pastel 분리 → 적절한 위치에 적절한 톤 사용

5. **배경 파티클**:
   - ✅ `backgroundIcon`, `backgroundWind`, `animationSpeed`, `iconOpacity` 모두 반영

---

### ⚠️ 의도와 불일치하는 부분

1. **`musicSelection` 미반영**:
   - 의도: LLM이 생성한 음악 제목을 대시보드에 표시
   - 현실: 대시보드 새로고침 시 기존 `mood.song.title` 사용

2. **선택적 필드 미사용**:
   - 의도: LLM이 생성한 `iconCount`, `iconSize`, `gradientColors` 등을 활용
   - 현실: 검증만 되고 실제 UI에 반영 안 됨

---

## 4. 수정 권장 사항

### 즉시 수정 (필수)

1. **`AlbumSection`에 `musicSelection` 반영**:
   ```typescript
   // MoodDashboard.tsx에서 backgroundParams.musicSelection 전달
   <AlbumSection 
     mood={mood} 
     onAlbumClick={handleAlbumClick}
     musicSelection={backgroundParams?.musicSelection}  // ← 추가
   />
   ```

### 선택적 수정 (우선순위 낮음)

2. **선택적 필드 사용 여부 결정**:
   - 사용 계획이 있으면: `ScentBackground.tsx`에 반영 로직 추가
   - 사용 계획이 없으면: LLM 프롬프트에서 제거

3. **`lighting.rgb`와 `lighting.temperature` 사용 여부 결정**:
   - 실제 조명 디바이스 API 연동 시 사용 예정이면 유지
   - 아니면 프롬프트에서 제거

---

## 5. 요약

### 완전히 반영되는 필드: 8개
- `moodAlias`, `moodColor`, `lighting.brightness`, `backgroundIcon`, `backgroundWind`, `animationSpeed`, `iconOpacity`, `source`

### 부분적으로만 반영되는 필드: 1개
- `musicSelection` (앨범 버튼 클릭 시만 사용, 대시보드 새로고침 시 미사용)

### 검증만 되고 미사용 필드: 7개
- `lighting.rgb`, `lighting.temperature`, `iconCount`, `iconSize`, `particleEffect`, `gradientColors`, `transitionDuration`

### 즉시 수정 필요: 1개
- `musicSelection`을 `AlbumSection`에 반영

### 선택적 개선: 7개
- 선택적 필드들의 사용 여부 결정 및 반영 또는 제거

