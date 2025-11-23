# Mood Manager API 명세서

## 개요
Mood Manager는 사용자의 무드 상태를 관리하고, 조명, 향기, 음악을 제어하는 디바이스를 관리하는 API입니다.

## 인증
- **인증이 필요한 API**: NextAuth 세션을 사용하며, `credentials: "include"` 옵션으로 쿠키 기반 인증을 수행합니다.
- **인증이 불필요한 API**: 로그인, 회원가입 등은 인증 없이 접근 가능합니다.
- **소셜 로그인**: Google, Kakao, Naver 로그인은 NextAuth가 자동으로 처리합니다 (별도 API 불필요).

**인증 헤더**: 자동으로 쿠키에 포함됨 (NextAuth 세션)

---

## 인증 API

### 1. 회원가입
**POST** `/api/auth/register`

**인증**: 불필요 (회원가입 요청이므로)

**설명**: 새 사용자 계정을 생성하고 백엔드 DB에 저장합니다. 성공 시 NextAuth 세션을 자동 생성하고 홈 페이지로 이동합니다 (설문은 홈에서 팝업으로 표시).

**백엔드 처리**:
- 사용자 정보를 DB에 저장 (familyName, name, birthDate, gender, email, password)
- 비밀번호는 해시 처리하여 저장
- 이메일 중복 체크 수행

**요청**:
```json
{
  "familyName": "Doe",
  "name": "John",
  "birthDate": "1990-01-01",
  "gender": "male",
  "email": "john@example.com",
  "password": "password123"
}
```

**요청 필드**:
- `familyName` (required): 사용자 성 (Family Name)
- `name` (required): 사용자 이름 (Given Name)
- `birthDate` (required): 생년월일 (YYYY-MM-DD 형식, 만 12세 이상)
- `gender` (required): 성별 (`"male"` 또는 `"female"`)
- `email` (required): 이메일 주소 (고유해야 함)
- `password` (required): 비밀번호 (최소 6자 이상, 강도 검증 포함)

**응답**:
```json
{
  "success": true,
  "user": {
    "id": "user-1234567890",
    "email": "john@example.com",
    "familyName": "Doe",
    "name": "John"
  }
}
```

**에러 응답**:
```json
{
  "success": false,
  "error": "EMAIL_ALREADY_EXISTS",
  "message": "이미 사용 중인 이메일입니다."
}
```

---

### 2. 이메일/비밀번호 로그인
**POST** `/api/auth/login`

**인증**: 불필요 (로그인 요청이므로)

**설명**: 이메일/비밀번호로 로그인하고, 설문 조사 완료 여부를 반환합니다.

**요청**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**요청 필드**:
- `email` (required): 이메일 주소
- `password` (required): 비밀번호

**응답**:
```json
{
  "success": true,
  "hasSurvey": false,
  "user": {
    "id": "user-1234567890",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**응답 필드 설명**:
- `success`: 로그인 성공 여부
- `hasSurvey`: 설문 조사 완료 여부 (false면 `/survey`로 이동, true면 `/home`으로 이동)
- `user`: 사용자 정보

**에러 응답**:
```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "이메일 또는 비밀번호가 올바르지 않습니다."
}
```

---

### 3. 설문 조사 완료 여부 확인
**GET** `/api/auth/survey-status`

**인증**: NextAuth session (쿠키 기반)

**설명**: 현재 사용자의 설문 조사 완료 여부를 확인합니다.

**응답**:
```json
{
  "hasSurvey": true
}
```

**응답 필드 설명**:
- `hasSurvey`: 설문 조사 완료 여부 (true/false)

---

### 4. 로그아웃
**POST** `/api/auth/signout`

**인증**: NextAuth session (쿠키 기반)

**설명**: 현재 세션을 종료하고 로그아웃합니다. NextAuth의 `signOut` 함수를 사용하며, 세션 쿠키 삭제와 함께 로컬 스토리지 및 세션 스토리지의 모든 캐시 데이터를 정리합니다.

**클라이언트 구현**:
- NextAuth의 `signOut({ redirect: false })` 호출
- `localStorage.clear()` 및 `sessionStorage.clear()` 실행
- 로그인 페이지로 리다이렉트

**응답**:
```json
{
  "success": true
}
```

**참고**:
- NextAuth 기본 제공 기능 사용
- 로그아웃 시 모든 클라이언트 사이드 캐시 데이터 자동 정리

---

### 5. 소셜 로그인
**GET** `/api/auth/signin/:provider`

**인증**: 불필요

**설명**: 소셜 로그인을 시작합니다. NextAuth가 자동으로 처리합니다.

**지원 프로바이더**:
- `google`: Google 로그인
- `kakao`: Kakao 로그인
- `naver`: Naver 로그인

**리다이렉트**: 각 소셜 로그인 제공자의 인증 페이지로 리다이렉트됩니다.

**참고**: 소셜 로그인은 NextAuth가 자동으로 처리하므로 별도의 API 엔드포인트 구현이 필요하지 않습니다.

---

### 6. 비밀번호 찾기 (인증코드 전송)
**POST** `/api/auth/forgot-password`

**인증**: 불필요 (공개 엔드포인트)

**설명**: 이메일로 6자리 인증코드를 전송합니다. 보안상 이메일 존재 여부와 관계없이 동일한 응답을 반환합니다.

**요청**:
```json
{
  "email": "john@example.com"
}
```

**요청 필드**:
- `email` (required): 이메일 주소

**응답**:
```json
{
  "success": true,
  "message": "Verification code has been sent to your email."
}
```

**에러 응답**:
```json
{
  "error": "INVALID_INPUT",
  "message": "Email is required"
}
```

**참고**: 
- 이메일 열거 공격 방지를 위해 존재하지 않는 이메일이어도 동일한 성공 메시지 반환
- 인증코드는 6자리 숫자
- 인증코드 유효기간: 10분

---

### 6-1. 인증코드 확인
**POST** `/api/auth/verify-reset-code`

**인증**: 불필요 (공개 엔드포인트)

**설명**: 인증코드를 확인하고 비밀번호 재설정 토큰을 발급합니다.

**요청**:
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**요청 필드**:
- `email` (required): 이메일 주소
- `code` (required): 6자리 인증코드

**응답**:
```json
{
  "success": true,
  "token": "reset-token-abc123",
  "message": "Verification code confirmed"
}
```

**에러 응답**:
```json
{
  "error": "INVALID_CODE",
  "message": "Invalid verification code"
}
```

**참고**: 
- 인증코드 유효기간: 10분
- 인증코드는 한 번만 사용 가능 (사용 후 무효화)
- 비밀번호 재설정 토큰 유효기간: 30분

---

### 6-2. 비밀번호 재설정
**POST** `/api/auth/reset-password`

**인증**: 불필요 (토큰 기반 인증)

**설명**: 토큰을 사용하여 새 비밀번호로 변경합니다.

**요청**:
```json
{
  "email": "john@example.com",
  "token": "reset-token-abc123",
  "newPassword": "newpassword123"
}
```

**요청 필드**:
- `email` (required): 이메일 주소
- `token` (required): 비밀번호 재설정 토큰 (인증코드 확인 시 발급)
- `newPassword` (required): 새 비밀번호 (최소 6자 이상)

**응답**:
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**에러 응답**:
```json
{
  "error": "INVALID_TOKEN",
  "message": "Invalid or expired token"
}
```

**참고**: 
- 토큰 유효기간: 30분
- 토큰은 한 번만 사용 가능 (사용 후 무효화)
- 비밀번호는 해시 처리하여 저장

---

### 7. 프로필 정보 조회
**GET** `/api/auth/profile`

**인증**: NextAuth session (쿠키 기반)

**설명**: 현재 로그인한 사용자의 프로필 정보를 조회합니다.

**응답**:
```json
{
  "profile": {
    "email": "john@example.com",
    "name": "John",
    "familyName": "Doe",
    "birthDate": "1990-01-15",
    "gender": "Male",
    "createdAt": "2025-01-01",
    "profileImageUrl": "https://example.com/profile.jpg"
  }
}
```

**응답 필드 설명**:
- `email`: 사용자 이메일
- `name`: 사용자 이름 (Given Name)
- `familyName`: 사용자 성 (Family Name)
- `birthDate`: 생년월일 (YYYY-MM-DD)
- `gender`: 성별 (`"Male"` 또는 `"Female"`)
- `createdAt`: 계정 생성일 (YYYY-MM-DD)
- `profileImageUrl`: 프로필 사진 URL (선택사항, null 가능)

---

### 7-1. 프로필 정보 업데이트
**PUT** `/api/auth/profile`

**인증**: NextAuth session (쿠키 기반)

**설명**: 현재 로그인한 사용자의 프로필 정보를 업데이트합니다 (이름, 성, 프로필 사진).

**요청** (FormData):
- `name` (required): 사용자 이름
- `familyName` (required): 사용자 성
- `profileImage` (optional): 프로필 사진 파일 (이미지 파일, 최대 5MB)

**응답**:
```json
{
  "profile": {
    "email": "john@example.com",
    "name": "John",
    "familyName": "Doe",
    "birthDate": "1990-01-15",
    "gender": "Male",
    "createdAt": "2025-01-01",
    "profileImageUrl": "https://example.com/profile.jpg"
  }
}
```

**에러 응답**:
```json
{
  "error": "INVALID_INPUT",
  "message": "Name and Family Name are required"
}
```

**참고**: 
- 프로필 사진은 클라우드 스토리지(AWS S3, Cloudinary 등)에 업로드하고 URL만 DB에 저장
- 프로필 사진은 최대 5MB, 이미지 파일만 허용
- 본인의 프로필 정보만 수정 가능

---

### 8. 회원탈퇴
**DELETE** `/api/auth/account`

**인증**: NextAuth session (쿠키 기반)

**설명**: 회원탈퇴를 처리합니다. 확인 텍스트가 정확히 일치해야 합니다.

**요청**:
```json
{
  "confirmText": "I understand"
}
```

**요청 필드**:
- `confirmText` (required): 확인 텍스트 (반드시 "I understand"여야 함)

**응답**:
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**에러 응답**:
```json
{
  "error": "INVALID_INPUT",
  "message": "Confirmation text does not match"
}
```

**참고**: 
- 계정 삭제 후 세션 무효화 필요 (NextAuth `signOut` 호출)
- 로컬 스토리지 및 세션 스토리지의 모든 캐시 데이터 정리
- 소프트 삭제 또는 하드 삭제 방식 선택 가능
- 백엔드에서 DB에서 사용자 데이터 완전 삭제 처리

---

### 9. 1:1 문의 제출
**POST** `/api/inquiry`

**인증**: NextAuth session (쿠키 기반)

**설명**: 사용자가 1:1 문의를 작성하고 제출합니다.

**요청**:
```json
{
  "subject": "Question about device",
  "message": "How do I connect my device?"
}
```

**요청 필드**:
- `subject` (required): 문의 제목
- `message` (required): 문의 내용

**응답**:
```json
{
  "success": true,
  "inquiryId": "inquiry-1234567890"
}
```

**응답 필드 설명**:
- `success`: 제출 성공 여부
- `inquiryId`: 생성된 문의 고유 ID

**에러 응답**:
```json
{
  "error": "INVALID_INPUT",
  "message": "Subject and message are required"
}
```

**참고**: 문의는 관리자가 확인 후 답변 가능

---

## 디바이스 관리 API

### 10. 디바이스 목록 조회
**GET** `/api/devices`

**인증**: NextAuth session (쿠키 기반)

**설명**: 현재 사용자의 모든 디바이스 목록을 조회합니다. 백엔드에서 실제 디바이스(스마트폰과 연결된 디바이스)의 현재 상태를 실시간으로 받아와야 합니다.

**중요**: 
- 백엔드에서 실제 디바이스와 통신하여 현재 상태 정보를 받아와야 함
- 디바이스의 전원 상태, 배터리 잔량, 출력 정보 등은 실시간으로 업데이트되어야 함
- 스마트폰과 디바이스 간의 연결 상태도 확인해야 함

**응답**:
```json
{
  "devices": [
    {
      "id": "manager-1",
      "type": "manager",
      "name": "Mood Manager",
      "battery": 100,
      "power": true,
      "output": {
        "brightness": 85,
        "color": "#FFD966",
        "scentType": "Lavender",
        "scentLevel": 7,
        "volume": 65,
        "nowPlaying": "Calm Breeze"
      }
    },
    {
      "id": "light-1",
      "type": "light",
      "name": "Smart Light 1",
      "battery": 100,
      "power": true,
      "output": {
        "brightness": 75,
        "color": "#FFD966"
      }
    }
  ]
}
```

**응답 필드 설명**:
- `id`: 디바이스 고유 ID
- `type`: 디바이스 타입 (`"manager" | "light" | "scent" | "speaker"`)
- `name`: 디바이스 이름
- `battery`: 배터리 잔량 (0-100)
- `power`: 전원 상태 (true/false)
- `output`: 디바이스 타입별 출력 설정 (타입에 따라 필드가 다름)

---

### 11. 디바이스 생성
**POST** `/api/devices`

**인증**: NextAuth session (쿠키 기반)

**설명**: 새 디바이스를 생성하고 DB에 저장합니다.

**요청**:
```json
{
  "type": "light",
  "name": "Smart Light 2"
}
```

**요청 필드**:
- `type` (required): 디바이스 타입 (`"manager" | "light" | "scent" | "speaker"`)
- `name` (optional): 디바이스 이름 (미제공 시 자동 생성)

**응답**:
```json
{
  "device": {
    "id": "light-1234567890",
    "type": "light",
    "name": "Smart Light 2",
    "battery": 100,
    "power": true,
    "output": {
      "brightness": 70,
      "color": "#FFD966"
    }
  }
}
```

---

### 12. 디바이스 삭제
**DELETE** `/api/devices/:deviceId`

**인증**: NextAuth session (쿠키 기반)

**설명**: 디바이스를 삭제하고 DB에서 제거합니다.

**경로 파라미터**:
- `deviceId`: 삭제할 디바이스 ID

**응답**:
```json
{
  "success": true
}
```

---

### 13. 디바이스 전원 토글
**PUT** `/api/devices/:deviceId/power`

**인증**: NextAuth session (쿠키 기반)

**설명**: 디바이스의 전원 상태를 변경하고 DB를 업데이트합니다. 백엔드에서 실제 디바이스와 통신하여 전원 상태를 변경하며, 디바이스의 현재 상태(전원, 배터리 등)를 실시간으로 받아와야 합니다.

**중요**: 
- 백엔드에서 실제 디바이스(스마트폰과 연결된 디바이스)와 통신하여 전원 상태 변경
- 디바이스의 현재 상태(전원 on/off, 배터리 잔량, 출력 정보 등)를 실시간으로 받아와야 함
- 디바이스가 off 상태여도 전원 버튼 자체는 항상 동일한 색상으로 표시되어야 함 (UI는 디바이스 상태와 독립적)

**경로 파라미터**:
- `deviceId`: 전원을 변경할 디바이스 ID

**요청**:
```json
{
  "power": false
}
```

**요청 필드**:
- `power` (required): 전원 상태 (true/false)

**응답**:
```json
{
  "device": {
    "id": "light-1",
    "type": "light",
    "name": "Smart Light 1",
    "battery": 100,
    "power": false,
    "output": {
      "brightness": 75,
      "color": "#FFD966"
    }
  }
}
```

---

### 13-1. 디바이스 이름 변경
**PUT** `/api/devices/:deviceId/name`

**인증**: NextAuth session (쿠키 기반)

**설명**: 디바이스의 이름을 변경하고 DB를 업데이트합니다.

**경로 파라미터**:
- `deviceId`: 이름을 변경할 디바이스 ID

**요청**:
```json
{
  "name": "My Smart Light"
}
```

**요청 필드**:
- `name` (required): 새 디바이스 이름 (1-50자)

**응답**:
```json
{
  "device": {
    "id": "light-1",
    "type": "light",
    "name": "My Smart Light",
    "battery": 100,
    "power": true,
    "output": {
      "brightness": 75,
      "color": "#FFD966"
    }
  }
}
```

**에러 응답**:
```json
{
  "error": "INVALID_INPUT",
  "message": "Device name is required"
}
```

**참고**: 
- 디바이스 소유자만 이름 변경 가능 (백엔드에서 검증)
- 이름 변경 시 DB 업데이트

---

### 14. 센트 레벨 변경 (레거시)
**PUT** `/api/devices/:deviceId/scent-level`

**인증**: NextAuth session (쿠키 기반)

**설명**: 센트 디바이스의 분사량 레벨을 변경합니다. (레거시 API, 향후 제거 예정)

**참고**: 새로운 분사 주기 API (`/api/devices/:deviceId/scent-interval`) 사용을 권장합니다.

---

### 15. 센트 분사 주기 변경
**PUT** `/api/devices/:deviceId/scent-interval`

**인증**: NextAuth session (쿠키 기반)

**설명**: 센트 디바이스의 분사 주기를 변경합니다 (분 단위). 기본값은 30분입니다.

**경로 파라미터**:
- `deviceId`: 센트 분사 주기를 변경할 디바이스 ID (manager 또는 scent 타입)

**요청**:
```json
{
  "interval": 30
}
```

**요청 필드**:
- `interval` (required): 분사 주기 (분 단위, 5, 10, 15, 20, 25, 30 중 하나)

**응답**:
```json
{
  "device": {
    "id": "manager-1",
    "type": "manager",
    "name": "Mood Manager",
    "battery": 100,
    "power": true,
    "output": {
      "brightness": 85,
      "color": "#FFD966",
      "scentType": "Lavender",
      "scentInterval": 30,
      "volume": 65,
      "nowPlaying": "Calm Breeze"
    }
  }
}
```

---

## 무드 관리 API

### 16. 현재 무드 조회
**GET** `/api/moods/current`

**인증**: NextAuth session (쿠키 기반)

**설명**: 현재 사용자의 활성 무드를 조회합니다.

**응답**:
```json
{
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
  "updatedDevices": [
    {
      "id": "manager-1",
      "type": "manager",
      "name": "Mood Manager",
      "battery": 100,
      "power": true,
      "output": {
        "brightness": 85,
        "color": "#E6F3FF",
        "scentType": "Wave",
        "scentLevel": 7,
        "volume": 65,
        "nowPlaying": "Calm Breeze"
      }
    }
  ]
}
```

**응답 필드 설명**:
- `mood`: 현재 활성 무드 정보
  - `id`: 무드 고유 ID
  - `name`: 무드 이름
  - `color`: 무드 색상 (HEX)
  - `song`: 현재 재생 중인 음악 정보
  - `scent`: 현재 사용 중인 향 정보
- `updatedDevices`: 무드 변경으로 인해 업데이트된 디바이스 목록

---

### 17. 무드 전체 변경
**PUT** `/api/moods/current`

**인증**: NextAuth session (쿠키 기반)

**설명**: 무드를 변경하고 관련 디바이스 상태를 업데이트합니다 (색상, 음악, 향 모두 변경).

**요청**:
```json
{
  "moodId": "focus-1"
}
```

**요청 필드**:
- `moodId` (required): 변경할 무드 ID

**응답**:
```json
{
  "mood": {
    "id": "focus-1",
    "name": "Deep Focus",
    "color": "#F5F5DC",
    "song": {
      "title": "Deep Focus",
      "duration": 240
    },
    "scent": {
      "type": "Musk",
      "name": "Cloud",
      "color": "#F5F5DC"
    }
  },
  "updatedDevices": [
    {
      "id": "manager-1",
      "type": "manager",
      "name": "Mood Manager",
      "battery": 100,
      "power": true,
      "output": {
        "brightness": 85,
        "color": "#F5F5DC",
        "scentType": "Cloud",
        "scentLevel": 7,
        "volume": 65,
        "nowPlaying": "Deep Focus"
      }
    },
    {
      "id": "light-1",
      "type": "light",
      "name": "Smart Light 1",
      "battery": 100,
      "power": true,
      "output": {
        "brightness": 75,
        "color": "#F5F5DC"
      }
    }
  ]
}
```

---

### 18. 센트 변경 (무드 업데이트)
**PUT** `/api/moods/current/scent`

**인증**: NextAuth session (쿠키 기반)

**설명**: 센트 변경으로 인한 무드 업데이트 및 관련 디바이스 상태 업데이트.

**요청**:
```json
{
  "moodId": "calm-2"
}
```

**요청 필드**:
- `moodId` (required): 변경할 무드 ID (같은 무드명의 다른 센트 버전)

**응답**:
```json
{
  "mood": {
    "id": "calm-2",
    "name": "Calm Breeze",
    "color": "#D4E6F1",
    "song": {
      "title": "Ocean Waves",
      "duration": 195
    },
    "scent": {
      "type": "Marine",
      "name": "Shell",
      "color": "#00CED1"
    }
  },
  "updatedDevices": [
    {
      "id": "manager-1",
      "type": "manager",
      "name": "Mood Manager",
      "battery": 100,
      "power": true,
      "output": {
        "brightness": 85,
        "color": "#D4E6F1",
        "scentType": "Shell",
        "scentLevel": 7,
        "volume": 65,
        "nowPlaying": "Ocean Waves"
      }
    }
  ]
}
```

---

### 19. 노래 변경 (무드 업데이트)
**PUT** `/api/moods/current/song`

**인증**: NextAuth session (쿠키 기반)

**설명**: 노래 변경으로 인한 무드 업데이트 및 관련 디바이스 상태 업데이트.

**요청**:
```json
{
  "moodId": "calm-3"
}
```

**요청 필드**:
- `moodId` (required): 변경할 무드 ID (같은 무드명의 다른 노래 버전)

**응답**:
```json
{
  "mood": {
    "id": "calm-3",
    "name": "Calm Breeze",
    "color": "#AED6F1",
    "song": {
      "title": "Gentle Rain",
      "duration": 210
    },
    "scent": {
      "type": "Green",
      "name": "Sprout",
      "color": "#00FF00"
    }
  },
  "updatedDevices": [
    {
      "id": "manager-1",
      "type": "manager",
      "name": "Mood Manager",
      "battery": 100,
      "power": true,
      "output": {
        "brightness": 85,
        "color": "#AED6F1",
        "scentType": "Sprout",
        "scentLevel": 7,
        "volume": 65,
        "nowPlaying": "Gentle Rain"
      }
    }
  ]
}
```

---

### 20. 조명 컬러 변경 (무드 업데이트)
**PUT** `/api/moods/current/color`

**인증**: NextAuth session (쿠키 기반)

**설명**: 조명 컬러 변경으로 인한 무드 업데이트 및 관련 디바이스 상태 업데이트.

**요청**:
```json
{
  "moodId": "energy-1"
}
```

**요청 필드**:
- `moodId` (required): 변경할 무드 ID

**응답**:
```json
{
  "mood": {
    "id": "energy-1",
    "name": "Morning Energy",
    "color": "#FFD700",
    "song": {
      "title": "Sunrise",
      "duration": 180
    },
    "scent": {
      "type": "Citrus",
      "name": "Orange",
      "color": "#FFD700"
    }
  },
  "updatedDevices": [
    {
      "id": "manager-1",
      "type": "manager",
      "name": "Mood Manager",
      "battery": 100,
      "power": true,
      "output": {
        "brightness": 85,
        "color": "#FFD700",
        "scentType": "Orange",
        "scentLevel": 7,
        "volume": 65,
        "nowPlaying": "Sunrise"
      }
    },
    {
      "id": "light-1",
      "type": "light",
      "name": "Smart Light 1",
      "battery": 100,
      "power": true,
      "output": {
        "brightness": 75,
        "color": "#FFD700"
      }
    }
  ]
}
```

---

## 에러 응답

모든 API는 다음 형식의 에러 응답을 반환할 수 있습니다:

```json
{
  "error": "ErrorCode",
  "message": "에러 메시지"
}
```

**HTTP 상태 코드**:
- `200 OK`: 성공
- `400 Bad Request`: 잘못된 요청 (필수 필드 누락, 잘못된 데이터 타입 등)
- `401 Unauthorized`: 인증 실패 (세션 만료, 로그인 필요)
- `404 Not Found`: 리소스를 찾을 수 없음 (존재하지 않는 디바이스 ID, 무드 ID 등)
- `500 Internal Server Error`: 서버 오류

**에러 예시**:
```json
{
  "error": "DEVICE_NOT_FOUND",
  "message": "디바이스를 찾을 수 없습니다."
}
```

```json
{
  "error": "INVALID_MOOD_ID",
  "message": "유효하지 않은 무드 ID입니다."
}
```

```json
{
  "error": "UNAUTHORIZED",
  "message": "인증이 필요합니다."
}
```

---

## 데이터 타입 상세

### DeviceType
```typescript
type DeviceType = "manager" | "light" | "scent" | "speaker"
```

### Device
```typescript
interface Device {
  id: string                    // 디바이스 고유 ID
  type: DeviceType              // 디바이스 타입
  name: string                  // 디바이스 이름
  battery: number               // 배터리 잔량 (0-100)
  power: boolean                // 전원 상태
  output: {
    brightness?: number         // 조명 밝기 (0-100, light/manager만)
    color?: string              // 색상 HEX 코드 (light/manager만)
    scentType?: string          // 향 타입 이름 (scent/manager만)
    scentLevel?: number         // 향 분사량 레벨 (1-10, scent/manager만, 레거시)
    scentInterval?: number      // 향 분사 주기 (분 단위, 5/10/15/20/25/30, 기본값 30, scent/manager만)
    volume?: number             // 음량 (0-100, speaker/manager만)
    nowPlaying?: string         // 현재 재생 중인 음악 제목 (speaker/manager만)
  }
}
```

### Mood
```typescript
interface Mood {
  id: string                    // 무드 고유 ID
  name: string                  // 무드 이름
  color: string                 // 무드 색상 (HEX)
  song: {
    title: string               // 음악 제목
    duration: number            // 음악 길이 (초)
  }
  scent: {
    type: string                // 향 타입 (Musk, Aromatic, Woody 등)
    name: string                // 향 이름 (Cloud, Lavender, Wood 등)
    color: string               // 향 색상 (HEX)
  }
}
```

---

## 사용 예시

### 디바이스 생성 예시
```javascript
const response = await fetch("/api/devices", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({
    type: "light",
    name: "Smart Light 2"
  })
});
const data = await response.json();
```

### 무드 변경 예시
```javascript
const response = await fetch("/api/moods/current", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({
    moodId: "focus-1"
  })
});
const data = await response.json();
```

---

## API 구조 요약

총 20개의 API 엔드포인트:
- **인증 API**: 11개 (회원가입, 로그인, 설문 조사 확인, 로그아웃, 소셜 로그인, 비밀번호 찾기(인증코드 전송), 인증코드 확인, 비밀번호 재설정, 프로필 조회, 회원탈퇴, 1:1 문의)
- **디바이스 관리 API**: 7개 (조회, 생성, 삭제, 전원 토글, 이름 변경, 센트 레벨 변경(레거시), 센트 분사 주기 변경)
- **무드 관리 API**: 5개 (조회, 전체 변경, 센트 변경, 노래 변경, 컬러 변경)

---

## 주의사항

1. **인증 관련**:
   - 회원가입 및 로그인 API는 인증이 필요하지 않습니다.
   - 소셜 로그인은 NextAuth가 자동으로 처리하므로 별도 구현이 필요하지 않습니다.
   - 로그인 성공 시 `hasSurvey` 값에 따라 `/home`에서 설문지 출력 여부를 결정합니다.

2. **디바이스 및 무드 관리**:
   - 모든 API는 사용자별로 동작합니다. 다른 사용자의 디바이스나 무드에 접근할 수 없습니다.
   - 무드 변경 시 관련 디바이스(Manager, Light)의 상태가 자동으로 업데이트됩니다.
   - 디바이스 삭제 시 해당 디바이스와 연관된 모든 데이터가 함께 삭제됩니다.
   - 센트 레벨 변경은 Manager 또는 Scent 타입 디바이스에만 적용됩니다.
