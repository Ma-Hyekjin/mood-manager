# 최종 무드 추론 아키텍처

## 프로젝트 목적

**"사용자의 기분에 맞춰 정서적인 안정과 긍정적인 부분을 독려"**

이 목적에 맞는 구조 설계가 핵심입니다.

---

## 🏗️ 최종 구조

### 전체 파이프라인

```
[생체신호 + 음성 이벤트 + 날씨]
        ↓
[감정 상태 추론] ← 클러스터 분류 (-, 0, +)
        ↓
┌─────────────────────────────────────┐
│  [과거 데이터 체크]                  │
│  Yes → 패턴 매칭 + 마르코프 체인     │
│  No → 기본 무드 (0, + 클러스터)     │
└─────────────────────────────────────┘
        ↓
[무드 결정 + 전환 패턴 학습]
        ↓
┌─────────────────────────────────────┐
│  [시계열 추세 분석] (선택적)         │
│  간단한 추세 분석으로 보정            │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  [우선순위 기반 속성 매칭]            │
│  규칙 기반 우선순위 시스템            │
└─────────────────────────────────────┘
        ↓
[30분 무드스트림 생성]
```

---

## 단계별 상세 설명

### Step 1: 감정 상태 추론 (클러스터 분류)

```typescript
/**
 * 생체신호로 감정 상태 추론
 * - 클러스터 분류: -, 0, +
 */
function inferEmotionCluster(
  biometric: BiometricData,
  audioEvents: AudioEvent[]
): EmotionCluster {
  // 생체신호 기반 추론
  let stressScore = 0;
  
  if (biometric.stress > 70) stressScore += 2;
  else if (biometric.stress > 50) stressScore += 1;
  
  if (biometric.hrv < 50) stressScore += 2;
  else if (biometric.hrv < 60) stressScore += 1;
  
  // 음성 이벤트 기반 추론
  const sighCount = audioEvents.filter(e => e.type === 'sigh').length;
  const laughterCount = audioEvents.filter(e => e.type === 'laughter').length;
  
  if (sighCount > 2) stressScore += 1;
  if (laughterCount > 2) stressScore -= 1;
  
  // 클러스터 결정
  if (stressScore >= 4) {
    return '-'; // 부정 클러스터 (우울, 분노, 슬픔)
  } else if (stressScore <= 1) {
    return '+'; // 긍정 클러스터 (기쁨, 즐거움)
  } else {
    return '0'; // 중립 클러스터 (안정, 평온)
  }
}
```

**근거:**
- 생체신호 해석: 의학 연구 기반
- 프로젝트 목적: 정서적 안정과 긍정적 독려

---

### Step 2: 패턴 매칭 + 마르코프 체인 (과거 데이터 있음)

**핵심 아이디어:**
- 패턴 매칭으로 시작 무드 결정 (직관적, 해석 가능)
- 마르코프 체인으로 전환 패턴 학습 및 예측 (기술적 가치)

```typescript
/**
 * 패턴 매칭으로 시작 무드 결정
 */
function findSimilarPattern(
  currentBiometric: BiometricData,
  currentCluster: EmotionCluster,
  history: BiometricHistory[]
): PatternMatch | null {
  // 1. 어제의 현재 시간 근처 탐색 (±2시간)
  const yesterdaySameTime = Date.now() - 24 * 60 * 60 * 1000;
  const timeWindow = 2 * 60 * 60 * 1000;
  
  const candidates = history.filter(entry => {
    const timeDiff = Math.abs(entry.timestamp - yesterdaySameTime);
    return timeDiff < timeWindow;
  });
  
  // 2. 현재 클러스터와 동일한 시점 찾기
  const exactMatch = candidates.find(entry => 
    entry.cluster === currentCluster
  );
  
  if (exactMatch) {
    return {
      matchedTimestamp: exactMatch.timestamp,
      similarity: 1.0,
      mood: exactMatch.mood,
      cluster: exactMatch.cluster,
    };
  }
  
  // 3. 동일 시점을 못 찾으면 유사도 기반 선택
  return findMostSimilar(currentBiometric, currentCluster, candidates);
}

/**
 * 마르코프 체인으로 전환 패턴 학습
 */
class MarkovChainModel {
  private transitionMatrix: Map<string, Map<string, number>>;
  
  /**
   * 과거 데이터로 전환 확률 학습
   */
  train(history: MoodHistory[]): void {
    this.transitionMatrix = new Map();
    
    // 무드 시퀀스 추출
    const sequences = this.extractSequences(history);
    
    // 전환 횟수 계산
    sequences.forEach(sequence => {
      for (let i = 0; i < sequence.length - 1; i++) {
        const from = sequence[i].mood.id;
        const to = sequence[i + 1].mood.id;
        
        if (!this.transitionMatrix.has(from)) {
          this.transitionMatrix.set(from, new Map());
        }
        
        const transitions = this.transitionMatrix.get(from)!;
        transitions.set(to, (transitions.get(to) || 0) + 1);
      }
    });
    
    // 확률로 변환
    this.normalizeProbabilities();
  }
  
  /**
   * 다음 무드 예측
   */
  predictNext(currentMood: Mood): Mood | null {
    const transitions = this.transitionMatrix.get(currentMood.id);
    
    if (!transitions || transitions.size === 0) {
      return null; // 전환 패턴이 없으면 null
    }
    
    // 확률 기반 선택
    const total = Array.from(transitions.values()).reduce((sum, count) => sum + count, 0);
    let random = Math.random() * total;
    
    for (const [nextMoodId, count] of transitions.entries()) {
      random -= count;
      if (random <= 0) {
        return this.getMoodById(nextMoodId);
      }
    }
    
    return null;
  }
  
  /**
   * 전환 확률 정규화
   */
  private normalizeProbabilities(): void {
    for (const [from, transitions] of this.transitionMatrix.entries()) {
      const total = Array.from(transitions.values()).reduce((sum, count) => sum + count, 0);
      
      for (const [to, count] of transitions.entries()) {
        transitions.set(to, count / total);
      }
    }
  }
  
  /**
   * 무드 시퀀스 추출
   */
  private extractSequences(history: MoodHistory[]): Mood[][] {
    // 시간순 정렬
    const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
    
    // 연속된 무드 시퀀스 추출
    const sequences: Mood[][] = [];
    let currentSequence: Mood[] = [];
    
    for (let i = 0; i < sorted.length; i++) {
      const entry = sorted[i];
      
      if (currentSequence.length === 0) {
        currentSequence.push(entry.mood);
      } else {
        const lastMood = currentSequence[currentSequence.length - 1];
        const timeDiff = entry.timestamp - sorted[i - 1].timestamp;
        
        // 30분 이내면 같은 시퀀스
        if (timeDiff < 30 * 60 * 1000) {
          currentSequence.push(entry.mood);
        } else {
          // 새로운 시퀀스 시작
          if (currentSequence.length > 1) {
            sequences.push(currentSequence);
          }
          currentSequence = [entry.mood];
        }
      }
    }
    
    if (currentSequence.length > 1) {
      sequences.push(currentSequence);
    }
    
    return sequences;
  }
}
```

**기술적 가치:**
- ✅ 마르코프 체인: 전통적이지만 강력한 ML 알고리즘
- ✅ 전환 패턴 학습: 데이터 기반 확률 모델
- ✅ 자연스러운 흐름: 확률 기반 예측

---

### Step 3: 시계열 추세 분석 (선택적, 간단한 버전)

**핵심 아이디어:**
- 복잡한 시계열 모델 대신 간단한 추세 분석
- 패턴 매칭과 마르코프 체인 결과를 보정

```typescript
/**
 * 간단한 시계열 추세 분석
 * - 복잡한 ARIMA/LSTM 대신 이동평균 기반 추세
 */
class SimpleTimeSeriesAnalyzer {
  /**
   * 생체신호 추세 분석
   */
  analyzeTrend(
    biometricHistory: BiometricData[],
    windowSize: number = 10
  ): TrendAnalysis {
    if (biometricHistory.length < windowSize) {
      return { direction: 'stable', volatility: 'low' };
    }
    
    // 최근 N개 데이터의 이동평균
    const recent = biometricHistory.slice(-windowSize);
    const avgStress = recent.reduce((sum, d) => sum + d.stress, 0) / recent.length;
    const avgHRV = recent.reduce((sum, d) => sum + d.hrv, 0) / recent.length;
    
    // 이전 N개 데이터의 이동평균
    const previous = biometricHistory.slice(-windowSize * 2, -windowSize);
    const prevAvgStress = previous.reduce((sum, d) => sum + d.stress, 0) / previous.length;
    const prevAvgHRV = previous.reduce((sum, d) => sum + d.hrv, 0) / previous.length;
    
    // 추세 방향
    const stressDiff = avgStress - prevAvgStress;
    const hrvDiff = avgHRV - prevAvgHRV;
    
    let direction: 'improving' | 'worsening' | 'stable' = 'stable';
    if (stressDiff < -5 && hrvDiff > 5) {
      direction = 'improving'; // 스트레스 감소, HRV 증가
    } else if (stressDiff > 5 && hrvDiff < -5) {
      direction = 'worsening'; // 스트레스 증가, HRV 감소
    }
    
    // 변동성 계산
    const stressStd = this.calculateStdDev(recent.map(d => d.stress));
    const volatility: 'low' | 'medium' | 'high' = 
      stressStd < 10 ? 'low' : stressStd < 20 ? 'medium' : 'high';
    
    return { direction, volatility };
  }
  
  /**
   * 표준편차 계산
   */
  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
  
  /**
   * 추세에 따른 무드 조정
   */
  adjustMoodByTrend(
    baseMood: Mood,
    trend: TrendAnalysis
  ): Mood {
    // 추세가 개선 중이면 더 긍정적인 무드로
    if (trend.direction === 'improving') {
      return this.shiftToPositive(baseMood);
    }
    
    // 추세가 악화 중이면 더 안정적인 무드로
    if (trend.direction === 'worsening') {
      return this.shiftToStable(baseMood);
    }
    
    // 안정적이면 그대로
    return baseMood;
  }
  
  private shiftToPositive(mood: Mood): Mood {
    // 현재 무드보다 더 긍정적인 무드로 전환
    // 예: Calm → Energy, Focus → Relax
    const positiveShift: Record<string, string> = {
      'calm': 'energy',
      'focus': 'relax',
      'relax': 'energy',
    };
    
    const shiftedId = positiveShift[mood.id.split('-')[0]];
    if (shiftedId) {
      return this.getMoodById(`${shiftedId}-1`);
    }
    
    return mood;
  }
  
  private shiftToStable(mood: Mood): Mood {
    // 현재 무드보다 더 안정적인 무드로 전환
    // 예: Energy → Calm, Relax → Focus
    const stableShift: Record<string, string> = {
      'energy': 'calm',
      'relax': 'focus',
      'focus': 'calm',
    };
    
    const shiftedId = stableShift[mood.id.split('-')[0]];
    if (shiftedId) {
      return this.getMoodById(`${shiftedId}-1`);
    }
    
    return mood;
  }
}
```

**기술적 가치:**
- ✅ 시계열 분석: AI/ML의 핵심 기술
- ✅ 간단한 구현: 복잡한 모델 없이도 효과적
- ✅ 추세 반영: 시간적 패턴 학습

---

### Step 4: 콜드스타트 처리 (과거 데이터 없음)

```typescript
/**
 * 콜드스타트 처리
 * - 프로젝트 목적: 정서적 안정과 긍정적 독려
 * - 0, + 클러스터 무드들을 기본값으로 설정
 * - 등장 확률 균등분배
 */
function handleColdStart(
  currentCluster: EmotionCluster
): MoodStream[] {
  // 1. 클러스터에 맞는 기본 무드 풀 정의
  const defaultMoods = getDefaultMoodsForCluster(currentCluster);
  
  // 2. 30분 스트림 생성 (균등분배)
  const stream: MoodStream[] = [];
  const moodsPerMinute = 1; // 1분당 1개 무드
  const totalMinutes = 30;
  
  for (let i = 0; i < totalMinutes; i++) {
    // 균등분배: 순환 선택
    const moodIndex = i % defaultMoods.length;
    const baseMood = defaultMoods[moodIndex];
    
    // 약간의 변형 적용 (동일하지 않게)
    const mood = applyVariation(baseMood);
    
    stream.push({
      timestamp: Date.now() + i * 60 * 1000,
      mood: mood,
    });
  }
  
  return stream;
}

/**
 * 클러스터별 기본 무드 풀
 */
function getDefaultMoodsForCluster(
  cluster: EmotionCluster
): Mood[] {
  // 프로젝트 목적: 정서적 안정과 긍정적 독려
  // 따라서 -, 0, + 모두 0, + 클러스터 무드 사용
  
  const positiveMoods = [
    // 0 클러스터 (안정, 평온)
    { id: "calm-1", name: "Calm Breeze", cluster: "0" },
    { id: "calm-2", name: "Calm Breeze", cluster: "0" },
    { id: "focus-1", name: "Deep Focus", cluster: "0" },
    
    // + 클러스터 (기쁨, 즐거움)
    { id: "energy-1", name: "Morning Energy", cluster: "+" },
    { id: "energy-2", name: "Morning Energy", cluster: "+" },
    { id: "relax-1", name: "Evening Relax", cluster: "+" },
  ];
  
  // 클러스터에 따라 가중치 조정
  if (cluster === '-') {
    // 부정 클러스터 → 0 클러스터 무드 우선 (안정 추구)
    return positiveMoods.filter(m => m.cluster === '0');
  } else if (cluster === '0') {
    // 중립 클러스터 → 0, + 클러스터 혼합
    return positiveMoods;
  } else {
    // 긍정 클러스터 → + 클러스터 우선
    return positiveMoods.filter(m => m.cluster === '+');
  }
}
```

**근거:**
- ✅ 프로젝트 목적: 정서적 안정과 긍정적 독려
- ✅ 부정 클러스터(-) → 중립 클러스터(0) 무드로 안정 추구
- ✅ 중립/긍정 클러스터 → 긍정적 무드로 독려
- ✅ 등장 확률 균등분배로 다양성 확보

---

### Step 5: 우선순위 기반 속성 매칭

```typescript
/**
 * 우선순위 기반 속성 매칭
 * - 가중치가 아닌 규칙 기반 우선순위
 * - 각 조건의 근거 명확
 */
function matchAttributes(
  mood: Mood,
  history: MoodHistory[],
  context: Context
): { scent: Scent; music: Music; lighting: Lighting } {
  // 1. 해당 무드의 속성 패턴 추출
  const patterns = extractPatterns(history, mood);
  
  if (patterns.length === 0) {
    // 패턴이 없으면 기본값 반환
    return getDefaultAttributes(mood);
  }
  
  // 2. 우선순위 기반 필터링
  const filtered = filterByPriority(patterns, context);
  
  if (filtered.length === 0) {
    // 필터링 후 패턴이 없으면 전체에서 선택
    return selectFromPatterns(patterns);
  }
  
  // 3. 우선순위 높은 패턴 중에서 선택
  return selectFromPatterns(filtered);
}

/**
 * 우선순위 기반 필터링
 */
function filterByPriority(
  patterns: AttributePattern[],
  context: Context
): AttributePattern[] {
  // 우선순위 1: 효과성 검증된 패턴
  const effectivenessThreshold = 0.7;
  const highEffectivenessPatterns = patterns.filter(
    p => p.effectiveness >= effectivenessThreshold
  );
  
  if (highEffectivenessPatterns.length > 0) {
    patterns = highEffectivenessPatterns;
  }
  
  // 우선순위 2: 빈도 검증된 패턴
  const avgFrequency = patterns.reduce((sum, p) => sum + p.frequency, 0) / patterns.length;
  const highFrequencyPatterns = patterns.filter(
    p => p.frequency >= avgFrequency * 1.5
  );
  
  if (highFrequencyPatterns.length > 0 && patterns.length > 3) {
    patterns = highFrequencyPatterns;
  }
  
  return patterns;
}

/**
 * 패턴 선택
 */
function selectFromPatterns(
  patterns: AttributePattern[]
): { scent: Scent; music: Music; lighting: Lighting } {
  // 1. 효과성 순으로 정렬
  const sortedByEffectiveness = [...patterns].sort(
    (a, b) => b.effectiveness - a.effectiveness
  );
  
  // 2. 효과성이 비슷하면 빈도 고려
  const topEffectiveness = sortedByEffectiveness[0].effectiveness;
  const similarEffectiveness = sortedByEffectiveness.filter(
    p => topEffectiveness - p.effectiveness < 0.1
  );
  
  if (similarEffectiveness.length > 1) {
    similarEffectiveness.sort((a, b) => b.frequency - a.frequency);
    const top3 = similarEffectiveness.slice(0, 3);
    const selected = top3[Math.floor(Math.random() * top3.length)];
    return applyVariation(selected, mood);
  }
  
  return applyVariation(sortedByEffectiveness[0], mood);
}
```

---

## 최종 통합 파이프라인

```typescript
/**
 * 최종 무드스트림 생성
 * - 패턴 매칭 + 마르코프 체인 + 시계열 분석
 */
function generateMoodStream(
  currentBiometric: BiometricData,
  audioEvents: AudioEvent[],
  history: MoodHistory[],
  context: Context
): MoodStream[] {
  // 1. 감정 상태 추론 (클러스터 분류)
  const currentCluster = inferEmotionCluster(currentBiometric, audioEvents);
  
  // 2. 과거 데이터 체크
  if (history.length === 0) {
    // 콜드스타트: 0, + 클러스터 무드 균등분배
    return handleColdStart(currentCluster);
  }
  
  // 3. 패턴 매칭으로 시작 무드 결정
  const matchedPattern = findSimilarPattern(
    currentBiometric,
    currentCluster,
    history
  );
  
  if (!matchedPattern) {
    // 매칭 실패 시 콜드스타트 처리
    return handleColdStart(currentCluster);
  }
  
  let startMood = matchedPattern.mood;
  
  // 4. 시계열 추세 분석 (선택적)
  if (history.length >= 20) {
    const analyzer = new SimpleTimeSeriesAnalyzer();
    const trend = analyzer.analyzeTrend(
      history.map(h => h.biometric),
      10
    );
    startMood = analyzer.adjustMoodByTrend(startMood, trend);
  }
  
  // 5. 마르코프 체인으로 전환 패턴 학습
  const markovChain = new MarkovChainModel();
  markovChain.train(history);
  
  // 6. 30분 스트림 생성 (마르코프 체인 기반)
  const stream: MoodStream[] = [];
  let currentMood = startMood;
  
  for (let i = 0; i < 30; i++) {
    // 마르코프 체인으로 다음 무드 예측
    const nextMood = markovChain.predictNext(currentMood);
    
    if (nextMood) {
      currentMood = nextMood;
    } else {
      // 전환 패턴이 없으면 현재 무드 유지
      // 또는 기본 전환 규칙 사용
      currentMood = getDefaultTransition(currentMood);
    }
    
    // 속성 매칭
    const attributes = matchAttributes(currentMood, history, context);
    
    stream.push({
      timestamp: Date.now() + i * 60 * 1000,
      mood: {
        ...currentMood,
        scent: attributes.scent,
        song: attributes.music,
        color: attributes.lighting.color,
      },
    });
  }
  
  return stream;
}
```

---

## 기술적 가치

### 1. 패턴 매칭 (직관적, 해석 가능)
- ✅ 사용자별 실제 경험 활용
- ✅ 해석 가능 ("어제와 비슷")
- ✅ 개인화

### 2. 마르코프 체인 (ML 알고리즘)
- ✅ 전통적이지만 강력한 ML 알고리즘
- ✅ 전환 패턴 학습
- ✅ 확률 기반 예측
- ✅ 자연스러운 흐름

### 3. 시계열 분석 (AI 기술)
- ✅ 시계열은 AI/ML의 핵심 기술
- ✅ 간단한 이동평균 기반 추세 분석
- ✅ 복잡한 모델 없이도 효과적
- ✅ 시간적 패턴 학습

### 4. 우선순위 기반 속성 매칭
- ✅ 규칙 기반 우선순위
- ✅ 각 조건의 근거 명확

---

## 최종 구조 요약

```
[생체신호] → [클러스터 분류 (-, 0, +)]
        ↓
[과거 데이터 체크]
        ↓
┌─────────────────────────────────────┐
│  Yes → 패턴 매칭 (시작 무드)         │
│  + 마르코프 체인 (전환 패턴)         │
│  + 시계열 분석 (추세 보정)           │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  No → 콜드스타트                    │
│  - 0, + 클러스터 무드 기본값         │
│  - 등장 확률 균등분배               │
└─────────────────────────────────────┘
        ↓
[무드 결정 + 전환 패턴]
        ↓
[우선순위 기반 속성 매칭]
        ↓
[30분 무드스트림]
```

**기술 스택:**
- ✅ 패턴 매칭 (직관적, 해석 가능)
- ✅ 마르코프 체인 (ML 알고리즘)
- ✅ 시계열 분석 (AI 기술)
- ✅ 우선순위 기반 속성 매칭 (규칙 기반)

**기술적 가치:**
- ✅ 현대적이고 트렌드한 AI/ML 기술 활용
- ✅ 과하지 않게, 현실적으로 구현
- ✅ 콜드스타트 해결
- ✅ 해석 가능
