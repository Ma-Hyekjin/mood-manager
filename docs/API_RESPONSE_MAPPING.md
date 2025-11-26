# API 응답 매핑 가이드

## 문제 상황

HJ 브랜치의 `/api/preprocessing` 응답 구조와 우리가 설계한 LLM Input 구조가 다릅니다.

---

## 구조 비교

### HJ 브랜치의 실제 응답

```json
{
  "average_stress_index": 45,
  "recent_stress_index": 39,
  "latest_sleep_score": 79,
  "latest_sleep_duration": 600,
  "weather": {
    "temperature": 9.6,
    "humidity": 26,
    "rainType": 0,
    "sky": 1
  },
  "preferences": {
    "fragrance": ["citrus", "floral", "woody"],
    "lighting": {
      "r": 255,
      "g": 255,
      "b": 255,
      "brightness": 50
    },
    "sound_genres": ["newage", "ambient", "classical"]
  },
  "mood_signals": {
    "laugh_count": 2,
    "sigh_count": 1
  }
}
```

### 우리가 설계한 LLM Input 구조

```json
{
  "moodName": "DEEP Relax",
  "musicGenre": "newage",
  "scentType": "citrus",
  "preprocessed": {
    "average_stress_index": 45,
    "recent_stress_index": 39,
    "latest_sleep_score": 79,
    "latest_sleep_duration": 600,
    "weather": { ... },
    "emotionEvents": {
      "laughter": [1234567890, 1234567900],
      "sigh": [1234568000],
      "anger": [],
      "sadness": [],
      "neutral": [1234567000]
    }
  },
  "userPreferences": {
    "music": {
      "rnb-soul": "-",
      "electronic-dance": "-",
      "else": "+"
    },
    "color": {
      "black": "-",
      "green": "-",
      "else": "+"
    },
    "scent": {
      "spicy": "-",
      "green": "-",
      "honey": "-",
      "else": "+"
    }
  }
}
```

---

## 변환이 필요한 이유

### 1. `preferences` → `userPreferences` 변환

**HJ 브랜치 구조:**
```json
"preferences": {
  "fragrance": ["citrus", "floral", "woody"],
  "lighting": { "r": 255, "g": 255, "b": 255, "brightness": 50 },
  "sound_genres": ["newage", "ambient", "classical"]
}
```

**우리가 필요한 구조:**
```json
"userPreferences": {
  "music": { "rnb-soul": "-", "electronic-dance": "-", "else": "+" },
  "color": { "black": "-", "green": "-", "else": "+" },
  "scent": { "spicy": "-", "green": "-", "honey": "-", "else": "+" }
}
```

**차이점:**
- HJ: Top3 배열 형태 (선호하는 것만)
- 우리: 모든 옵션에 대한 선호/비선호 표시

**변환 필요성:**
- LLM이 "어떤 것을 피해야 하는지" 알 수 있어야 함
- 현재 구조는 "선호하는 것"만 알려줌

---

### 2. `mood_signals` → `emotionEvents` 변환

**HJ 브랜치 구조:**
```json
"mood_signals": {
  "laugh_count": 2,
  "sigh_count": 1
}
```

**우리가 필요한 구조:**
```json
"emotionEvents": {
  "laughter": [1234567890, 1234567900],
  "sigh": [1234568000],
  "anger": [],
  "sadness": [],
  "neutral": [1234567000]
}
```

**차이점:**
- HJ: 개수만 제공 (count)
- 우리: 타임스탬프 배열 필요

**변환 필요성:**
- LLM이 "언제 웃었는지" 시간적 맥락 파악 가능
- 개수만으로는 시간대별 패턴 파악 어려움

---

## 🛠️ 변환 로직 구현

### 1. preferences → userPreferences 변환

```typescript
/**
 * HJ 브랜치의 preferences를 우리 구조로 변환
 */
function mapPreferencesToLLMFormat(
  hjPreferences: {
    fragrance: string[];
    lighting: { r: number; g: number; b: number; brightness: number } | null;
    sound_genres: string[];
  }
): {
  music: Record<string, '+' | '-'>;
  color: Record<string, '+' | '-'>;
  scent: Record<string, '+' | '-'>;
} {
  // 모든 가능한 옵션 정의
  const allMusicGenres = ["rnb-soul", "electronic-dance", "newage", "ambient", "classical", "jazz", "pop", "rock"];
  const allColors = ["black", "white", "red", "green", "blue", "yellow", "purple", "orange"];
  const allScents = ["spicy", "green", "honey", "citrus", "floral", "woody", "marine", "musk"];
  
  // 음악 선호도 변환
  const musicPrefs: Record<string, '+' | '-'> = {};
  allMusicGenres.forEach(genre => {
    if (hjPreferences.sound_genres.includes(genre)) {
      musicPrefs[genre] = '+';
    } else {
      musicPrefs[genre] = '-';
    }
  });
  musicPrefs['else'] = '+'; // 나머지는 선호
  
  // 색상 선호도 변환
  // lighting이 null이면 모든 색상 선호로 간주
  const colorPrefs: Record<string, '+' | '-'> = {};
  if (hjPreferences.lighting) {
    // RGB 값을 색상으로 변환 (간단한 예시)
    const { r, g, b } = hjPreferences.lighting;
    // 실제로는 RGB를 색상 이름으로 매핑하는 로직 필요
    allColors.forEach(color => {
      colorPrefs[color] = '+'; // 기본값
    });
  } else {
    allColors.forEach(color => {
      colorPrefs[color] = '+';
    });
  }
  colorPrefs['else'] = '+';
  
  // 향 선호도 변환
  const scentPrefs: Record<string, '+' | '-'> = {};
  allScents.forEach(scent => {
    if (hjPreferences.fragrance.includes(scent)) {
      scentPrefs[scent] = '+';
    } else {
      scentPrefs[scent] = '-';
    }
  });
  scentPrefs['else'] = '+';
  
  return {
    music: musicPrefs,
    color: colorPrefs,
    scent: scentPrefs,
  };
}
```

**문제점:**
- HJ 브랜치는 "선호하는 것"만 제공
- 우리는 "비선호하는 것"도 필요
- 변환 시 나머지는 모두 비선호로 처리해야 함

---

### 2. mood_signals → emotionEvents 변환

```typescript
/**
 * HJ 브랜치의 mood_signals를 우리 구조로 변환
 */
function mapMoodSignalsToEmotionEvents(
  hjMoodSignals: {
    laugh_count: number;
    sigh_count: number;
  }
): {
  laughter: number[];
  sigh: number[];
  anger: number[];
  sadness: number[];
  neutral: number[];
} {
  const now = Date.now();
  
  // 개수만 있으므로 타임스탬프를 임의로 생성
  // (실제로는 백엔드에서 타임스탬프를 제공해야 함)
  const laughter: number[] = [];
  for (let i = 0; i < hjMoodSignals.laugh_count; i++) {
    laughter.push(now - (i * 60 * 60 * 1000)); // 1시간 간격으로 가정
  }
  
  const sigh: number[] = [];
  for (let i = 0; i < hjMoodSignals.sigh_count; i++) {
    sigh.push(now - (i * 60 * 60 * 1000));
  }
  
  // anger, sadness는 제공되지 않음
  const anger: number[] = [];
  const sadness: number[] = [];
  
  // 감정 이벤트가 하나도 없으면 평온으로 설정
  const hasAnyEmotion = laughter.length > 0 || sigh.length > 0;
  const neutral: number[] = hasAnyEmotion ? [] : [now];
  
  return {
    laughter,
    sigh,
    anger,
    sadness,
    neutral,
  };
}
```

**문제점:**
- HJ 브랜치는 개수만 제공
- 우리는 타임스탬프 배열 필요
- 타임스탬프를 임의로 생성해야 함 (부정확)

---

## 해결 방안

### 옵션 1: 프론트엔드에서 변환 (현재 가능)

**장점:**
- 즉시 사용 가능
- 백엔드 수정 불필요

**단점:**
- 타임스탬프가 부정확 (임의 생성)
- 선호도 변환이 불완전 (비선호 정보 부족)

**구현:**
```typescript
// 프론트엔드에서 변환
const hjResponse = await fetch("/api/preprocessing").then(r => r.json());

const llmInput = {
  moodName: moodStream.currentMood.name,
  musicGenre: moodStream.currentMood.music.genre,
  scentType: moodStream.currentMood.scent.type,
  preprocessed: {
    ...hjResponse,
    emotionEvents: mapMoodSignalsToEmotionEvents(hjResponse.mood_signals),
  },
  userPreferences: mapPreferencesToLLMFormat(hjResponse.preferences),
  // ...
};
```

---

### 옵션 2: 백엔드 API 수정 (권장)

**HJ 브랜치의 `/api/preprocessing` 수정 요청:**

1. **emotionEvents 구조 변경:**
```typescript
// 현재
"mood_signals": { "laugh_count": 2, "sigh_count": 1 }

// 변경 후
"emotionEvents": {
  "laughter": [1234567890, 1234567900],
  "sigh": [1234568000],
  "anger": [],
  "sadness": [],
  "neutral": [1234567000] // 기본값
}
```

2. **userPreferences 구조 변경:**
```typescript
// 현재
"preferences": {
  "fragrance": ["citrus", "floral"],
  "lighting": { "r": 255, "g": 255, "b": 255 },
  "sound_genres": ["newage", "ambient"]
}

// 변경 후 (또는 추가)
"userPreferences": {
  "music": { "rnb-soul": "-", "electronic-dance": "-", "else": "+" },
  "color": { "black": "-", "green": "-", "else": "+" },
  "scent": { "spicy": "-", "green": "-", "honey": "-", "else": "+" }
}
```

**장점:**
- 정확한 데이터 제공
- 프론트엔드 변환 로직 불필요

**단점:**
- 백엔드 수정 필요
- 시간 소요

---

## 권장 사항

**단기:**
- 프론트엔드에서 변환 로직 구현
- 즉시 사용 가능

**장기:**
- 백엔드 API 수정 요청
- 정확한 데이터 구조로 통일

---

## 📋 변환 로직 요약

**프론트엔드에서 변환이 필요한 이유:**

1. **데이터 구조 불일치**
   - HJ: `preferences` (Top3 배열)
   - 우리: `userPreferences` (선호/비선호 맵)

2. **데이터 형식 불일치**
   - HJ: `mood_signals` (count)
   - 우리: `emotionEvents` (timestamp 배열)

3. **누락된 정보**
   - 타임스탬프 없음
   - 비선호 정보 없음
   - anger, sadness 정보 없음

**변환 로직이 하는 일:**
- HJ 응답을 우리가 설계한 LLM Input 구조로 변환
- 누락된 정보는 기본값 또는 추정값으로 채움

