# 무드스트림 아키텍처

## 핵심 개념

### 무드스트림 생성 과정

**핵심: 하나의 무드스트림 내에서는 동일한 무드를 기반으로 함**

```
[1분 단위 예측값]
VP, VPP, VPPP, VP, VPP, ... (30개, 30분치)
    ↓
[첫 번째 세그먼트로 대표 무드 결정]
"Deep Relax" (전체 스트림의 대표 무드)
    ↓
[3분 단위 분절]
10개 세그먼트 모두 동일한 무드 사용
    ↓
[각 세그먼트에 음악/향 설정]
세그먼트 1: { 무드: "Deep Relax", 음악장르: "newage", 향: "citrus" }
세그먼트 2: { 무드: "Deep Relax", 음악장르: "ambient", 향: "marine" }
세그먼트 3: { 무드: "Deep Relax", 음악장르: "classical", 향: "woody" }
... (모두 동일한 무드 "Deep Relax")
    ↓
[LLM으로 나머지 정보 추가]
세그먼트 1: {
  무드이름: "Deep Relax",
  무드별명: "겨울비의 평온",  ← LLM 생성
  음악: "Ambient Rain Meditation",  ← LLM 생성
  향: "citrus",
  무드컬러: "#6B8E9F",  ← LLM 생성
  조명: { rgb: [...], brightness: ... },  ← LLM 생성
  아이콘: "FaCloudRain",  ← LLM 생성
  ...
}
```

---

## 데이터 구조

### 1분 단위 예측값 (백엔드에서 생성)

```typescript
interface OneMinutePrediction {
  timestamp: number;
  prediction: "VP" | "VPP" | "VPPP"; // 예측값
}
```

### 3분 단위 세그먼트 (프론트엔드에서 분절)

```typescript
interface MoodStreamSegment {
  id: string;
  timestamp: number;
  duration: number; // 3분 (180000ms)
  
  // 백엔드에서 설정된 정보
  moodName: string; // "Deep Relax"
  musicGenre: string; // "newage"
  scentType: string; // "citrus"
  
  // LLM으로 생성된 정보
  moodAlias?: string; // "겨울비의 평온"
  musicSelection?: string; // "Ambient Rain Meditation"
  moodColor?: string; // "#6B8E9F"
  lighting?: { rgb: [number, number, number], brightness: number };
  backgroundIcon?: { name: string, category: string };
  // ...
}
```

---

## 처리 흐름

### Step 1: 백엔드에서 1분 단위 예측값 받기

```
POST /api/moods/current/generate
→ 1분 단위 예측값 배열 (30개, 30분치)
→ 3분 단위로 분절하여 10개 세그먼트 반환
```

### Step 2: 3분 단위로 분절

**핵심: 하나의 무드스트림 내에서는 동일한 무드를 기반으로 함**

```typescript
// 1분 단위 예측값을 3분 단위로 묶기
// 첫 번째 세그먼트의 무드를 결정 (전체 스트림의 대표 무드)
const firstThreeMinutePredictions = predictions.slice(0, 3);
const firstDominantPrediction = getDominantPrediction(firstThreeMinutePredictions);

// 전체 스트림의 대표 무드 결정 (10개 세그먼트 모두 동일한 무드 사용)
const streamMoodName = mapPredictionToMood(firstDominantPrediction);
const baseMood = MOODS.find(m => m.name === streamMoodName) || MOODS[0];

const segments = [];
for (let i = 0; i < predictions.length; i += 3) {
  const threeMinutePredictions = predictions.slice(i, i + 3);
  
  // 3분 동안의 예측값을 기반으로 음악 장르/향 결정 (무드는 동일)
  const dominantPrediction = getDominantPrediction(threeMinutePredictions);
  const musicGenre = mapPredictionToGenre(dominantPrediction);
  const scentType = mapPredictionToScent(dominantPrediction);
  
  segments.push({
    id: `segment-${Date.now()}-${i}`,
    timestamp: predictions[i].timestamp,
    duration: 3 * 60 * 1000, // 3분
    moodName: streamMoodName, // 동일한 무드 사용
    musicGenre, // 세그먼트별로 다양할 수 있음
    scentType, // 세그먼트별로 다양할 수 있음
  });
}
```

### Step 3: LLM으로 나머지 정보 추가

```typescript
// 10개 세그먼트 전체를 LLM에 전달
const llmResponse = await callLLM({
  segments: segments, // 10개 세그먼트 정보
  preprocessed: preprocessedData,
  userPreferences: userPreferences,
});

// 각 세그먼트에 LLM 정보 추가
segments.forEach((segment, index) => {
  segment.moodAlias = llmResponse.moodAlias;
  segment.musicSelection = llmResponse.musicSelection;
  segment.moodColor = llmResponse.moodColor;
  segment.lighting = llmResponse.lighting;
  segment.backgroundIcon = llmResponse.backgroundIcon;
  // ...
});
```

### Step 4: 예약 설정 및 자동 재생성

```typescript
// 각 세그먼트를 예약
segments.forEach((segment) => {
  moodStreamScheduler.appendSegments([segment]);
});

// 주기적 확인: 예약된 세그먼트가 3개 이하가 되면 재생성
setInterval(() => {
  if (moodStreamScheduler.shouldRegenerate()) {
    const nextStartTime = moodStreamScheduler.getNextSegmentStartTime();
    generateMoodStream(nextStartTime); // 10개 세그먼트 재생성
  }
}, 60 * 1000); // 1분마다 확인
```

---

## LLM의 역할

### Input (무드스트림에서 받은 정보)
- 10개 세그먼트 정보: 무드 이름, 음악 장르, 향 종류
- 전처리된 데이터: 스트레스, 수면, 날씨, 감정
- 사용자 선호도: 음악, 색상, 향 선호도

### Output (LLM이 추가하는 정보, 영어)
- 무드 별명: "Calm Winter Rain" (2-4 단어 영어)
- 음악 선곡: "Ambient Rain Meditation" (영어 트랙명/스타일)
- 무드 컬러: "#6B8E9F"
- 조명: { rgb: [...], brightness: ... }
- 배경 아이콘: "FaCloudRain"
- 풍향/풍속: ...
- 애니메이션 속도: ...

---

## 자동 재생성 로직

### 예약된 세그먼트 관리

```typescript
class MoodStreamScheduler {
  private scheduledSegments: ScheduledMoodSegment[] = [];
  private minSegments = 3; // 최소 유지 개수
  private segmentCount = 10; // 한 번에 생성할 세그먼트 개수

  // 예약된 세그먼트가 3개 이하가 되면 재생성 필요
  shouldRegenerate(): boolean {
    const remaining = this.getScheduledSegments().length;
    return remaining <= this.minSegments;
  }

  // 새로운 세그먼트를 뒤로 붙임
  appendSegments(segments: ScheduledMoodSegment[]): void {
    this.scheduledSegments = [...this.scheduledSegments, ...segments]
      .sort((a, b) => a.timestamp - b.timestamp);
  }
}
```

### 재생성 흐름

```
[현재 시간]
    ↓
[예약된 세그먼트 확인]
    ↓
[3개 이하?]
    ↓ YES
[POST /api/moods/current/generate]
→ 10개 세그먼트 생성
    ↓
[POST /api/ai/background-params]
→ LLM 정보 추가
    ↓
[스케줄러에 추가 (뒤로 붙음)]
→ 총 13개 세그먼트 대기 (3개 + 10개)
```

---

## 정리

1. **1분 단위 예측값**: 백엔드에서 생성 (VP, VPP, VPPP 등)
2. **3분 단위 분절**: 프론트엔드에서 묶기 (음악 길이 기준)
3. **10개 세그먼트**: 한 번에 생성 (약 30분치)
4. **LLM 정보 추가**: 10개 세그먼트 전체에 대한 배경 파라미터 생성
5. **자동 재생성**: 예약된 세그먼트가 3개 이하가 되면 자동으로 재생성
6. **끊김 없는 재생**: 항상 3개 이상의 세그먼트가 대기 상태 유지

**핵심:**
- 무드스트림은 30분 고정이 아님
- 1분 단위 예측값을 3분 단위로 묶는 개념
- **하나의 무드스트림 내에서는 동일한 무드를 기반으로 함** (음악 장르와 향은 세그먼트별로 다양할 수 있음)
- LLM은 10개 세그먼트 전체에 대한 정보를 한 번에 생성
- 예약된 세그먼트가 3개 이하가 되면 자동으로 재생성하여 끊김 없이 유지
