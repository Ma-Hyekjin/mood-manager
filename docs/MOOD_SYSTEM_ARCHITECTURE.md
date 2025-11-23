# 무드 시스템 아키텍처 가이드

**작성일**: 2025년  
**목적**: 무드 패턴, 음악, 향, 조명 조합 로직 설계 가이드

---

## 📊 데이터 흐름 (완전한 파이프라인)

```
1. 데이터 수집
   - 생체 데이터 (WearOS: raw_periodic)
   - 날씨 데이터
   - 오디오 이벤트 (ML 분류 완료: raw_events)
   ↓
2. 전처리 및 분석
   - 모든 데이터 전처리
   - 스트레스 지수, 수면 상태 등 계산
   ↓
3. 무드 패턴 결정 (내부 로직)
   - MOOD_PATTERNS 중 하나 선택
   - 사용자에게는 드러나지 않음 (내부용)
   ↓
4. 모델 기반 속성 결정
   - 무드 패턴 → 음악 장르 (SOUND_GENRES)
   - 음악 → 조명 색상/밝기
   - 무드 패턴 → 향 카테고리 (FRAGRANCE_CATEGORIES)
   ↓
5. OpenAI 무드 이름 생성
   - 입력: {moodPattern, music, scent, lighting}
   - 출력: 최종 무드 이름 (예: "Camomile Relaxer")
   ↓
6. DB 저장 (하나의 사이클)
   - 무드 이름
   - 무드 패턴 (내부용)
   - 음악 정보
   - 향 정보
   - 조명 정보
   - 타임스탬프
   ↓
7. 아웃풋 배출
   - Manager 디바이스에 전달
   - UI에 표시 (무드 이름만)
```

---

## 🎯 핵심 개념

### 데이터 구조

**향 카테고리 (FRAGRANCE_CATEGORIES)** - 고정
```typescript
const FRAGRANCE_CATEGORIES = [
  "musk", "aromatic", "woody", "citrus", "honey", "green",
  "dry", "leathery", "marine", "spicy", "floral", "powdery"
];
// 12개 고정, 변경/확장 불가
```

**사운드 장르 (SOUND_GENRES)** - 확장 가능
```typescript
const SOUND_GENRES = [
  "classical", "jazz", "pop", "rock", "hiphop_rap",
  "rnb_soul", "electronic_dance", "folk", "newage", "reggae"
];
// 현재 10개, 확장 가능
```

**무드 패턴 (MOOD_PATTERNS)** - 확장 가능
```typescript
const MOOD_PATTERNS = [
  "Recovery Mode", "Deep Relax", "Calm Down", "Cozy Rainy", "Comfort Warm",
  "Bright Morning", "Focus Mode", "Energy Boost", "Stabilizing Mood", "Happy Light"
];
// 현재 10개, 확장 가능
```

### 핵심 원칙

1. **무드 패턴**: 내부 로직용, 사용자에게 노출 안 함, DB에 저장
2. **무드 이름**: OpenAI가 생성, 사용자에게 표시
3. **조합 로직**: 무드→음악, 음악→조명, 무드→향 (아직 명확하지 않음)
4. **OpenAI 프롬프트**: Few-shot 불필요, 모든 속성 주입 후 이름만 받음

---

## 🏗️ 프로젝트 구조 가이드 옵션

### 옵션 1: 규칙 기반 매핑 테이블 (명확하고 확장 가능)

#### 구조

```typescript
// 무드 패턴 → 음악 장르 매핑
const MOOD_TO_MUSIC: Record<MoodPattern, SoundGenre[]> = {
  "Deep Relax": ["classical", "jazz", "newage"],
  "Energy Boost": ["pop", "rock", "electronic_dance"],
  "Focus Mode": ["classical", "electronic_dance", "newage"],
  "Calm Down": ["classical", "jazz", "folk"],
  "Recovery Mode": ["newage", "classical", "folk"],
  "Cozy Rainy": ["jazz", "folk", "classical"],
  "Comfort Warm": ["jazz", "rnb_soul", "folk"],
  "Bright Morning": ["pop", "folk", "classical"],
  "Stabilizing Mood": ["classical", "newage", "jazz"],
  "Happy Light": ["pop", "electronic_dance", "reggae"],
};

// 음악 장르 → 조명 색상 매핑
const MUSIC_TO_LIGHTING: Record<SoundGenre, LightingConfig[]> = {
  "classical": [
    { color: "#FFD700", brightness: 60 }, // 골드
    { color: "#FFA500", brightness: 50 },  // 오렌지
  ],
  "jazz": [
    { color: "#8B4513", brightness: 50 },  // 브라운
    { color: "#D2691E", brightness: 55 }, // 초콜릿
  ],
  "pop": [
    { color: "#FF69B4", brightness: 70 },  // 핑크
    { color: "#FF1493", brightness: 65 },  // 딥핑크
  ],
  "rock": [
    { color: "#DC143C", brightness: 40 },  // 크림슨
    { color: "#8B0000", brightness: 35 },  // 다크레드
  ],
  "electronic_dance": [
    { color: "#00CED1", brightness: 80 }, // 다크터키
    { color: "#00FFFF", brightness: 75 },  // 시안
  ],
  "newage": [
    { color: "#87CEEB", brightness: 55 },  // 스카이블루
    { color: "#B0E0E6", brightness: 60 },    // 파우더블루
  ],
  "folk": [
    { color: "#DAA520", brightness: 60 },  // 골든로드
    { color: "#F4A460", brightness: 65 },  // 샌디브라운
  ],
  "jazz": [
    { color: "#8B4513", brightness: 50 },  // 새들브라운
    { color: "#A0522D", brightness: 55 },  // 시에나
  ],
  "rnb_soul": [
    { color: "#9370DB", brightness: 60 },   // 미디엄퍼플
    { color: "#BA55D3", brightness: 65 },  // 미디엄오키드
  ],
  "reggae": [
    { color: "#32CD32", brightness: 70 },  // 라임그린
    { color: "#00FF00", brightness: 75 },   // 그린
  ],
  "hiphop_rap": [
    { color: "#1C1C1C", brightness: 30 },  // 거의 검정
    { color: "#2F2F2F", brightness: 35 },   // 다크그레이
  ],
};

// 무드 패턴 → 향 카테고리 매핑
const MOOD_TO_SCENT: Record<MoodPattern, FragranceCategory[]> = {
  "Deep Relax": ["floral", "aromatic", "woody"],
  "Energy Boost": ["citrus", "spicy", "marine"],
  "Focus Mode": ["aromatic", "woody", "green"],
  "Calm Down": ["floral", "aromatic", "powdery"],
  "Recovery Mode": ["aromatic", "woody", "floral"],
  "Cozy Rainy": ["woody", "aromatic", "floral"],
  "Comfort Warm": ["honey", "spicy", "woody"],
  "Bright Morning": ["citrus", "marine", "green"],
  "Stabilizing Mood": ["aromatic", "floral", "woody"],
  "Happy Light": ["citrus", "floral", "marine"],
};

// 선택 함수
function selectMusic(moodPattern: MoodPattern): SoundGenre {
  const candidates = MOOD_TO_MUSIC[moodPattern];
  return candidates[0]; // 첫 번째 우선순위 또는 랜덤 선택
}

function selectLighting(music: SoundGenre): LightingConfig {
  const candidates = MUSIC_TO_LIGHTING[music];
  return candidates[0]; // 첫 번째 우선순위 또는 랜덤 선택
}

function selectScent(moodPattern: MoodPattern): FragranceCategory {
  const candidates = MOOD_TO_SCENT[moodPattern];
  return candidates[0]; // 첫 번째 우선순위 또는 랜덤 선택
}
```

#### 장점
- ✅ 명확하고 이해하기 쉬움
- ✅ 수정/확장이 쉬움
- ✅ 팀원 간 공유와 검토가 쉬움
- ✅ 디버깅과 테스트가 쉬움
- ✅ 하드코딩이지만 예측 가능

#### 단점
- ❌ 조합이 많아지면 테이블이 커짐
- ❌ 하드코딩 느낌
- ❌ 동적 조정이 어려움

#### 추천 사용 시나리오
- 초기 프로토타입
- 빠른 개발이 필요한 경우
- 명확한 규칙이 있는 경우

---

### 옵션 2: 가중치 기반 선택 (유연하고 확장 가능)

#### 구조

```typescript
// 무드 패턴별 음악 선호도 가중치
const MOOD_MUSIC_WEIGHTS: Record<MoodPattern, Record<SoundGenre, number>> = {
  "Deep Relax": {
    "classical": 0.8,
    "jazz": 0.7,
    "newage": 0.9,
    "pop": 0.2,
    "rock": 0.1,
    "electronic_dance": 0.3,
    "folk": 0.6,
    "rnb_soul": 0.4,
    "reggae": 0.3,
    "hiphop_rap": 0.1,
  },
  "Energy Boost": {
    "classical": 0.2,
    "jazz": 0.3,
    "newage": 0.1,
    "pop": 0.9,
    "rock": 0.8,
    "electronic_dance": 0.9,
    "folk": 0.4,
    "rnb_soul": 0.6,
    "reggae": 0.7,
    "hiphop_rap": 0.8,
  },
  // ... 나머지 무드 패턴
};

// 음악 장르별 조명 선호도 가중치
const MUSIC_LIGHTING_WEIGHTS: Record<SoundGenre, Array<{
  config: LightingConfig;
  weight: number;
}>> = {
  "classical": [
    { config: { color: "#FFD700", brightness: 60 }, weight: 0.9 },
    { config: { color: "#FFA500", brightness: 50 }, weight: 0.7 },
    { config: { color: "#FFE4B5", brightness: 70 }, weight: 0.5 },
  ],
  "jazz": [
    { config: { color: "#8B4513", brightness: 50 }, weight: 0.9 },
    { config: { color: "#D2691E", brightness: 55 }, weight: 0.7 },
    { config: { color: "#A0522D", brightness: 52 }, weight: 0.5 },
  ],
  // ... 나머지 음악 장르
};

// 무드 패턴별 향 선호도 가중치
const MOOD_SCENT_WEIGHTS: Record<MoodPattern, Record<FragranceCategory, number>> = {
  "Deep Relax": {
    "floral": 0.9,
    "aromatic": 0.8,
    "woody": 0.7,
    "citrus": 0.2,
    "spicy": 0.1,
    // ... 나머지 향
  },
  // ... 나머지 무드 패턴
};

// 가중치 기반 랜덤 선택 함수
function weightedRandomSelect<T>(
  weights: Record<string, number>
): T {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  let random = Math.random() * total;
  
  for (const [key, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return key as T;
    }
  }
  
  // 폴백: 첫 번째 항목
  return Object.keys(weights)[0] as T;
}

// 선택 함수
function selectMusic(moodPattern: MoodPattern): SoundGenre {
  const weights = MOOD_MUSIC_WEIGHTS[moodPattern];
  return weightedRandomSelect<SoundGenre>(weights);
}

function selectLighting(music: SoundGenre): LightingConfig {
  const weights = MUSIC_LIGHTING_WEIGHTS[music];
  const selected = weightedRandomSelect<{ config: LightingConfig; weight: number }>(weights);
  return selected.config;
}

function selectScent(moodPattern: MoodPattern): FragranceCategory {
  const weights = MOOD_SCENT_WEIGHTS[moodPattern];
  return weightedRandomSelect<FragranceCategory>(weights);
}
```

#### 장점
- ✅ 유연하고 확장 가능
- ✅ 확률 기반으로 다양성 확보
- ✅ 미세 조정 가능 (가중치만 변경)
- ✅ 하드코딩보다 자연스러움

#### 단점
- ❌ 초기 설정이 복잡함
- ❌ 가중치 튜닝이 필요함
- ❌ 예측이 어려움 (랜덤성)

#### 추천 사용 시나리오
- 다양성이 중요한 경우
- 사용자 경험 개선이 필요한 경우
- 확률 기반 선택이 적합한 경우

---

### 옵션 3: 규칙 + 우선순위 조합 (균형잡힌 방식) ⭐ 추천

#### 구조

```typescript
// 무드 패턴별 음악 우선순위 리스트
const MOOD_MUSIC_PRIORITY: Record<MoodPattern, SoundGenre[]> = {
  "Deep Relax": ["newage", "classical", "jazz", "folk"],
  "Energy Boost": ["electronic_dance", "pop", "rock", "reggae"],
  "Focus Mode": ["classical", "electronic_dance", "newage", "jazz"],
  "Calm Down": ["classical", "jazz", "folk", "newage"],
  "Recovery Mode": ["newage", "classical", "folk", "jazz"],
  "Cozy Rainy": ["jazz", "folk", "classical", "newage"],
  "Comfort Warm": ["jazz", "rnb_soul", "folk", "classical"],
  "Bright Morning": ["pop", "folk", "classical", "reggae"],
  "Stabilizing Mood": ["classical", "newage", "jazz", "folk"],
  "Happy Light": ["pop", "electronic_dance", "reggae", "rnb_soul"],
};

// 음악 장르별 조명 규칙
const MUSIC_LIGHTING_RULES: Record<SoundGenre, {
  primary: LightingConfig;
  alternatives: LightingConfig[];
}> = {
  "classical": {
    primary: { color: "#FFD700", brightness: 60 },
    alternatives: [
      { color: "#FFA500", brightness: 50 },
      { color: "#FFE4B5", brightness: 70 },
    ],
  },
  "jazz": {
    primary: { color: "#8B4513", brightness: 50 },
    alternatives: [
      { color: "#D2691E", brightness: 55 },
      { color: "#A0522D", brightness: 52 },
    ],
  },
  "pop": {
    primary: { color: "#FF69B4", brightness: 70 },
    alternatives: [
      { color: "#FF1493", brightness: 65 },
      { color: "#FFB6C1", brightness: 75 },
    ],
  },
  // ... 나머지 음악 장르
};

// 무드 패턴별 향 우선순위 리스트
const MOOD_SCENT_PRIORITY: Record<MoodPattern, FragranceCategory[]> = {
  "Deep Relax": ["floral", "aromatic", "woody", "powdery"],
  "Energy Boost": ["citrus", "spicy", "marine", "green"],
  "Focus Mode": ["aromatic", "woody", "green", "citrus"],
  "Calm Down": ["floral", "aromatic", "powdery", "woody"],
  "Recovery Mode": ["aromatic", "woody", "floral", "powdery"],
  "Cozy Rainy": ["woody", "aromatic", "floral", "powdery"],
  "Comfort Warm": ["honey", "spicy", "woody", "aromatic"],
  "Bright Morning": ["citrus", "marine", "green", "floral"],
  "Stabilizing Mood": ["aromatic", "floral", "woody", "powdery"],
  "Happy Light": ["citrus", "floral", "marine", "green"],
};

// 선택 함수: 우선순위 기반, 필요시 랜덤
function selectMusic(
  moodPattern: MoodPattern,
  useRandom: boolean = false
): SoundGenre {
  const candidates = MOOD_MUSIC_PRIORITY[moodPattern];
  if (useRandom) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return candidates[0]; // 첫 번째 우선순위
}

function selectLighting(
  music: SoundGenre,
  useRandom: boolean = false
): LightingConfig {
  const rules = MUSIC_LIGHTING_RULES[music];
  if (useRandom && rules.alternatives.length > 0) {
    const allOptions = [rules.primary, ...rules.alternatives];
    return allOptions[Math.floor(Math.random() * allOptions.length)];
  }
  return rules.primary;
}

function selectScent(
  moodPattern: MoodPattern,
  useRandom: boolean = false
): FragranceCategory {
  const candidates = MOOD_SCENT_PRIORITY[moodPattern];
  if (useRandom) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return candidates[0]; // 첫 번째 우선순위
}
```

#### 장점
- ✅ 명확하면서도 유연함
- ✅ 우선순위 기반으로 예측 가능
- ✅ 확장이 쉬움
- ✅ 랜덤 옵션 제공 가능
- ✅ 하드코딩과 동적 선택의 균형

#### 단점
- ❌ 규칙과 우선순위 관리 필요
- ❌ 초기 설정 작업 필요

#### 추천 사용 시나리오
- **초기 구현에 가장 적합** ⭐
- 명확한 규칙 + 약간의 다양성 필요
- 팀 협업이 중요한 경우

---

### 옵션 4: 하이브리드 (규칙 + 동적 조합)

#### 구조

```typescript
// 기본 매핑 규칙
const MOOD_MUSIC_MAP: Record<MoodPattern, SoundGenre[]> = {
  "Deep Relax": ["newage", "classical", "jazz"],
  // ... 나머지
};

// 컨텍스트 타입
interface SelectionContext {
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
  weather?: "sunny" | "rainy" | "cloudy" | "snowy";
  userPreference?: {
    preferredGenres?: SoundGenre[];
    preferredScents?: FragranceCategory[];
    preferredLighting?: LightingConfig[];
  };
  previousMood?: MoodPattern;
}

// 동적 조합 함수
function selectAttributes(
  moodPattern: MoodPattern,
  context: SelectionContext = {}
): {
  music: SoundGenre;
  lighting: LightingConfig;
  scent: FragranceCategory;
} {
  // 1. 기본 무드→음악 매핑
  let musicCandidates = MOOD_MUSIC_MAP[moodPattern];
  
  // 2. 컨텍스트 기반 필터링/조정
  if (context.timeOfDay === "morning") {
    // 아침에는 밝은 음악 선호
    musicCandidates = musicCandidates.filter(g => 
      ["pop", "folk", "classical"].includes(g)
    );
  } else if (context.timeOfDay === "night") {
    // 밤에는 차분한 음악 선호
    musicCandidates = musicCandidates.filter(g => 
      ["jazz", "newage", "classical"].includes(g)
    );
  }
  
  if (context.weather === "rainy") {
    // 비 오는 날에는 특정 음악 선호
    musicCandidates = ["jazz", "folk", "classical"].filter(g => 
      musicCandidates.includes(g)
    );
  }
  
  // 사용자 선호도 반영
  if (context.userPreference?.preferredGenres) {
    const preferred = context.userPreference.preferredGenres.filter(g =>
      musicCandidates.includes(g)
    );
    if (preferred.length > 0) {
      musicCandidates = preferred;
    }
  }
  
  // 3. 음악 선택
  const selectedMusic = musicCandidates[0] || MOOD_MUSIC_MAP[moodPattern][0];
  
  // 4. 음악→조명 매핑 (컨텍스트 반영)
  let lighting = MUSIC_LIGHTING_RULES[selectedMusic].primary;
  if (context.timeOfDay === "night") {
    lighting = { ...lighting, brightness: Math.max(30, lighting.brightness - 20) };
  }
  
  // 5. 무드→향 매핑 (컨텍스트 반영)
  let scentCandidates = MOOD_SCENT_PRIORITY[moodPattern];
  if (context.userPreference?.preferredScents) {
    const preferred = context.userPreference.preferredScents.filter(s =>
      scentCandidates.includes(s)
    );
    if (preferred.length > 0) {
      scentCandidates = preferred;
    }
  }
  const selectedScent = scentCandidates[0];
  
  return {
    music: selectedMusic,
    lighting,
    scent: selectedScent,
  };
}
```

#### 장점
- ✅ 기본 규칙 + 컨텍스트 반영
- ✅ 확장성과 유연성
- ✅ 개인화 가능
- ✅ 시간대, 날씨 등 외부 요인 반영

#### 단점
- ❌ 구현 복잡도 증가
- ❌ 컨텍스트 로직 설계 필요
- ❌ 디버깅이 어려울 수 있음
- ❌ 초기 구현 시간 증가

#### 추천 사용 시나리오
- 장기적으로 유연성과 개인화가 중요한 경우
- 사용자 선호도 학습이 필요한 경우
- 외부 요인(날씨, 시간대) 반영이 중요한 경우

---

## 💾 DB 스키마 설계

### MoodCycle 인터페이스

```typescript
interface MoodCycle {
  id: string;                    // 고유 ID
  userId: string;                // 사용자 ID
  timestamp: number;              // 생성 시간 (Unix ms)
  
  // 사용자에게 표시되는 정보
  moodName: string;               // OpenAI 생성 (예: "Camomile Relaxer")
  
  // 내부 로직 정보 (DB 저장, 사용자에게 노출 안 함)
  moodPattern: MoodPattern;       // MOOD_PATTERNS 중 하나
  
  // 속성 정보
  music: {
    genre: SoundGenre;            // SOUND_GENRES 중 하나
    title?: string;                // 선택적: 음악 제목
    artist?: string;               // 선택적: 아티스트
  };
  
  scent: {
    category: FragranceCategory;   // FRAGRANCE_CATEGORIES 중 하나
    level: number;                // 1-10
    interval: number;             // 분사 주기 (분)
  };
  
  lighting: {
    color: string;                // HEX 색상 코드
    brightness: number;           // 0-100
    pattern?: "static" | "pulsing" | "breathing"; // 선택적
  };
  
  // 전처리 데이터 (선택적, 분석용)
  preprocessedData?: {
    stressScore?: number;         // 0-100
    sleepStatus?: "awake" | "light" | "deep";
    heartRateAvg?: number;
    hrvSdnn?: number;
    audioEventType?: "laughter" | "sigh";
    weather?: string;
    // ... 기타 전처리 결과
  };
  
  // 메타데이터
  createdAt: Date;
  updatedAt?: Date;
}
```

### Prisma Schema 예시

```prisma
model MoodCycle {
  id              String   @id @default(uuid())
  userId          String
  timestamp       BigInt
  
  moodName        String
  moodPattern     String   // MOOD_PATTERNS
  
  musicGenre      String   // SOUND_GENRES
  musicTitle      String?
  musicArtist     String?
  
  scentCategory   String   // FRAGRANCE_CATEGORIES
  scentLevel      Int      @default(5)
  scentInterval   Int      @default(10) // 분
  
  lightingColor   String   // HEX
  lightingBrightness Int   @default(50)
  lightingPattern String?  // "static" | "pulsing" | "breathing"
  
  stressScore     Int?
  sleepStatus     String?
  heartRateAvg    Int?
  hrvSdnn         Float?
  audioEventType  String?
  weather         String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime?
  
  @@index([userId, timestamp])
  @@index([moodPattern])
}
```

---

## 🤖 OpenAI 프롬프트 구조

### 입력 형식

```typescript
interface OpenAIInput {
  moodPattern: MoodPattern;      // 예: "Deep Relax"
  music: {
    genre: SoundGenre;            // 예: "jazz"
    title?: string;               // 예: "Autumn Leaves"
  };
  scent: {
    category: FragranceCategory;  // 예: "floral"
    level: number;                // 예: 7
    interval: number;             // 예: 10
  };
  lighting: {
    color: string;                // 예: "#FFD700"
    brightness: number;           // 예: 60
    pattern?: string;             // 예: "static"
  };
}
```

### 프롬프트 예시

```
당신은 무드 속성(무드 패턴, 음악, 향, 조명)을 분석하여 해당 무드에 맞는 창의적이고 시적인 이름을 생성하는 전문가입니다.

입력 정보:
- 무드 패턴: Deep Relax
- 음악: jazz (장르)
- 향: floral (카테고리), 레벨 7, 주기 10분
- 조명: #FFD700 (골드), 밝기 60

이 정보를 종합하여 무드의 특성을 반영한 자연스럽고 시적인 이름을 생성하세요.
무드 패턴 이름("Deep Relax")이 아닌, 음악과 향, 조명의 조합을 반영한 새로운 이름을 생성합니다.

출력 형식: 무드 이름만 출력하세요 (예: "Camomile Relaxer", "Golden Jazz Evening", "Floral Serenity")
```

### 응답 처리

```typescript
async function generateMoodName(input: OpenAIInput): Promise<string> {
  const prompt = `당신은 무드 속성(무드 패턴, 음악, 향, 조명)을 분석하여 해당 무드에 맞는 창의적이고 시적인 이름을 생성하는 전문가입니다.

입력 정보:
- 무드 패턴: ${input.moodPattern}
- 음악: ${input.music.genre}${input.music.title ? ` (${input.music.title})` : ''}
- 향: ${input.scent.category}, 레벨 ${input.scent.level}, 주기 ${input.scent.interval}분
- 조명: ${input.lighting.color}, 밝기 ${input.lighting.brightness}${input.lighting.pattern ? `, 패턴: ${input.lighting.pattern}` : ''}

이 정보를 종합하여 무드의 특성을 반영한 자연스럽고 시적인 이름을 생성하세요.
무드 패턴 이름("${input.moodPattern}")이 아닌, 음악과 향, 조명의 조합을 반영한 새로운 이름을 생성합니다.

출력 형식: 무드 이름만 출력하세요 (예: "Camomile Relaxer", "Golden Jazz Evening", "Floral Serenity")`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "당신은 무드 속성(음악, 조명색, 향, 주기)을 분석하여 해당 무드에 맞는 창의적이고 시적인 이름을 생성하는 전문가입니다.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 20,
  });

  return response.choices[0]?.message?.content?.trim() || "Gentle Breeze";
}
```

---

## 🔄 확장성 고려사항

### 새로운 무드 패턴 추가

1. `MOOD_PATTERNS` 배열에 추가
2. 매핑 테이블에 해당 패턴의 음악/향 우선순위 추가
3. DB 스키마 변경 불필요 (문자열로 저장)

### 새로운 음악 장르 추가

1. `SOUND_GENRES` 배열에 추가
2. `MUSIC_TO_LIGHTING` 매핑에 해당 장르의 조명 규칙 추가
3. 각 무드 패턴의 음악 우선순위에 필요시 추가

### 향 카테고리

- **고정**: 12개 카테고리 변경 불가
- 새로운 향 추가 시 기존 카테고리 중 하나로 분류

---

## 📋 팀 회의 시 논의 포인트

### 1. 조합 로직 선택
- [ ] 옵션 1: 규칙 기반 매핑 테이블
- [ ] 옵션 2: 가중치 기반 선택
- [ ] 옵션 3: 규칙 + 우선순위 조합 ⭐ 추천
- [ ] 옵션 4: 하이브리드 (규칙 + 동적 조합)

### 2. 초기 매핑 규칙
- [ ] 각 무드 패턴별 음악 우선순위 결정
- [ ] 각 음악 장르별 조명 색상/밝기 결정
- [ ] 각 무드 패턴별 향 우선순위 결정

### 3. 동적 조정 범위
- [ ] 시간대(아침/점심/저녁/밤) 반영 여부
- [ ] 날씨(맑음/비/흐림) 반영 여부
- [ ] 사용자 선호도 반영 여부

### 4. 랜덤성
- [ ] 항상 동일한 조합인지 (첫 번째 우선순위)
- [ ] 일정 확률로 다양성 부여할지
- [ ] 랜덤 선택 시 확률 분포 (균등/가중치)

### 5. 개인화
- [ ] 사용자 선호도 학습 여부
- [ ] 선호도 반영 방식 (우선순위 조정/필터링)
- [ ] 선호도 데이터 저장 방식

### 6. OpenAI 프롬프트
- [ ] Few-shot 예시 필요 여부 (현재는 불필요로 판단)
- [ ] 프롬프트 템플릿 최종 확정
- [ ] 응답 형식 검증 로직

### 7. DB 스키마
- [ ] `MoodCycle` 스키마 최종 확정
- [ ] 인덱스 전략 (userId + timestamp, moodPattern 등)
- [ ] 전처리 데이터 저장 범위

---

## 🎯 추천 순서

1. **옵션 3 (규칙 + 우선순위)** - 초기 구현에 가장 적합 ⭐
2. **옵션 1 (규칙 기반)** - 가장 단순, 빠른 프로토타입
3. **옵션 4 (하이브리드)** - 장기적으로 유연성과 개인화
4. **옵션 2 (가중치)** - 확률 기반 다양성이 필요한 경우

---

## 📝 다음 단계

1. 팀 회의에서 옵션 선택
2. 초기 매핑 규칙 작성
3. DB 스키마 최종 확정
4. OpenAI 프롬프트 최종 확정
5. 구현 시작

---

## 📚 참고 자료

- [메인 프로젝트 README](../README.md)
- [프로젝트 구조 문서](./PROJECT_STRUCTURE.md)
- [API 명세서](./API_SPEC.md)
- [페이지 역할 문서](./PAGE_ROLES.md)

