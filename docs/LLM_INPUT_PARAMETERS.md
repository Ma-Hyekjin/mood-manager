# LLM 입력 파라미터 가이드

## 🎯 개요

프론트엔드에서 LLM API로 전송할 때 사용하는 파라미터와 가공 방법을 정리합니다.

---

## 📋 파라미터 출처 및 가공

### 1. 백엔드 API 호출

#### GET /api/preprocessing
**응답 구조:**
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
  "emotionEvents": {
    "laughter": [1234567890, 1234567900],
    "sigh": [1234568000],
    "anger": [],
    "sadness": [],
    "neutral": [1234567000, 1234567100]
  }
}
```

**204 응답 시 (데이터 없음):**
```json
{
  "average_stress_index": 50,
  "recent_stress_index": 50,
  "latest_sleep_score": 70,
  "latest_sleep_duration": 480,
  "weather": {
    "temperature": 20,
    "humidity": 50,
    "rainType": 0,
    "sky": 1
  },
  "emotionEvents": {
    "laughter": [],
    "sigh": [],
    "anger": [],
    "sadness": [],
    "neutral": [Date.now()]
  }
}
```

#### GET /api/moods/current
**응답 구조:**
```json
{
  "currentMood": {
    "id": "calm-1",
    "name": "DEEP Relax",
    "cluster": "0",
    "music": {
      "genre": "newage",
      "title": "Calm Breeze"
    },
    "scent": {
      "type": "citrus",
      "name": "Orange"
    }
  },
  "userDataCount": 45
}
```

---

## 🔄 파라미터 조합 및 가공

### 최종 LLM Input 구조

```typescript
{
  // 필수: 무드 정보 (마르코프 체인 예측 결과)
  moodName: string,                    // GET /api/moods/current → currentMood.name
  musicGenre: string,                  // GET /api/moods/current → currentMood.music.genre
  scentType: string,                   // GET /api/moods/current → currentMood.scent.type
  
  // 필수: 전처리된 데이터 (백엔드에서 제공)
  preprocessed: {
    average_stress_index: number,      // GET /api/preprocessing → average_stress_index
    recent_stress_index: number,       // GET /api/preprocessing → recent_stress_index
    latest_sleep_score: number,        // GET /api/preprocessing → latest_sleep_score
    latest_sleep_duration: number,     // GET /api/preprocessing → latest_sleep_duration
    weather: {
      temperature: number,            // GET /api/preprocessing → weather.temperature
      humidity: number,                // GET /api/preprocessing → weather.humidity
      rainType: number,                 // GET /api/preprocessing → weather.rainType
      sky: number                      // GET /api/preprocessing → weather.sky
    },
    emotionEvents: {
      laughter: number[],              // GET /api/preprocessing → emotionEvents.laughter
      sigh: number[],                  // GET /api/preprocessing → emotionEvents.sigh
      anger: number[],                 // GET /api/preprocessing → emotionEvents.anger
      sadness: number[],               // GET /api/preprocessing → emotionEvents.sadness
      neutral: number[]                // GET /api/preprocessing → emotionEvents.neutral
    }
  },
  
  // 필수: 사용자 선호도
  userPreferences: {
    music: Record<string, '+' | '-'>,  // 로컬 저장소/DB
    color: Record<string, '+' | '-'>,  // 로컬 저장소/DB
    scent: Record<string, '+' | '-'>,  // 로컬 저장소/DB
  },
  
  // 선택적: 컨텍스트
  timeOfDay?: number,                  // new Date().getHours() (0-23)
  currentCluster?: string,             // GET /api/moods/current → currentMood.cluster ('-', '0', '+')
  userDataCount?: number,              // GET /api/moods/current → userDataCount
  previousMood?: string,               // 로컬 상태
  season?: string                      // 월 기반 계산 ("Spring", "Summer", "Autumn", "Winter")
}
```

---

## 🛠️ 가공 방법

### 1. 계절 계산
```typescript
function inferSeason(month: number): string {
  if (month >= 3 && month <= 5) return "Spring";
  if (month >= 6 && month <= 8) return "Summer";
  if (month >= 9 && month <= 11) return "Autumn";
  return "Winter";
}

// 사용
const season = inferSeason(new Date().getMonth() + 1);
```

### 2. 시간대 계산
```typescript
const timeOfDay = new Date().getHours(); // 0-23
```

### 3. 전처리 데이터 기본값 처리
```typescript
async function fetchPreprocessedData(): Promise<PreprocessingResponse> {
  const response = await fetch("/api/preprocessing");
  
  if (response.status === 204) {
    // 데이터 없음 → 기본값 사용
    return {
      average_stress_index: 50,
      recent_stress_index: 50,
      latest_sleep_score: 70,
      latest_sleep_duration: 480,
      weather: {
        temperature: 20,
        humidity: 50,
        rainType: 0,
        sky: 1,
      },
      emotionEvents: {
        laughter: [],
        sigh: [],
        anger: [],
        sadness: [],
        neutral: [Date.now()], // 기본값: 평온
      },
    };
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch preprocessed data");
  }
  
  return await response.json();
}
```

### 4. 감정 이벤트 기본값 보장
```typescript
function ensureEmotionEvents(
  emotionEvents?: PreprocessingResponse['emotionEvents']
): PreprocessingResponse['emotionEvents'] {
  if (!emotionEvents) {
    return {
      laughter: [],
      sigh: [],
      anger: [],
      sadness: [],
      neutral: [Date.now()], // 기본값: 평온
    };
  }
  
  // 감정 이벤트가 하나도 없으면 평온으로 설정
  const hasAnyEmotion = 
    emotionEvents.laughter?.length > 0 ||
    emotionEvents.sigh?.length > 0 ||
    emotionEvents.anger?.length > 0 ||
    emotionEvents.sadness?.length > 0;
  
  if (!hasAnyEmotion && (!emotionEvents.neutral || emotionEvents.neutral.length === 0)) {
    emotionEvents.neutral = [Date.now()];
  }
  
  return emotionEvents;
}
```

---

## 📤 최종 조합 예시

```typescript
// 1. 백엔드 API 호출
const preprocessed = await fetchPreprocessedData();
const moodStream = await fetch("/api/moods/current").then(r => r.json());
const userPreferences = await getUserPreferences();

// 2. 컨텍스트 계산
const timeOfDay = new Date().getHours();
const season = inferSeason(new Date().getMonth() + 1);

// 3. 감정 이벤트 보장
const emotionEvents = ensureEmotionEvents(preprocessed.emotionEvents);

// 4. 최종 Input 조합
const llmInput = {
  moodName: moodStream.currentMood.name,
  musicGenre: moodStream.currentMood.music.genre,
  scentType: moodStream.currentMood.scent.type,
  preprocessed: {
    ...preprocessed,
    emotionEvents: emotionEvents,
  },
  userPreferences: userPreferences,
  timeOfDay: timeOfDay,
  currentCluster: moodStream.currentMood.cluster,
  userDataCount: moodStream.userDataCount,
  season: season,
};

// 5. LLM API 호출
const response = await fetch("/api/ai/background-params", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(llmInput),
});
```

---

## ✅ 체크리스트

### 필수 파라미터
- [ ] `moodName`: GET /api/moods/current → currentMood.name
- [ ] `musicGenre`: GET /api/moods/current → currentMood.music.genre
- [ ] `scentType`: GET /api/moods/current → currentMood.scent.type
- [ ] `preprocessed`: GET /api/preprocessing (204 시 기본값 사용)
- [ ] `userPreferences`: 로컬 저장소/DB

### 선택적 파라미터
- [ ] `timeOfDay`: new Date().getHours()
- [ ] `currentCluster`: GET /api/moods/current → currentMood.cluster
- [ ] `userDataCount`: GET /api/moods/current → userDataCount
- [ ] `previousMood`: 로컬 상태
- [ ] `season`: 월 기반 계산

### 가공 필수
- [ ] 전처리 데이터 204 응답 시 기본값 사용
- [ ] 감정 이벤트 NULL 체크 및 기본값 설정 (neutral)
- [ ] 계절 계산 (월 기반)

---

이 문서는 프론트엔드에서 LLM Input을 생성할 때 참고하는 가이드입니다.

