# 무드스트림 구현 정리

## 이해한 바

### 1. 예측 및 사용 단위

- **1분 단위 예측**: 백엔드에서 시계열 + 마르코프 체인으로 1분 단위 예측값 생성 (30개, 30분치)
- **3분 단위 사용**: 음악 길이가 보통 3분이기 때문에 3분 단위로 묶어서 사용
- **10개 세그먼트**: 1분 예측값 30개를 3분 단위로 묶으면 10개 세그먼트가 됨

### 2. LLM 호출 시점

- **무드스트림 재생성 시**: 10개 세그먼트 전체에 대한 배경 파라미터를 한 번에 생성
- **스프레이/앨범 버튼**: 현재 세그먼트만 변경, LLM 호출 없음
- **새로고침 버튼**: 무드스트림 재생성 → LLM 호출

### 3. 자동 재생성 로직

- **예약된 세그먼트 관리**: 스케줄러가 예약된 세그먼트를 관리
- **최소 유지 개수**: 3개 (끊김 방지)
- **재생성 조건**: 예약된 세그먼트가 3개 이하가 되면 자동으로 재생성
- **추가 방식**: 새로 생성된 세그먼트는 뒤로 붙음 (기존 세그먼트 유지)
- **대기 가능 개수**: 최대 13개까지 대기 가능 (3개 + 10개)

### 4. 처리 흐름

```
[초기 로드]
    ↓
[POST /api/moods/current/generate]
→ 1분 단위 예측값 30개 생성
→ 3분 단위로 분절하여 10개 세그먼트 생성
    ↓
[POST /api/ai/background-params]
→ 10개 세그먼트 전체 정보를 LLM에 전달
→ 배경 파라미터 생성 (무드별명, 색상, 조명, 아이콘 등)
    ↓
[스케줄러에 추가]
→ 10개 세그먼트 예약
    ↓
[주기적 확인 (1분마다)]
→ 예약된 세그먼트가 3개 이하?
    ↓ YES
[재생성]
→ 동일한 정보로 10개 세그먼트 재생성
→ 뒤로 붙음 (총 13개 대기)
```

---

## 데이터 구조

### 세그먼트 구조

```typescript
interface MoodStreamSegment {
  id: string;                    // 세그먼트 고유 ID
  timestamp: number;              // 시작 시간 (Unix timestamp)
  duration: number;               // 길이 (3분 = 180000ms)
  
  // 백엔드에서 설정된 정보
  moodName: string;               // "Deep Relax"
  musicGenre: string;             // "newage"
  scentType: string;              // "citrus"
  
  // LLM으로 생성된 정보
  moodAlias?: string;             // "겨울비의 평온"
  musicSelection?: string;        // "Ambient Rain Meditation"
  moodColor?: string;             // "#6B8E9F"
  lighting?: {
    rgb: [number, number, number];
    brightness: number;
    temperature?: number;
  };
  backgroundIcon?: {
    name: string;                 // "FaCloudRain"
    category: string;             // "weather"
  };
  backgroundWind?: {
    direction: number;            // 0-360도
    speed: number;                // 0-10
  };
  animationSpeed?: number;         // 0-10
  iconOpacity?: number;           // 0-1
  // ...
}
```

---

## API 호출 흐름

### 1. 무드스트림 생성

```typescript
// POST /api/moods/current/generate
const response = await fetch("/api/moods/current/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nextStartTime: Date.now(), // 다음 세그먼트 시작 시간
  }),
});

const { segments, streamId } = await response.json();
// segments: 10개 세그먼트 배열
```

### 2. LLM 배경 파라미터 생성

```typescript
// POST /api/ai/background-params
const llmResponse = await fetch("/api/ai/background-params", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    segments: segments, // 10개 세그먼트 정보
    userPreferences: userPreferences,
  }),
});

const backgroundParams = await llmResponse.json();
// backgroundParams: 10개 세그먼트 전체에 대한 배경 파라미터
```

### 3. 세그먼트에 LLM 정보 추가

```typescript
// 각 세그먼트에 LLM 정보 추가
const enrichedSegments = segments.map((segment, index) => ({
  ...segment,
  moodAlias: backgroundParams.moodAlias,
  musicSelection: backgroundParams.musicSelection,
  moodColor: backgroundParams.moodColor,
  lighting: backgroundParams.lighting,
  backgroundIcon: backgroundParams.backgroundIcon,
  // ...
}));
```

### 4. 스케줄러에 추가

```typescript
// 스케줄러에 추가 (뒤로 붙음)
moodStreamScheduler.appendSegments(enrichedSegments);
```

---

## 핵심 포인트

1. **30분 고정 아님**: 10개 세그먼트를 생성하고 순차적으로 실행
2. **동일한 무드 기반**: 하나의 무드스트림 내에서는 동일한 무드를 기반으로 함 (음악 장르와 향은 세그먼트별로 다양할 수 있음)
3. **자동 재생성**: 예약된 세그먼트가 3개 이하가 되면 자동으로 재생성
4. **끊김 없음**: 항상 3개 이상의 세그먼트가 대기 상태 유지
5. **LLM 호출 최소화**: 무드스트림 재생성 시에만 호출 (스프레이/앨범 버튼은 호출 안 함)
6. **배치 처리**: 10개 세그먼트 전체에 대한 배경 파라미터를 한 번에 생성

---

## 구현 완료

- [x] 무드스트림 스케줄러 (`src/lib/moodStream/scheduler.ts`)
- [x] 무드스트림 생성 API (`src/app/api/moods/current/generate/route.ts`)
- [x] LLM 배경 파라미터 API 수정 (`src/app/api/ai/background-params/route.ts`)
- [x] 무드스트림 관리 훅 (`src/hooks/useMoodStreamManager.ts`)
- [x] 자동 재생성 로직

---

## 다음 단계

1. **백엔드 연동**: 실제 시계열 + 마르코프 체인 예측값 받기
2. **OpenAI 연동**: 실제 OpenAI API 호출
3. **테스트**: 자동 재생성 로직 테스트
4. **성능 최적화**: LLM 호출 최소화 및 캐싱

