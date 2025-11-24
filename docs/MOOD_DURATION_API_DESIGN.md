# 무드 지속 시간 (Mood Duration) API 설계

**작성일**: 2025년  
**목적**: 무드 지속 시간 관리 및 API 설계

---

## 📊 현재 구현 상태

### 프론트엔드
- ✅ 무드 지속 시간 표시 UI (간트 차트 스타일)
- ✅ 로컬 상태로 관리 (`moodDuration` state)
- ⚠️ 백엔드 API 연동 미구현

### 백엔드 API
- ⚠️ 무드 지속 시간 관련 API 미정의
- ⚠️ 무드 생명주기 관리 로직 미정의

---

## 🎯 무드 지속 시간 개념

### 정의
- **무드 지속 시간**: 현재 무드가 유지되는 시간 (분 단위)
- **무드 생명주기**: 무드 생성 → 활성화 → 만료 → 새 무드 생성

### 동작 방식
1. 무드 추론 엔진이 새 무드를 생성하면 기본 지속 시간 설정 (예: 30분)
2. 시간이 지나면서 지속 시간 감소
3. 지속 시간이 0이 되면 새 무드 생성 트리거
4. 사용자가 새로고침 버튼을 누르면 무드 클러스터 내에서 변경 또는 지속 시간 연장

---

## 🔄 새로고침 버튼 동작 방식

### 옵션 1: 무드 클러스터 내에서 변경 (현재 구현) ⭐ 추천

**동작**:
- 같은 무드 패턴(MOOD_PATTERNS) 내에서 다른 조합(음악/향/조명) 선택
- 무드 이름은 유지, 속성만 변경
- 예: "Deep Relax" → "Deep Relax" (다른 음악/향/조명 조합)

**장점**:
- 사용자가 원하는 무드 분위기를 유지하면서 다양성 제공
- 무드 이름의 일관성 유지
- 자연스러운 무드 전환

**API 설계**:
```typescript
PUT /api/moods/current/refresh
요청: { extendDuration?: boolean }
응답: { mood: Mood, updatedDevices: Device[], duration?: number }
```

---

### 옵션 2: 무드 지속 시간만 연장

**동작**:
- 현재 무드 유지
- 지속 시간만 연장 (예: +30분)
- 무드 속성 변경 없음

**장점**:
- 사용자가 현재 무드를 더 오래 즐길 수 있음
- 간단한 동작

**단점**:
- 다양성이 부족함
- 무드 변화가 없어서 지루할 수 있음

---

### 옵션 3: 하이브리드 (둘 다 지원) ⭐⭐ 최고 추천

**동작**:
- 기본: 무드 클러스터 내에서 변경
- 길게 누르기: 무드 지속 시간만 연장
- 또는 설정에서 선택 가능

**장점**:
- 유연성 제공
- 사용자 선택권 부여

**단점**:
- 구현이 약간 복잡함

---

## 📋 API 설계 제안

### 1. 무드 지속 시간 조회

**GET** `/api/moods/current/duration`

**인증**: Bearer token (NextAuth session)

**설명**: 현재 무드의 남은 지속 시간 조회

**응답**:
```json
{
  "duration": 25, // 남은 시간 (분)
  "totalDuration": 30, // 전체 지속 시간 (분)
  "startedAt": "2025-01-15T10:00:00Z", // 무드 시작 시간
  "expiresAt": "2025-01-15T10:30:00Z" // 무드 만료 시간
}
```

---

### 2. 무드 새로고침 (클러스터 내 변경)

**PUT** `/api/moods/current/refresh`

**인증**: Bearer token (NextAuth session)

**설명**: 현재 무드 클러스터 내에서 새로운 조합 선택

**요청**:
```json
{
  "extendDuration": false // false: 무드 변경, true: 지속 시간만 연장
}
```

**응답**:
```json
{
  "mood": {
    "id": "calm-2",
    "name": "Calm Breeze",
    "color": "#D4E6F1",
    "song": { "title": "Ocean Waves", "duration": 195 },
    "scent": { "type": "Marine", "name": "Shell", "color": "#00CED1" }
  },
  "updatedDevices": [...],
  "duration": 30 // 새로 설정된 지속 시간 (분)
}
```

---

### 3. 무드 지속 시간 연장

**PUT** `/api/moods/current/extend-duration`

**인증**: Bearer token (NextAuth session)

**설명**: 현재 무드의 지속 시간만 연장 (무드 속성 변경 없음)

**요청**:
```json
{
  "additionalMinutes": 30 // 추가할 시간 (분)
}
```

**응답**:
```json
{
  "duration": 60, // 연장된 지속 시간 (분)
  "expiresAt": "2025-01-15T11:00:00Z" // 새로운 만료 시간
}
```

---

### 4. 무드 생명주기 관리 (백엔드 내부)

**설명**: 백엔드에서 주기적으로 실행되는 작업

**동작**:
1. 모든 활성 무드의 지속 시간 감소 (1분마다)
2. 지속 시간이 0이 되면 새 무드 생성 트리거
3. 무드 추론 엔진 호출하여 새 무드 생성
4. 프론트엔드에 WebSocket/SSE로 알림

**구현 위치**: 백엔드 스케줄러 (Cron Job 또는 Background Task)

---

## 💾 DB 스키마 확장

### MoodCycle 스키마에 추가

```typescript
interface MoodCycle {
  // ... 기존 필드
  duration: number; // 지속 시간 (분)
  startedAt: Date; // 무드 시작 시간
  expiresAt: Date; // 무드 만료 시간
  isActive: boolean; // 현재 활성 무드 여부
}
```

### Prisma Schema

```prisma
model MoodCycle {
  // ... 기존 필드
  duration        Int      @default(30) // 지속 시간 (분)
  startedAt       DateTime @default(now())
  expiresAt       DateTime
  isActive        Boolean  @default(true)
  
  @@index([userId, isActive])
  @@index([expiresAt])
}
```

---

## 🔄 프론트엔드 구현

### 실시간 업데이트

**옵션 1: Polling**
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch("/api/moods/current/duration");
    const data = await response.json();
    setMoodDuration(data.duration);
    
    if (data.duration === 0) {
      // 새 무드 생성 트리거
      fetchNewMood();
    }
  }, 60000); // 1분마다 체크
  
  return () => clearInterval(interval);
}, []);
```

**옵션 2: WebSocket/SSE** (추천)
```typescript
useEffect(() => {
  const eventSource = new EventSource("/api/moods/current/stream");
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "duration_update") {
      setMoodDuration(data.duration);
    } else if (data.type === "mood_expired") {
      fetchNewMood();
    }
  };
  
  return () => eventSource.close();
}, []);
```

---

## 📝 추천 구현 방안

### 단계 1: 기본 구현
1. 무드 생성 시 기본 지속 시간 설정 (30분)
2. 프론트엔드에서 1분마다 지속 시간 감소 (로컬 상태)
3. 새로고침 버튼: 무드 클러스터 내에서 변경

### 단계 2: 백엔드 연동
1. 백엔드에서 무드 생명주기 관리
2. 지속 시간 조회 API 구현
3. 무드 새로고침 API 구현

### 단계 3: 실시간 업데이트
1. WebSocket/SSE로 실시간 지속 시간 업데이트
2. 무드 만료 시 자동 새 무드 생성

---

## 🎯 최종 추천

### 새로고침 버튼 동작
- **기본 동작**: 무드 클러스터 내에서 변경 (옵션 1) ⭐
- **향후 확장**: 길게 누르기로 지속 시간 연장 (옵션 3)

### API 설계
- `PUT /api/moods/current/refresh` - 무드 클러스터 내에서 변경
- `PUT /api/moods/current/extend-duration` - 지속 시간만 연장 (선택적)
- `GET /api/moods/current/duration` - 지속 시간 조회

### 구현 우선순위
1. 무드 클러스터 내에서 변경 (현재 구현)
2. 백엔드에서 무드 생명주기 관리
3. 실시간 업데이트 (WebSocket/SSE)

