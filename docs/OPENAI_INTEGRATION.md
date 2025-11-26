# OpenAI 통합 가이드

## 구현 상태

### 1. OpenAI API 호출 코드
- `src/app/api/ai/background-params/route.ts`에 OpenAI 호출 구현
- API 키가 없으면 자동으로 목업 응답 반환
- 에러 발생 시에도 목업 응답으로 fallback

### 2. 응답 검증 및 정규화
- `src/lib/llm/validateResponse.ts`에 검증 로직 구현
- 필요한 값만 추출하고 안전하게 정규화
- 타입 안정성 보장

---

## 🔧 원하는 값만 받아오는 방법

### 1. JSON 모드 강제
```typescript
response_format: { type: "json_object" }
```
- OpenAI가 JSON 형식으로만 응답하도록 강제
- 불필요한 텍스트 제거

### 2. 프롬프트에 명확한 요구사항
```typescript
[요구사항]
1. 무드별명: ...
2. 음악 선곡: ...
...
다음 JSON 형식으로 응답하세요:
{
  "moodAlias": "...",
  "musicSelection": "...",
  ...
}
```
- 필요한 필드만 명시
- JSON 구조 명확히 지정

### 3. 응답 검증 및 정규화
```typescript
validateAndNormalizeResponse(rawResponse)
```
- 필수 필드 검증
- 값 범위 제한 (clamp)
- 타입 변환 및 정규화
- 불필요한 필드 제거

### 4. 에러 처리
- OpenAI API 실패 시 목업 응답 반환
- 검증 실패 시 기본값 사용
- 서비스 중단 방지

---

## 📋 검증 로직

### 필수 필드
- `moodAlias`: 문자열, 필수
- `moodColor`: HEX 색상, 필수
- `lighting.rgb`: RGB 배열 [r, g, b], 필수

### 값 범위 제한
- RGB: 0-255
- Brightness: 0-100
- Temperature: 2000-6500
- Direction: 0-360
- Speed: 0-10
- AnimationSpeed: 0-10
- IconOpacity: 0-1

### 선택적 필드
- `iconCount`, `iconSize`, `particleEffect`, `gradientColors` 등
- 없으면 기본값 사용

---

## 🔗 디바이스와 무드대시보드 연결

### 현재 상태 (목업)

**연결 유지됨:**
```typescript
// useMood.ts
const handleScentChange = (newMood: Mood) => {
  setCurrentMood(newMood);
  setDevices((prev) =>
    prev.map((d) =>
      d.type === "manager"
        ? {
            ...d,
            output: {
              ...d.output,
              color: newMood.color,
              scentType: newMood.scent.name,
              nowPlaying: newMood.song.title,
            },
          }
        : d
    )
  );
};
```

**동작 방식:**
1. 무드 변경 시 `setCurrentMood`로 무드 상태 업데이트
2. `setDevices`로 디바이스 상태도 함께 업데이트
3. Manager 디바이스의 `output`에 무드 정보 반영

### 실제 API 연결 시

**주석 처리된 부분 활성화:**
```typescript
const updateScent = async () => {
  const response = await fetch("/api/moods/current/scent", {
    method: "PUT",
    body: JSON.stringify({ moodId: newMood.id }),
  });
  const data = await response.json();
  setCurrentMood(data.mood);
  setDevices(data.updatedDevices); // 백엔드에서 업데이트된 디바이스 반환
};
```

**문제없이 동작하는 이유:**
1. 현재 로컬 상태 업데이트 로직이 이미 구현되어 있음
2. 실제 API 연결 시 주석 해제만 하면 됨
3. 백엔드에서 `updatedDevices`를 반환하면 그대로 사용
4. 구조가 동일하므로 문제없음

---

## 🚀 사용 방법

### 1. 환경 변수 설정
```bash
# .env.local
OPENAI_API_KEY=sk-...
```

### 2. API 호출
```typescript
const response = await fetch("/api/ai/background-params", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userPreferences: ... }),
});
```

### 3. 응답 사용
```typescript
const data = await response.json();
// 검증된 안전한 데이터
// {
//   moodAlias: "...",
//   moodColor: "#...",
//   lighting: { rgb: [...], brightness: ... },
//   ...
// }
```

---

## 요약

1. **OpenAI 호출 코드**: `/api/ai/background-params` 에서 실제 API 호출 및 목업 fallback 구현
2. **응답 검증**: `validateAndNormalizeResponse` 로 타입/범위 검증 및 정규화
3. **디바이스 연결**: 현재는 로컬 상태 업데이트 기준으로 연결되어 있으며, 추후 실제 백엔드 연동 시 동일한 인터페이스로 교체 가능

