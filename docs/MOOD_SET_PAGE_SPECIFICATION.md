# 무드셋 페이지 명세서

## 개요

무드셋 페이지는 사용자가 저장한 무드들을 모아서 보여주고 관리할 수 있는 페이지입니다. 사용자는 무드 대시보드에서 별(⭐) 버튼을 눌러 무드를 저장할 수 있으며, 바텀 네비게이션의 3번째 아이콘을 통해 무드셋 페이지에 접근할 수 있습니다.

## 기능 명세

### 1. 무드 저장 기능

#### 1.1 별 버튼 클릭
- **위치**: 무드 대시보드 우측 상단
- **동작**: 
  - 클릭 시 현재 무드를 무드셋에 저장
  - 저장된 무드는 별 아이콘이 채워진 상태로 표시
  - 다시 클릭하면 저장 취소 (무드셋에서 제거)

#### 1.2 저장된 무드 정보
- 무드 ID
- 무드 이름 (LLM 추천 별명 포함)
- 무드 색상
- 음악 정보 (제목, 장르)
- 향 정보 (타입, 이름)
- 저장 시각
- 선호도 카운트 (0-3)

### 2. 무드셋 페이지 UI

#### 2.1 페이지 레이아웃
- **헤더**: "내 무드셋" 타이틀
- **무드 그리드**: 저장된 무드들을 카드 형태로 표시
- **빈 상태**: 저장된 무드가 없을 때 안내 메시지 표시

#### 2.2 무드 카드
각 무드 카드는 다음 정보를 표시:
- 무드 색상 배경 (무드 컬러 기반)
- 무드 이름 (LLM 별명)
- 음악 제목
- 향 타입
- 선호도 표시 (⭐ X/3)
- 삭제 버튼 (우측 상단)

#### 2.3 무드 카드 클릭
- 무드 카드 클릭 시 해당 무드를 현재 무드로 적용
- 홈 페이지로 이동하여 선택한 무드가 대시보드에 표시됨

### 3. API 명세

#### 3.1 무드 저장 API

**POST /api/moods/saved**

무드를 무드셋에 저장합니다.

**Request Body:**
```json
{
  "moodId": "calm-1",
  "moodName": "Calm Breeze",
  "moodColor": "#E6F3FF",
  "music": {
    "genre": "newage",
    "title": "Calm Breeze"
  },
  "scent": {
    "type": "Marine",
    "name": "Wave"
  },
  "preferenceCount": 2
}
```

**Response:**
```json
{
  "success": true,
  "savedMood": {
    "id": "saved-1234567890",
    "moodId": "calm-1",
    "moodName": "Calm Breeze",
    "moodColor": "#E6F3FF",
    "music": {
      "genre": "newage",
      "title": "Calm Breeze"
    },
    "scent": {
      "type": "Marine",
      "name": "Wave"
    },
    "preferenceCount": 2,
    "savedAt": 1764148498702
  }
}
```

#### 3.2 저장된 무드 목록 조회 API

**GET /api/moods/saved**

사용자가 저장한 모든 무드를 조회합니다.

**Response:**
```json
{
  "savedMoods": [
    {
      "id": "saved-1234567890",
      "moodId": "calm-1",
      "moodName": "Calm Breeze",
      "moodColor": "#E6F3FF",
      "music": {
        "genre": "newage",
        "title": "Calm Breeze"
      },
      "scent": {
        "type": "Marine",
        "name": "Wave"
      },
      "preferenceCount": 2,
      "savedAt": 1764148498702
    },
    {
      "id": "saved-1234567891",
      "moodId": "focus-1",
      "moodName": "Deep Focus",
      "moodColor": "#F5F5DC",
      "music": {
        "genre": "classical",
        "title": "Concentration"
      },
      "scent": {
        "type": "Musk",
        "name": "Cloud"
      },
      "preferenceCount": 3,
      "savedAt": 1764148498703
    }
  ]
}
```

#### 3.3 저장된 무드 삭제 API

**DELETE /api/moods/saved/{savedMoodId}**

무드셋에서 무드를 삭제합니다.

**Response:**
```json
{
  "success": true,
  "deletedId": "saved-1234567890"
}
```

#### 3.4 저장된 무드 적용 API

**POST /api/moods/saved/{savedMoodId}/apply**

저장된 무드를 현재 무드로 적용합니다.

**Response:**
```json
{
  "success": true,
  "mood": {
    "id": "calm-1",
    "name": "Calm Breeze",
    "color": "#E6F3FF",
    "song": {
      "title": "Calm Breeze",
      "duration": 182
    },
    "scent": {
      "type": "Marine",
      "name": "Wave",
      "color": "#87CEEB"
    }
  },
  "updatedDevices": []
}
```

### 4. 선호도 카운트 연동

#### 4.1 선호도 카운트 표시
- 무드셋 페이지의 각 무드 카드에 선호도 카운트 표시
- 형식: ⭐ X/3 (X는 0-3 사이의 값)

#### 4.2 선호도 데이터 활용
- 시계열 + 마르코프 체인 예측 시 선호도 카운트를 가중치로 활용
- LLM 프롬프트에 사용자 선호도 정보로 포함
  - `userPreferences.music`: 장르별 선호도 카운트
  - `userPreferences.scent`: 향별 선호도 카운트
  - `userPreferences.color`: 컬러별 선호도 카운트

### 5. 데이터베이스 구조 (Firestore)

#### 5.1 저장된 무드 컬렉션
```
users/{userId}/savedMoods/{savedMoodId}
{
  moodId: string;
  moodName: string;
  moodColor: string;
  music: {
    genre: string;
    title: string;
  };
  scent: {
    type: string;
    name: string;
  };
  preferenceCount: number; // 0-3
  savedAt: timestamp;
  updatedAt: timestamp;
}
```

#### 5.2 선호도 통계 컬렉션
```
users/{userId}/preferences/mood/{moodId}
{
  count: number; // 0-3
  lastUpdated: timestamp;
}

users/{userId}/preferences/music/{genre}
{
  count: number;
  lastUpdated: timestamp;
}

users/{userId}/preferences/scent/{scentType}
{
  count: number;
  lastUpdated: timestamp;
}

users/{userId}/preferences/color/{colorHex}
{
  count: number;
  lastUpdated: timestamp;
}
```

### 6. 구현 우선순위

1. **Phase 1**: 기본 저장/조회 기능
   - POST /api/moods/saved
   - GET /api/moods/saved
   - 무드셋 페이지 UI (기본 레이아웃)

2. **Phase 2**: 삭제 및 적용 기능
   - DELETE /api/moods/saved/{savedMoodId}
   - POST /api/moods/saved/{savedMoodId}/apply
   - 무드 카드 클릭 시 적용 기능

3. **Phase 3**: 선호도 연동
   - 선호도 카운트 표시
   - 시계열 + 마르코프 체인 가중치 반영
   - LLM 프롬프트에 선호도 정보 포함

### 7. UI/UX 고려사항

- 무드 카드는 무드 색상을 배경으로 사용하여 시각적 구분
- 선호도가 높은 무드(3/3)는 특별한 표시 (예: 골드 테두리)
- 무드 카드 호버 시 상세 정보 툴팁 표시
- 삭제 버튼은 확인 모달을 통해 실수 방지
- 빈 상태일 때는 "무드를 저장해보세요" 안내 메시지

### 8. 에러 처리

- 무드 저장 실패 시 토스트 메시지 표시
- 네트워크 오류 시 재시도 버튼 제공
- 저장된 무드가 없을 때 빈 상태 UI 표시
- 무드 적용 실패 시 에러 메시지 및 롤백

