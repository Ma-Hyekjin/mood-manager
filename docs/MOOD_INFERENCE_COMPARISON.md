# 무드 추론 방법 비교 및 최종 구조

## 세 가지 접근법 비교

### 방법 1: 패턴 매칭 (기존 발상)

**핵심 아이디어:**
```
현재 생체데이터
    ↓
어제의 현재 시간 근처 탐색
    ↓
현재 감정과 동일한 시점 찾기
    ↓
그 시점 이후 30분 감정 변동 패턴 추출
    ↓
30분 무드스트림 생성
```

**구현 로직:**
```typescript
function generateMoodStream(
  currentBiometric: BiometricData,
  currentEmotion: EmotionState,
  yesterdayData: BiometricHistory[]
): MoodStream[] {
  // 1. 어제의 현재 시간 근처 탐색 (±2시간)
  const timeWindow = 2 * 60 * 60 * 1000; // 2시간
  const now = Date.now();
  const yesterdaySameTime = now - 24 * 60 * 60 * 1000;
  
  const candidates = yesterdayData.filter(entry => {
    const timeDiff = Math.abs(entry.timestamp - yesterdaySameTime);
    return timeDiff < timeWindow;
  });
  
  // 2. 현재 감정과 동일한 시점 찾기
  const matchedEntry = candidates.find(entry => 
    entry.emotion === currentEmotion
  );
  
  if (!matchedEntry) {
    // 매칭 실패 시 기본 무드 반환
    return generateDefaultStream();
  }
  
  // 3. 그 시점 이후 30분 패턴 추출
  const startTime = matchedEntry.timestamp;
  const endTime = startTime + 30 * 60 * 1000;
  
  const pattern = yesterdayData
    .filter(entry => entry.timestamp >= startTime && entry.timestamp <= endTime)
    .map(entry => entry.mood);
  
  // 4. 30분 무드스트림 생성
  return pattern.map((mood, index) => ({
    timestamp: now + index * 60 * 1000,
    mood: mood,
  }));
}
```

**장점:**
- ✅ 직관적이고 해석 가능
- ✅ 개인화 (사용자별 실제 경험)
- ✅ 자연스러운 흐름 (실제 과거 패턴)
- ✅ 구현 단순

**단점:**
- ❌ 콜드스타트 문제 (과거 데이터 없음)
- ❌ 어긋남 처리 복잡 (과거-과거 vs 현재-과거)
- ❌ 기술력 부족으로 보일 수 있음

---

### 방법 2: 시계열 분석 + 마르코프 체인 (추천받은 구조)

**핵심 아이디어:**
```
생체신호 시계열 데이터
    ↓
시계열 모델 (ARIMA/LSTM) → 추세 분석
    ↓
마르코프 체인 → 무드 전환 확률 학습
    ↓
30분 무드스트림 예측
```

**구현 로직:**
```typescript
function generateMoodStreamWithTimeSeries(
  biometricHistory: BiometricData[],
  currentMood: Mood
): MoodStream[] {
  // 1. 시계열 분석 (추세 파악)
  const trend = analyzeTimeSeries(biometricHistory);
  // { direction: 'decreasing', volatility: 'high', periodicity: 'afternoon_fatigue' }
  
  // 2. 마르코프 체인 (전환 확률 학습)
  const transitionMatrix = buildMarkovChain(biometricHistory);
  // { 'calm': { 'focus': 0.3, 'relax': 0.5, 'energy': 0.2 }, ... }
  
  // 3. 30분 스트림 예측
  const stream: MoodStream[] = [];
  let current = currentMood;
  
  for (let i = 0; i < 30; i++) {
    // 시계열 추세 반영
    const trendAdjusted = adjustByTrend(current, trend);
    
    // 마르코프 체인으로 다음 무드 예측
    const nextMood = predictNextMood(trendAdjusted, transitionMatrix);
    
    stream.push({
      timestamp: Date.now() + i * 60 * 1000,
      mood: nextMood,
    });
    
    current = nextMood;
  }
  
  return stream;
}
```

**장점:**
- ✅ 시간적 패턴 학습 (추세 분석)
- ✅ 자연스러운 전환 (마르코프 체인)
- ✅ 기술적 깊이 (시계열 + 확률 모델)

**단점:**
- ❌ 구현 복잡 (시계열 모델 학습 필요)
- ❌ 해석 어려움 (블랙박스)
- ❌ 콜드스타트 문제 (학습 데이터 필요)
- ❌ 프로젝트 규모에 비해 과함

---

### 방법 3: 통계적 패턴 매칭 (새로운 제안)

**핵심 아이디어:**
```
패턴 매칭으로 무드 결정
    ↓
통계적 방법으로 세부 속성 매칭
    ↓
30분 무드스트림 생성
```

**구현 로직:**
```typescript
function generateMoodStreamWithStatistics(
  currentBiometric: BiometricData,
  history: MoodHistory[]
): MoodStream[] {
  // 1. 패턴 매칭으로 무드 결정 (기존 방식)
  const matchedPattern = findSimilarPattern(currentBiometric, history);
  const baseMood = matchedPattern.mood;
  
  // 2. 통계적 방법으로 세부 속성 매칭
  const attributes = matchAttributesWithStatistics(
    baseMood,
    history,
    currentContext
  );
  
  // 3. 30분 스트림 생성
  const stream: MoodStream[] = [];
  
  for (let i = 0; i < 30; i++) {
    // 무드는 패턴 매칭 기반
    const mood = predictMoodFromPattern(matchedPattern, i);
    
    // 세부 속성은 통계적 방법
    const attributes = matchAttributesWithStatistics(
      mood,
      history,
      currentContext
    );
    
    stream.push({
      timestamp: Date.now() + i * 60 * 1000,
      mood: {
        ...mood,
        scent: attributes.scent,
        song: attributes.music,
        color: attributes.lighting.color,
      },
    });
  }
  
  return stream;
}

/**
 * 통계적 속성 매칭
 */
function matchAttributesWithStatistics(
  mood: Mood,
  history: MoodHistory[],
  context: Context
): { scent: Scent; music: Music; lighting: Lighting } {
  // 1. 해당 무드의 속성 패턴 추출
  const patterns = extractPatterns(history, mood);
  
  // 2. 가중치 기반 점수 계산
  const scored = patterns.map(pattern => ({
    pattern,
    score:
      pattern.frequency * 0.4 +           // 빈도
      pattern.effectiveness * 0.3 +       // 효과성
      timeMatch(pattern, context) * 0.15 + // 시간대
      weatherMatch(pattern, context) * 0.1 + // 날씨
      preferenceMatch(pattern, context) * 0.05 // 선호도
  }));
  
  // 3. 상위 N개 선택
  const top5 = scored.sort((a, b) => b.score - a.score).slice(0, 5);
  
  // 4. 가중 랜덤 선택
  const selected = weightedRandom(top5);
  
  // 5. 약간의 변형 적용
  return applyVariation(selected.pattern, mood);
}
```

**장점:**
- ✅ 패턴 매칭의 직관성 유지
- ✅ 통계적 방법으로 세부 속성 매칭
- ✅ 해석 가능
- ✅ 현실적 (학생 프로젝트 자원 내)

**단점:**
- ❌ 콜드스타트 문제 (과거 데이터 필요)
- ❌ 기술력 부족으로 보일 수 있음

---

## 🎯 최종 권장 구조

### 하이브리드 접근법

**"패턴 매칭 + 통계적 방법 + 점진적 학습"**

```
[생체신호]
    ↓
┌─────────────────────────────────────┐
│  [과거 데이터 체크]                  │
│  Yes → 패턴 매칭                     │
│  No → 기본 무드 (설문 기반)           │
└─────────────────────────────────────┘
        ↓
[무드 결정]
        ↓
┌─────────────────────────────────────┐
│  [통계적 속성 매칭]                   │
│  빈도 + 효과성 + 컨텍스트             │
└─────────────────────────────────────┘
        ↓
[30분 무드스트림 생성]
        ↓
[피드백 수집] ← 점진적 학습
        ↓
[개인화 개선]
```

---

## 📋 구현 세부사항

### 1. 패턴 매칭 (무드 결정)

```typescript
/**
 * 패턴 매칭으로 무드 결정
 */
function findSimilarPattern(
  current: BiometricData,
  history: BiometricHistory[]
): PatternMatch {
  // 1. 어제의 현재 시간 근처 탐색
  const yesterdaySameTime = Date.now() - 24 * 60 * 60 * 1000;
  const timeWindow = 2 * 60 * 60 * 1000; // ±2시간
  
  const candidates = history.filter(entry => {
    const timeDiff = Math.abs(entry.timestamp - yesterdaySameTime);
    return timeDiff < timeWindow;
  });
  
  // 2. 현재 감정과 동일한 시점 찾기
  const currentEmotion = inferEmotion(current);
  const matched = candidates.find(entry => 
    entry.emotion === currentEmotion
  );
  
  if (!matched) {
    // 매칭 실패 시 유사도 기반 선택
    return findMostSimilar(current, candidates);
  }
  
  return {
    matchedTimestamp: matched.timestamp,
    similarity: 1.0,
    mood: matched.mood,
  };
}
```

### 2. 통계적 속성 매칭

```typescript
/**
 * 통계적 방법으로 세부 속성 매칭
 */
function matchAttributes(
  mood: Mood,
  history: MoodHistory[],
  context: Context
): { scent: Scent; music: Music; lighting: Lighting } {
  // 1. 해당 무드의 속성 패턴 추출
  const patterns = history
    .filter(h => h.mood.id === mood.id)
    .map(h => ({
      scent: h.scent,
      music: h.music,
      lighting: h.lighting,
      frequency: 1,
      effectiveness: h.effectiveness || 0.5,
    }));
  
  // 2. 빈도 계산
  const frequencyMap = new Map();
  patterns.forEach(p => {
    const key = `${p.scent.type}-${p.music.genre}-${p.lighting.color}`;
    frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
  });
  
  // 3. 점수 계산
  const scored = Array.from(frequencyMap.entries()).map(([key, freq]) => {
    const pattern = patterns.find(p => 
      `${p.scent.type}-${p.music.genre}-${p.lighting.color}` === key
    );
    
    return {
      pattern: pattern!,
      score: freq * 0.4 + pattern!.effectiveness * 0.6,
    };
  });
  
  // 4. 상위 5개 선택
  const top5 = scored.sort((a, b) => b.score - a.score).slice(0, 5);
  
  // 5. 가중 랜덤 선택
  const selected = weightedRandom(top5);
  
  // 6. 약간의 변형 적용
  return applyVariation(selected.pattern, mood);
}
```

### 3. 콜드스타트 처리

```typescript
/**
 * 콜드스타트 처리
 */
function handleColdStart(
  currentBiometric: BiometricData,
  survey: OnboardingSurvey | null
): MoodStream {
  // 1. 설문 데이터가 있으면 사용
  if (survey) {
    return generateFromSurvey(currentBiometric, survey);
  }
  
  // 2. 기본 무드 사용 (간단한 규칙)
  const emotion = inferEmotion(currentBiometric);
  const defaultMood = getDefaultMoodForEmotion(emotion);
  
  return {
    mood: defaultMood,
    scent: defaultMood.scent,
    music: defaultMood.song,
    lighting: { color: defaultMood.color },
  };
}
```

---

## 🔄 세 가지 방법 통합

### 최종 파이프라인

```typescript
function generateMoodStream(
  currentBiometric: BiometricData,
  history: MoodHistory[],
  survey: OnboardingSurvey | null
): MoodStream[] {
  // 1. 과거 데이터 체크
  if (history.length === 0) {
    // 콜드스타트: 기본 무드 사용
    return handleColdStart(currentBiometric, survey);
  }
  
  // 2. 패턴 매칭으로 무드 결정
  const matchedPattern = findSimilarPattern(currentBiometric, history);
  
  // 3. 그 시점 이후 30분 패턴 추출
  const pattern = extract30MinutePattern(matchedPattern, history);
  
  // 4. 각 무드에 대해 통계적 속성 매칭
  const stream = pattern.map((mood, index) => {
    const attributes = matchAttributes(mood, history, currentContext);
    
    return {
      timestamp: Date.now() + index * 60 * 1000,
      mood: {
        ...mood,
        scent: attributes.scent,
        song: attributes.music,
        color: attributes.lighting.color,
      },
    };
  });
  
  return stream;
}
```

---

## 📊 비교 요약

| 측면 | 패턴 매칭 | 시계열+마르코프 | 통계적 매칭 |
|------|----------|----------------|------------|
| **무드 결정** | 패턴 매칭 | 시계열 + 마르코프 | 패턴 매칭 |
| **속성 매칭** | 랜덤 | 경우의 수 곱하기 | 통계적 방법 |
| **구현 복잡도** | 낮음 | 높음 | 중간 |
| **해석 가능성** | 높음 | 낮음 | 높음 |
| **기술적 깊이** | 낮음 | 높음 | 중간 |
| **콜드스타트** | 어려움 | 어려움 | 어려움 |
| **개인화** | 높음 | 중간 | 높음 |

---

## 최종 권장 구조

**권장 구조(요약):**
- 패턴 매칭으로 무드 결정 (기존 발상 유지)
- 통계적 방법으로 세부 속성 매칭 (새로운 개선)
- 점진적 학습으로 개인화 (피드백 수집)

**선택 근거:**
1. 패턴 매칭의 직관성과 해석 가능성 유지
2. 통계적 방법으로 세부 속성 일관성 확보
3. 학생 프로젝트 자원 내에서 구현 가능
4. 피드백을 활용한 점진적 개선 여지 확보

**콜드스타트 대응:**
- 설문 데이터 활용
- 기본 무드 사용
- 피드백 수집으로 점진적 개선

