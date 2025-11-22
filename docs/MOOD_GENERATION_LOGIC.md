# 무드 생성 로직 상세 명세

## 개요

백엔드에서 시계열 모델과 마르코프 체인을 활용하여 30분 단위의 무드스트림을 생성하고, 10분마다 검증하여 필요시 재생성하는 시스템입니다.

---

## 클러스터 정의

무드는 감정 상태에 따라 3개의 클러스터로 분류됩니다:

- **`-` (부정 클러스터)**: 우울, 분노, 슬픔 등 부정적인 감정
- **`0` (중립 클러스터)**: 안정, 평온 등 중도적인 감정
- **`+` (긍정 클러스터)**: 기쁨, 즐거움 등 긍정적인 감정

> **참고**: 현재 무드의 정확한 명칭은 아직 확정되지 않았습니다. 위는 클러스터 분류 기준입니다.

---

## 무드스트림 생성 프로세스

### 1. 초기 무드스트림 생성

- **시점**: 사용자 로그인 시 또는 첫 무드 요청 시
- **입력**: 현재 생체 데이터 (WearOS에서 수집)
- **처리**:
  1. Raw data 전처리
  2. 시계열 모델로 State별 가능성 계산
  3. 마르코프 체인으로 30분 예측
  4. 무드스트림 생성 (약 10곡, 총 30분 정도)
- **출력**: 30분 무드스트림 (각 무드에 조명, 향, 음악 매핑)

### 2. 10분마다 검증 및 업데이트

#### 2.1 검증 로직

**시점**: 매 10분마다

**비교 대상**:
- **V1**: 현재 생체 데이터로 계산한 실제 감정 상태 (시계열 모델 결과)
- **V0 * P^10**: 이전에 생성한 무드스트림의 10분째 예측 무드 (마르코프 체인 결과)

**비교 방법**:
```
cluster(V1) == cluster(V0 * P^10) ?
```

**분기**:
- **같은 클러스터**: 기존 스트림 유지
- **다른 클러스터**: 즉시 새 스트림 생성

#### 2.2 스트림 유지 시 (클러스터 동일)

- 기존 30분 스트림을 계속 사용
- **10분 전 예약**: 현재 스트림이 종료되기 전 (약 2-3곡 남았을 때) 다음 30분 스트림을 백그라운드에서 생성
- 부드러운 전환을 위해 미리 준비

#### 2.3 스트림 재생성 시 (클러스터 다름)

- **즉시 재생성**: 현재 감정 상태(V1)를 시작점으로 새로운 30분 스트림 생성
- **전환 타이밍**: 현재 재생 중인 노래가 끝난 후 새 무드로 전환
  - 이유: 갑작스러운 전환 방지, 자연스러운 UX
- **이전 예측값 포기**: 기존 스트림은 더 이상 사용하지 않음

---

## 수학적 표현

### 마르코프 체인

```
V(t) = V(0) * P^t

여기서:
- V(0): 초기 상태 벡터 (각 무드의 확률 분포)
- P: 전이 확률 행렬 (마르코프 체인)
- V(t): t분 후의 예측 상태 벡터
- V0 * P^10: 10분 후 예측 무드
```

### 클러스터 비교

```
cluster(V1) vs cluster(V0 * P^10)

V1: 현재 생체 데이터 → 시계열 모델 → 현재 감정 상태
V0 * P^10: 이전 스트림의 초기 상태 → 마르코프 체인 → 10분 후 예측
```

---

## 예외 처리

### 데이터 부족 또는 모델 실패 시

- **폴백 전략**: `+` 클러스터 중 하나를 기본값으로 제안
- **이유**: 긍정적인 무드가 사용자 경험에 가장 안전한 선택
- **구현**: 백엔드에서 예외 발생 시 기본 무드 반환

---

## API 설계

### GET /api/moods/current

**설명**: 현재 무드 및 무드스트림 조회

**응답 형식**:
```typescript
{
  currentMood: {
    id: string,
    name: string,
    color: string,
    song: { title: string, duration: number },
    scent: { type: string, level: number }
  },
  moodStream: Array<{
    timestamp: string, // ISO 8601
    mood: {
      id: string,
      name: string,
      color: string,
      song: { title: string, duration: number },
      scent: { type: string, level: number }
    }
  }>, // 30분 스트림 (약 10곡)
  cluster: '-' | '0' | '+', // 현재 무드의 클러스터
  streamStatus: 'maintained' | 'regenerated', // 스트림 상태
  nextCheck: string, // 다음 검증 시점 (ISO 8601)
  nextStreamReady?: string // 다음 스트림 준비 완료 시점 (ISO 8601, 유지 시에만)
}
```

**동작**:
1. 백엔드에서 10분마다 자동으로 검증 수행
2. 클러스터가 다르면 즉시 새 스트림 생성
3. 프론트엔드는 주기적으로(예: 1분마다) 이 API를 호출하여 최신 무드스트림 받음

---

## 프론트엔드 연동 가이드

### 1. 무드스트림 수신

```typescript
// 주기적으로 API 호출 (예: 1분마다)
const fetchCurrentMood = async () => {
  const response = await fetch("/api/moods/current", {
    credentials: "include",
  });
  const data = await response.json();
  
  // 현재 무드 업데이트
  setCurrentMood(data.currentMood);
  
  // 무드스트림 저장 (향후 예측 표시용)
  setMoodStream(data.moodStream);
};
```

### 2. 전환 처리

```typescript
// streamStatus가 'regenerated'이고 현재 노래가 끝나면
if (data.streamStatus === 'regenerated' && currentSongEnded) {
  // 새 무드로 전환
  transitionToNewMood(data.currentMood);
}
```

### 3. 예외 처리

```typescript
// API 호출 실패 시 기본 무드 사용
if (!response.ok) {
  // 기본 긍정 무드 사용
  setCurrentMood(defaultPositiveMood);
}
```

---

## 개선점 및 고려사항

### 1. 클러스터 분류 기준 명확화

- **현재**: -, 0, + 세 가지 클러스터로 분류
- **개선 필요**: 각 무드가 어느 클러스터에 속하는지 명확한 매핑 규칙 정의
- **제안**: 백엔드에서 무드 → 클러스터 매핑 테이블 제공

### 2. 10분 전 예약 타이밍

- **현재**: "10분 전" 또는 "2-3곡 남았을 때"
- **개선 필요**: 정확한 타이밍 정의 (예: 현재 스트림의 20분 시점에 다음 스트림 생성 시작)
- **제안**: `nextStreamReady` 필드로 프론트엔드에 알림

### 3. 전환 UX 최적화

- **현재**: 노래가 끝난 후 전환
- **개선 필요**: 전환 시 페이드 효과 (1-2분간 부드러운 전환)
- **제안**: 프론트엔드에서 CSS transition 활용

### 4. 스트림 길이 보정

- **현재**: 30분 정도 (10곡, 정확히 30분이 아닐 수 있음)
- **개선 필요**: 스트림 종료 시점 정확히 계산
- **제안**: 각 무드의 실제 재생 시간 합산하여 정확한 종료 시점 제공

### 5. 실시간성

- **현재**: 10분마다 검증
- **개선 가능**: 급격한 감정 변화 감지 시 즉시 재생성 (선택적)
- **제안**: 생체 데이터 변화율이 임계값을 넘으면 즉시 재검증

---

## 백엔드 구현 가이드

### 1. 스케줄러 설정

```python
# 10분마다 실행
@schedule.every(10).minutes
def validate_mood_stream():
    # V1 계산 (현재 생체 데이터)
    current_emotion = calculate_current_emotion()
    
    # V0 * P^10 계산 (예측 무드)
    predicted_mood = calculate_predicted_mood_at_10min()
    
    # 클러스터 비교
    if get_cluster(current_emotion) != get_cluster(predicted_mood):
        # 새 스트림 생성
        new_stream = generate_mood_stream(current_emotion)
        update_current_stream(new_stream)
    else:
        # 10분 전 예약 (20분 시점에 다음 스트림 준비)
        if should_prepare_next_stream():
            prepare_next_stream()
```

### 2. 마르코프 체인 구현

```python
def calculate_predicted_mood_at_10min(initial_state, transition_matrix):
    # V0 * P^10
    return np.dot(initial_state, np.linalg.matrix_power(transition_matrix, 10))
```

### 3. 예외 처리

```python
def get_fallback_mood():
    # + 클러스터 중 하나 반환
    positive_moods = [m for m in all_moods if get_cluster(m) == '+']
    return random.choice(positive_moods)
```

---

## 결론

현재 설계는 **적응형 무드 생성**과 **부드러운 전환**을 잘 고려한 합리적인 구조입니다. 

**핵심 강점**:
- 클러스터 기반 검증으로 효율적인 스트림 관리
- 노래 종료 후 전환으로 자연스러운 UX
- 10분 전 예약으로 부드러운 전환 준비

**추가 개선 가능 영역**:
- 클러스터 매핑 규칙 명확화
- 타이밍 정확도 향상
- 전환 애니메이션 최적화

