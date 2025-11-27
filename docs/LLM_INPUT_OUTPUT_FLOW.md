# LLM 입력/출력 파라미터 및 반영 위치

## 1. 전체 흐름

```
[목업 전처리] → [목업 마르코프 예측] → [LLM 입력] → [LLM 출력] → [UI 반영]
```

---

## 2. LLM 입력 구조 (목업 데이터)

### 2.1 전처리 데이터 (`/api/preprocessing`)

```typescript
{
  average_stress_index: 45,        // 그 날 평균 스트레스 (0~100)
  recent_stress_index: 39,          // 최근 스트레스 (0~100)
  latest_sleep_score: 79,           // 최근 수면 점수 (0~100)
  latest_sleep_duration: 600,        // 최근 수면 시간 (분)
  weather: {
    temperature: 9.6,               // 온도 (°C)
    humidity: 26,                   // 습도 (%)
    rainType: 0,                    // 0: 없음, 1: 비, 2: 비/눈, 3: 눈
    sky: 1,                         // 1: 맑음, 3: 구름 많음, 4: 흐림
  },
  emotionEvents: {
    laughter: [timestamp1, timestamp2],  // 웃음 이벤트 타임스탬프 배열
    sigh: [timestamp1],                 // 한숨 이벤트
    anger: [],                          // 분노 이벤트
    sadness: [],                        // 슬픔 이벤트
    neutral: [timestamp1],               // 중립 이벤트 (기본값)
  },
}
```

### 2.2 마르코프 예측 무드스트림 (`/api/moods/current`)

```typescript
{
  currentMood: {
    id: "mood-xxx",
    name: "Autumn Focus",           // 무드 이름
    cluster: "0",                    // 무드 클러스터
    music: {
      genre: "newage",              // 음악 장르
      title: "Autumn Leaves",       // 음악 제목 (임시)
    },
    scent: {
      type: "woody",                // 향 타입
      name: "Cedar Wood",           // 향 이름 (임시)
    },
    lighting: {
      color: "#E6F3FF",             // 조명 색상 (HEX, 임시)
      rgb: [230, 243, 255],          // RGB 배열
    },
  },
  moodStream: {
    segments: [
      {
        timestamp: 1234567890,
        duration: 180000,           // 3분 (밀리초)
        moodName: "Autumn Focus",
        musicGenre: "newage",
        scentType: "woody",
        mood: { ... },               // Mood 객체
        music: { genre: "...", title: "..." },
        scent: { type: "...", name: "..." },
        lighting: { color: "...", rgb: [...] },
      },
      // ... 총 10개 세그먼트 (30분)
    ],
  },
  userDataCount: 0,                  // 사용자 데이터 개수 (콜드스타트)
}
```

### 2.3 사용자 선호도 (콜드스타트 기본값)

```typescript
{
  music: {
    "classical": "+",
    "jazz": "+",
    "newage": "+",
    "folk": "+",
    "pop": "+",
    "reggae": "+",
    "hiphop_rap": "-",
    "rnb_soul": "-",
    "electronic_dance": "-",
    "rock": "-",
  },
  color: {
    "black": "-",
    "white": "+",
    "blue": "+",
    "yellow": "+",
    "purple": "+",
    "orange": "+",
    "red": "+",
    "green": "+",
  },
  scent: {
    "spicy": "-",
    "citrus": "+",
    "floral": "+",
    "woody": "+",
    "marine": "+",
    "musk": "+",
    "aromatic": "+",
    "honey": "+",
    "powdery": "+",
    "green": "+",
    "dry": "+",
    "leathery": "-",
  },
}
```

### 2.4 LLM에 전달되는 최종 입력 (`prepareLLMInput`)

```typescript
{
  moodName: "Autumn Focus",
  musicGenre: "newage",
  scentType: "woody",
  preprocessed: { ... },              // 위의 전처리 데이터
  userPreferences: { ... },           // 위의 선호도
  timeOfDay: 14,                      // 현재 시간 (0~23)
  currentCluster: "0",
  userDataCount: 0,
  season: "Autumn",                    // "Spring" | "Summer" | "Autumn" | "Winter"
}
```

---

## 3. LLM 출력 파라미터 (`BackgroundParams`)

```typescript
{
  // 무드 표현
  moodAlias: "Focused Autumn Vibes",  // 무드 별명 (2-4 단어 영어)
  musicSelection: "Autumn Leaves - Piano Version",  // 실제 음악 제목/스타일

  // 색상
  moodColor: "#D4A574",               // 무드 메인 색상 (HEX)

  // 조명
  lighting: {
    rgb: [212, 165, 116],             // RGB 배열 (0~255)
    brightness: 75,                    // 밝기 (0~100)
    temperature: 3500,                 // 색온도 (2000~6500K)
  },

  // 배경 아이콘
  backgroundIcon: {
    name: "FaBookOpen",               // React Icon 이름
    category: "object",                // "weather" | "nature" | "object" | "abstract"
  },

  // 바람 효과
  backgroundWind: {
    direction: 180,                    // 풍향 (0~360도, 180=아래로)
    speed: 3,                          // 풍속 (0~10)
  },

  // 애니메이션
  animationSpeed: 4,                   // 애니메이션 속도 (0~10)
  iconOpacity: 0.7,                    // 아이콘 투명도 (0~1)

  // 선택적 필드
  iconCount: 8,                        // 아이콘 개수 (5~10)
  iconSize: 50,                        // 아이콘 크기 (0~100)
  particleEffect: true,                // 파티클 효과 여부
  gradientColors: ["#D4A574", "#E8C99B"],  // 그라데이션 색상 배열
  transitionDuration: 1000,            // 전환 시간 (100~5000ms)

  // 소스 정보
  source: "openai",                   // "openai" | "cache" | "mock-no-key"
}
```

---

## 4. UI 반영 위치

### 4.1 `ScentBackground` (배경 파티클)

**위치**: `src/components/ui/ScentBackground.tsx`

**사용하는 파라미터**:
- `backgroundIcon` → 파티클 아이콘 타입 결정
- `backgroundWind` → 파티클 이동 방향/속도
- `animationSpeed` → 파티클 떨어지는 속도
- `iconOpacity` → 파티클 투명도
- `backgroundColor` (raw `moodColor`) → 파티클 색상

**코드 위치**:
```typescript
// HomeContent.tsx (116-127줄)
<ScentBackground
  scentType={currentMood.scent.type}
  scentColor={pastelMoodColor}              // blendWithWhite(moodColor, 0.9)
  intensity={currentScentLevel}
  backgroundIcon={backgroundParams?.backgroundIcon}      // ← LLM 출력
  backgroundWind={backgroundParams?.backgroundWind}        // ← LLM 출력
  animationSpeed={backgroundParams?.animationSpeed}        // ← LLM 출력
  iconOpacity={backgroundParams?.iconOpacity}              // ← LLM 출력
  backgroundColor={rawMoodColor}                            // ← LLM 출력 (moodColor)
/>
```

---

### 4.2 `MoodDashboard` (대시보드 카드)

**위치**: `src/app/(main)/home/components/MoodDashboard/MoodDashboard.tsx`

**사용하는 파라미터**:
- `moodAlias` → 무드 이름 대신 표시
- `moodColor` (raw) → 카드 배경색 (`hexToRgba(baseColor, 0.25)`)
- `moodColor` (pastel) → 카드 테두리색 (`blendWithWhite(baseColor, 0.9)`)
- `source` → "LLM: openai" 표시

**코드 위치**:
```typescript
// MoodDashboard.tsx (140-150줄)
const baseColor = backgroundParams?.moodColor || mood.color;
const accentColor = blendWithWhite(baseColor, 0.9);
const displayAlias = backgroundParams?.moodAlias || mood.name;
const llmSource = backgroundParams?.source;

// 카드 배경/테두리
style={{
  backgroundColor: hexToRgba(baseColor, 0.25),  // ← LLM 출력 (25% 투명)
  borderColor: accentColor,                      // ← LLM 출력 (파스텔)
}}
```

---

### 4.3 `MoodHeader` (무드 이름 + LLM 소스)

**위치**: `src/app/(main)/home/components/MoodDashboard/components/MoodHeader.tsx`

**사용하는 파라미터**:
- `moodAlias` → 무드 이름 표시
- `source` → "LLM: openai" / "LLM: cache" / "LLM: mock-no-key" 표시

**코드 위치**:
```typescript
// MoodHeader.tsx
<div>{mood.name}</div>  // ← backgroundParams.moodAlias
{llmSource && (
  <span>LLM: {llmSource}</span>  // ← backgroundParams.source
)}
```

---

### 4.4 `ScentControl` (스프레이 버튼)

**위치**: `src/app/(main)/home/components/MoodDashboard/components/ScentControl.tsx`

**사용하는 파라미터**:
- `moodColor` (raw) → 스프레이 버튼 배경색 (`hexToRgba(moodColor, 0.85)`)

**코드 위치**:
```typescript
// ScentControl.tsx
style={{ backgroundColor: hexToRgba(buttonColor, 0.85) }}  // ← LLM 출력
```

---

### 4.5 `DeviceGrid` (디바이스 카드들)

**위치**: `src/app/(main)/home/components/Device/DeviceGrid.tsx`

**사용하는 파라미터**:
- `moodColor` → 디바이스 카드 배경색 (`blendWithWhite(moodColor, 0.9)`)

**코드 위치**:
```typescript
// HomeContent.tsx (150-153줄)
<DeviceGrid
  currentMood={{
    ...currentMood,
    color: backgroundParams?.moodColor || currentMood.color,  // ← LLM 출력
  }}
/>
```

---

### 4.6 `Device` (Manager / Light 디바이스)

**위치**: `src/app/(main)/home/components/HomeContent.tsx`

**사용하는 파라미터**:
- `moodColor` → Manager 디바이스 색상
- `lighting.brightness` → Manager / Light 디바이스 밝기

**코드 위치**:
```typescript
// HomeContent.tsx (69-104줄)
useEffect(() => {
  setDevices((prev) =>
    prev.map((d) => {
      if (d.type === "manager") {
        const moodColor = backgroundParams?.moodColor || currentMood.color;  // ← LLM 출력
        const brightness = backgroundParams?.lighting.brightness || 80;       // ← LLM 출력
        
        return {
          ...d,
          output: {
            ...d.output,
            color: moodColor,
            brightness: brightness,
          },
        };
      }
      if (d.type === "light") {
        const brightness = backgroundParams?.lighting.brightness || 70;      // ← LLM 출력
        
        return {
          ...d,
          output: {
            ...d.output,
            brightness: brightness,
          },
        };
      }
    })
  );
}, [backgroundParams, currentMood, setDevices]);
```

---

### 4.7 `BottomNav` (하단 네비게이션)

**위치**: `src/components/navigation/BottomNav.tsx`

**사용하는 파라미터**:
- `moodColor` → HOME 아이콘 색상 (활성화 시)

**코드 위치**:
```typescript
// BottomNav.tsx
const homeIconColor = moodColor || currentMood?.color;  // ← LLM 출력

// HOME 아이콘에 적용
style={{ color: homeIconColor }}
```

---

## 5. 요약

### LLM 입력
- **전처리**: 스트레스, 수면, 날씨, 감정 이벤트
- **마르코프 예측**: 무드 이름, 음악 장르, 향 타입 (10개 세그먼트)
- **선호도**: 음악/색상/향 선호 (콜드스타트 기본값)

### LLM 출력
- **표현**: `moodAlias`, `musicSelection`
- **색상**: `moodColor`
- **조명**: `lighting.rgb`, `lighting.brightness`, `lighting.temperature`
- **배경**: `backgroundIcon`, `backgroundWind`, `animationSpeed`, `iconOpacity`

### UI 반영
- **배경 파티클**: 아이콘, 바람, 속도, 투명도, 색상
- **대시보드 카드**: 별명, 배경색, 테두리색
- **디바이스**: 색상, 밝기
- **네비게이션**: 아이콘 색상

---

## 6. 확인 방법

### 콘솔 로그
```typescript
// useBackgroundParams.ts (75줄)
console.log("[BackgroundParams] LLM response source:", data.source);
```

### 대시보드 표시
- 무드 이름 옆에 "LLM: openai" / "LLM: cache" / "LLM: mock-no-key" 표시

### 네트워크 탭
- `POST /api/ai/background-params` 요청/응답 확인

