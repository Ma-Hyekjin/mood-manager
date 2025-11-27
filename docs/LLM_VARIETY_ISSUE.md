# LLM 응답 다양성 문제 분석

## 문제 현상

"bright morning bliss" 같은 무드에서 코어가 같으면 색상이나 아이콘이 동일한 경우가 발생

## 원인 분석

### 1. 캐시 키가 너무 넓게 설정됨

**현재 캐시 키**:
```typescript
`${moodName}-${musicGenre}-${scentType}-${timeOfDay}-${season}-${stressRange}`
```

**문제점**:
- 같은 무드 이름이면 다른 조건(날씨, 감정 이벤트, 선호도)이 달라도 캐시 히트 가능
- 예: "bright morning bliss" + 같은 시간대 + 같은 계절 → 항상 같은 응답

**예시**:
- 첫 번째 호출: "bright morning bliss" (맑은 날, 웃음 이벤트) → 노란색, sun_soft
- 두 번째 호출: "bright morning bliss" (비 오는 날, 한숨 이벤트) → **캐시 히트** → 같은 노란색, sun_soft

---

### 2. 프롬프트에 다양성 유도 부족

**현재 프롬프트**:
```
Mood background design (Respond in English only)
[MOOD] bright morning bliss | [MUSIC] pop | [SCENT] citrus | ...
```

**문제점**:
- "다양한 표현", "창의적", "무드에 맞는 고유한 색상" 같은 지시가 없음
- LLM이 같은 무드 이름이면 비슷한 패턴으로 응답할 수 있음

---

### 3. Temperature 설정

**현재**: `temperature: 0.7`

**평가**:
- 적절한 수준이지만, 프롬프트에 다양성을 명시하지 않으면 비슷한 응답이 나올 수 있음
- 같은 입력에 대해 약간의 변주는 있지만, 전반적인 패턴은 유사할 수 있음

---

## 해결 방안

### 방안 1: 캐시 키 세분화 (권장)

**변경 전**:
```typescript
const cacheKey = {
  moodName,
  musicGenre,
  scentType,
  timeOfDay,
  season,
  stressIndex: stressRange, // 0-20, 21-40 등 범위
};
```

**변경 후**:
```typescript
const cacheKey = {
  moodName,
  musicGenre,
  scentType,
  timeOfDay,
  season,
  stressIndex: stressRange,
  // 추가: 날씨 정보 (온도, 하늘 상태)
  weather: `${preprocessed.weather.temperature}-${preprocessed.weather.sky}`,
  // 추가: 감정 이벤트 요약 (웃음/한숨 등)
  emotionSummary: Object.entries(preprocessed.emotionEvents)
    .filter(([_, arr]) => arr.length > 0)
    .map(([emotion]) => emotion)
    .join(','),
};
```

**효과**:
- 날씨나 감정 상태가 다르면 다른 캐시 키 생성
- 더 세밀한 캐싱으로 다양성 확보

---

### 방안 2: 프롬프트에 다양성 지시 추가

**변경 전**:
```
Mood background design (Respond in English only)
```

**변경 후**:
```
Mood background design (Respond in English only)

Important: Even for the same mood name, create unique and creative variations based on:
- Current weather conditions
- Recent emotional events
- Time of day and season
- User preferences

Avoid repeating the same color/icon combinations. Be creative and expressive.
```

**효과**:
- LLM이 같은 무드 이름이라도 다양한 표현을 생성하도록 유도
- 날씨, 감정, 시간대 등을 고려한 고유한 응답 생성

---

### 방안 3: Temperature 조정 (선택적)

**변경 전**: `temperature: 0.7`

**변경 후**: `temperature: 0.8` 또는 `0.85`

**효과**:
- 더 다양한 응답 생성
- 단점: 일관성은 약간 떨어질 수 있음

---

### 방안 4: 캐시 TTL 단축 (선택적)

**변경 전**: `CACHE_TTL = 60 * 60 * 1000` (1시간)

**변경 후**: `CACHE_TTL = 30 * 60 * 1000` (30분)

**효과**:
- 더 자주 새로운 응답 생성
- 단점: API 비용 증가

---

## 권장 조합

1. **캐시 키 세분화** (방안 1) - 필수
2. **프롬프트 다양성 지시** (방안 2) - 필수
3. **Temperature 약간 상향** (방안 3) - 선택적 (0.7 → 0.8)

이 조합으로:
- 같은 무드 이름이라도 날씨/감정/시간대에 따라 다른 색상/아이콘 생성
- 캐시는 여전히 유효하지만 더 세밀하게 작동
- LLM이 창의적으로 응답하도록 유도

