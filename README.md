# Mood Manager

### AI-Based Personalized Mood Management System for Smart Homes

#### 📄 API Specification (v1)

Watch Repository: [mood-manager-watch](https://github.com/Ma-Hyekjin/mood-manager-watch.git)
API Docs: [Mood Manager – API Specification v1](https://www.notion.so/Mood-Manager-API-Specification-v1-2b1739c2f15880a0bafcfdc063069488)

-----

## Overview

**Mood Manager** is the core service that operates a virtual output device called the **Manager**, which is capable of producing and controlling lighting, scents, and sound within the simulated home environment. The entire system pipeline is designed under the assumption that this Manager device exists as the final output layer of the project.

The service analyzes biometric signals collected from the WearOS device (such as HRV and stress indicators), audio events (laughter/sigh detection), user preferences, and external factors such as weather. Using these combined inputs, the system infers a personalized mood state and drives the Manager device accordingly. This platform was developed as part of the Hanyang University Software Engineering course in collaboration with LG Electronics, following the pipeline: **WearOS → Firebase → ML Analysis Server → Next.js WebApp → OpenAI (Few-shot)**.

## 소개

**무드매니저(Mood Manager)**는 WearOS 기기에서 수집된 생체 정보와 음성 이벤트를 기반으로 사용자의 심리·신체 상태를 분석하고, 이에 최적화된 조명·향기·소리 환경을 추천하는 멀티모달 AI 서비스입니다.

디바이스 'Manager'를 운용하는 핵심 서비스이며, Manager는 조명·향기·소리를 출력/제어하는 본 프로젝트의 가상 디바이스입니다. 본 프로젝트의 흐름은 해당 디바이스의 사용을 전제로 합니다.

사용자의 생체 신호(HRV, 스트레스 지표), 음성 이벤트(웃음/한숨 감지), 개인 선호도, 그리고 날씨와 같은 외부 요인을 종합하여 개인화된 무드 상태를 추론합니다. 본 프로젝트는 한양대학교 소프트웨어공학(LG전자 산학협력) 과제의 일환으로 수행되었으며, **WearOS → Firebase → ML 분석 서버 → Next.js 웹앱 → OpenAI (Few-shot)** 파이프라인을 기반으로 동작되도록 설계되었습니다.

-----

## System Architecture

### 1. WearOS Layer

  * **Kotlin-based native app:** An application optimized specifically for wearable devices.
  * **Health Services API:** Collects real-time heart rate, HRV indicators, stress metrics, and movement data.
  * **Audio processing:** Captures 2-second audio using AudioRecord, calculates RMS/dBFS to filter silent segments, and converts PCM audio into WAV/Base64.
  * **Foreground Service:** Maintains a stable 1-minute background loop to collect data continuously.
  * **Data Upload:** Sends collected biometric and audio data to user-specific collections in Firestore.

### 2. Firebase Layer

  * **Real-time data bridge:** Relays data between the wearable device, ML server, and Web App.
  * **Data structure:**
      * `users/{userId}/raw_periodic/{docId}` – biometric data  
      * `users/{userId}/raw_events/{docId}` – audio events (Base64 WAV)

### 3. ML Python Microservice

  * **Audio classification:** Retrieves Base64 WAV data stored in Firestore.
  * **Analysis:** Classifies events into laughter, sigh, or false-positive (noise).
  * **Result delivery:** Sends validated classification results (timestamp + type) back to the Web App.

### 4. Web Application Layer (Next.js)

  * **Data retrieval:** Receives biometric data and ML-classified audio events from Firestore.
  * **Preprocessing:** Converts biometric and audio data into valid numerical features and merges them with user preferences and external information such as weather.
  * **AI inference:** Determines mood attributes (music, lighting color, scent, interval) based on biometric and emotion data, then generates a creative mood name using OpenAI Few-shot techniques that reflects the mood's characteristics (e.g., "bright sky", "blooming love").
  * **Dashboard:** Visualizes the final inferred mood and simulates home environment control through the Manager device.

-----

## 시스템 아키텍처

### 1. WearOS 계층

  * **Kotlin 기반 네이티브 앱:** 웨어러블 기기에 최적화된 애플리케이션입니다.
  * **Health Services API:** 심박수, HRV, 스트레스 지표, 움직임 데이터를 실시간으로 수집합니다.
  * **오디오 처리:** AudioRecord를 통해 2초간 음성을 캡처하고, RMS/dBFS를 계산하여 무음 구간을 필터링한 뒤 PCM 데이터를 WAV/Base64로 변환합니다.
  * **포그라운드 서비스:** 1분 주기의 루프를 통해 백그라운드에서도 안정적으로 데이터를 수집합니다.
  * **데이터 업로드:** 수집된 생체 및 오디오 데이터를 Firestore의 사용자별 컬렉션에 업로드합니다.

### 2. Firebase 계층

  * **실시간 데이터 브릿지:** 웨어러블, ML 서버, 웹 앱 간의 데이터 흐름을 중계합니다.
  * **데이터 구조:**
      * `users/{userId}/raw_periodic/{docId}`: 생체 데이터
      * `users/{userId}/raw_events/{docId}`: 오디오 이벤트 (Base64 WAV)

### 3. ML Python 마이크로서비스

  * **오디오 분류:** Firestore에 저장된 Base64 WAV 데이터를 가져옵니다.
  * **분석:** 데이터를 웃음, 한숨, 또는 오탐(소음)으로 분류합니다.
  * **결과 반환:** 검증된 이벤트 분류 결과(시간 + 한숨/웃음)를 웹 앱으로 전달합니다.

### 4. 웹 애플리케이션 계층 (Next.js)

  * **데이터 수집:** Firestore에서 생체 데이터와 ML 분류가 완료된 오디오 이벤트를 수신합니다.
  * **전처리:** 생체/음성 데이터를 유효한 수치형 데이터로 전처리합니다. 이후 사용자 선호도와 날씨 등 외부 데이터를 결합합니다.
  * **AI 추론:** 생체 데이터와 감정 데이터를 기반으로 무드 속성(음악, 조명색, 향, 주기)을 결정하고, OpenAI Few-shot을 활용해 무드의 특성을 반영한 창의적인 이름을 생성합니다 (예: "bright sky", "blooming love").
  * **대시보드:** 최종 결정된 무드를 시각화하고 홈 환경 제어를 시뮬레이션합니다.
-----

                     ┌──────────────────────────┐
                     │       Wear OS App        │
                     │  - Heart Rate / HRV      │
                     │  - Stress Indicators     │
                     │  - Audio (WAV Base64)    │
                     │  - Foreground Services   │
                     └────────────┬─────────────┘
                                  │
                                  ▼
                     ┌───────────────────────────┐      ┌──────────────────────────┐
                     │     Firebase Firestore    │      │      ML Python Server    │
                     │  users/{uid}/raw_periodic │      │  - Fetch Firestore audio │     
                     │  users/{uid}/raw_events   │────▶ │  - Laughter/Sigh detect  │
                     │ (Realtime Sync Bridge)    │      │  - POST result → WebApp  │
                     └────────────┬──────────────┘      └────────────┬─────────────┘
                                  │                                  │
                                  │  (biometric)                     │
                                  ▼                                  │
            ┌────────────────────────────────────────────────┐       │ 
            │                 Next.js Web App                │       │
            │  (Core Processing & Aggregation Layer)         │       │
            │                                                │       │
            │  - Fetch biometric (Firestore raw_periodic)    │       │
            │  - Receive ML classification result (POST)     │────────   
            │  - Merge: biometric + audio + prefs + weather  │
            │  - Determine mood attributes                    │
            │  - Generate mood name with OpenAI (Few-shot)    │
            │                                                │
            └─────────────────────┬──────────────────────────┘
                                  │ prompt
                                  ▼
                ┌──────────────────────────────────┐
                │     OpenAI Few-shot              │
                │   - Mood inference               │
                │   - Lighting / Scent / Sound     │
                │   - Output JSON mood profile     │
                └─────────────────┬────────────────┘
                                  │
                                  │  final mood result
                                  ▼
          ┌──────────────────────────────────────────────┐
          │          Mood Output (WebApp UI)             │
          │  - Mood Dashboard                            │
          │  - Dynamic Theme Color                       │
          │  - Music Player (Recommended)                │
          │  - Scent Level Controller                    │
          │  - Device Grid (2×N expand cards)            │
          └───────────────────────┬──────────────────────┘
                                  │
                                  │  store final result
                                  ▼
                       ┌──────────────────────────┐
                       │        MySQL DB          │
                       │  - Mood history          │
                       │  - User state snapshots  │
                       │  - Device states log     │
                       └──────────────────────────┘

-----

## Data Pipeline Structure

### WearOS Data Models

**1. `raw_periodic` (Biometric Data / 생체 데이터)**

```json
{
  "heart_rate_avg": "Average Heart Rate (bpm)",
  "heart_rate_max": "Max Heart Rate",
  "heart_rate_min": "Min Heart Rate",
  "hrv_sdnn": "Heart Rate Variability (Stress Indicator)",
  "movement_count": "Movement intensity",
  "respiratory_rate_avg": "Average Respiratory Rate",
  "is_fallback": "Boolean (True if sensor fails)",
  "timestamp": "Server Timestamp"
}
```

**2. `raw_events` (Audio Events / 오디오 이벤트)**

```json
{
  "audio_base64": "Encoded Audio Data (Nullable)",
  "event_dbfs": "Decibels relative to full scale",
  "event_duration_ms": "Duration of the event",
  "event_type_guess": "laughter | sigh | unknown",
  "is_fallback": "Boolean",
  "timestamp": "Server Timestamp"
}
```

-----

## Web Application Structure

### Directory Map

```bash
mood-manager/
 ├── docs/                      # Documentation
 │   ├── README.md             # Documentation index
 │   ├── API_SPECIFICATION.md  # API Specification
 │   ├── PROJECT_STRUCTURE.md  # Project structure guide
 │   ├── SETUP_GUIDE.md        # Installation and setup guide
 │   └── DEVELOPMENT_NOTES.md  # Development notes (integrated)
 ├── public/                    # Static Assets
 │   ├── icons/                # Icon files
 │   └── logos/                # Logo files
 └── src/
     ├── app/                   # Next.js App Router
     │   ├── (auth)/            # Authentication Routes
     │   │   ├── login/         # Login Page
     │   │   ├── register/      # Registration Page
     │   │   └── forgot-password/ # Forgot Password Page
     │   ├── (main)/            # Protected Routes
     │   │   ├── home/          # Home Dashboard
     │   │   │   ├── components/ # Page-specific Components
     │   │   │   │   ├── Device/ # Device Components
     │   │   │   │   ├── MoodDashboard/ # Mood Dashboard
     │   │   │   │   └── SurveyOverlay/ # Survey Overlay
     │   │   │   └── page.tsx   # Home Page
     │   │   └── mypage/        # User Profile Page
     │   │       ├── qna/       # Q&A Page
     │   │       ├── inquiry/   # 1:1 Inquiry Page
     │   │       └── privacy/   # Privacy Policy Page
     │   ├── api/               # API Routes
     │   │   ├── auth/          # Authentication APIs
     │   │   ├── devices/       # Device Management APIs
     │   │   ├── moods/         # Mood Management APIs
     │   │   ├── inquiry/       # Inquiry APIs
     │   │   └── ai/            # AI-related APIs
     │   ├── layout.tsx         # Root Layout
     │   └── page.tsx           # Splash Page
     ├── components/             # Shared Components
     │   ├── navigation/        # Navigation Components
     │   └── ui/                # Reusable UI Components
     ├── lib/                    # Utilities & Configurations
     │   ├── firebase.ts        # Firebase Configuration
     │   ├── prisma.ts          # Database ORM
     │   ├── utils.ts           # Utility Functions
     │   ├── aws.ts             # AWS Integration
     │   └── openai.ts          # AI Mood Name Inference
     ├── types/                  # TypeScript Type Definitions
     │   ├── device.ts          # Device Types
     │   └── mood.ts            # Mood Types
     ├── hooks/                  # Custom React Hooks
     ├── styles/                 # Global Styles
     └── prisma/                 # Prisma Schema & Migrations
         └── schema.prisma      # Database Schema
```

### Key Features

  * **Login System:** Email/Password authentication with rate limiting (5 failed attempts → 15min lock), enter-to-submit support, session-based access control, and social login (Google, Kakao, Naver). Forgot password functionality with email-based reset link. Supports mock/real API switching.
  * **Registration System:** Complete registration form with Family Name, Name, Date of Birth, Gender fields. Real-time validation with visual feedback (email format, password strength, password match). Auto-formatting for date input (yyyy.mm.dd). Automatic session creation and redirect to home page.
  * **Survey Flow:** Initial user preference collection via popup overlay on home page (skippable). Defaults are applied if skipped. Survey status checked on home page load.
  * **Home Dashboard:** Displays the inferred mood, offering environment presets (10 moods, 12 scents, 8 lighting colors) and a device control grid (2×N expandable cards). Full device management (add, delete, power toggle, scent interval control).
  * **Mood Management:** Complete mood control system with full change, scent change, song change, and color change capabilities. Real-time device state updates.
  * **My Page:** User profile information, Q&A, 1:1 inquiry, privacy policy, and account deletion with confirmation.
  * **API System:** All API routes implemented with mock responses. Ready for backend integration (code commented, ready to uncomment).

-----

## Features & Roadmap

### **P1 – Environment Setup & Core Pipeline**

  * [x] Next.js + Tailwind Project Initialization
  * [x] WearOS Project Configuration
  * [x] Firestore Database Structure Design (`users/{uid}/raw_periodic`, `users/{uid}/raw_events`)
  * [x] WearOS ForegroundService Implementation
  * [x] Health Services Integration (HR, HRV, Stress monitoring)
  * [x] Audio Pipeline (AudioRecord → WAV → Base64)
  * [x] Firestore Upload Pipeline Completion
  * [x] WebApp App Router Structure Setup
  * [x] Login Page & Session Management Implementation
  * [x] Registration Page Implementation (Family Name, Name, Date of Birth, Gender fields)
  * [x] Email & Password Validation with Visual Feedback
  * [x] Rate Limiting for Login (5 failed attempts → 15min lock)
  * [x] Social Login Integration (Google, Kakao, Naver via NextAuth)
  * [x] Forgot Password Functionality (Email-based reset link)
  * [x] My Page Implementation (Profile, Q&A, 1:1 Inquiry, Privacy Policy, Account Deletion)
  * [x] API Routes Structure Complete (Auth, Devices, Moods, Inquiry)
  * [x] Mock System Implementation (Frontend & API Routes)
  * [x] Project Structure Refactoring (Standard Next.js structure)

### **P2 – Data Integration & Mood Pipeline**

  * [x] `raw_periodic` Data Stabilization
  * [x] `raw_events` Data Stabilization & DB Schema Finalization
  * [ ] ML Python Server Setup (Base64 WAV → Laughter/Sigh Classification)
  * [ ] ML Server Data Retrieval Pipeline
  * [ ] ML Result Integration with WebApp
  * [ ] WebApp Data Preprocessing (Biometric + ML Results + Preferences + Weather)
  * [ ] OpenAI Few-shot Mood Name Inference Pipeline
  * [x] Survey UI & Preference Storage Logic (SurveyOverlay component, home page popup)
  * [x] Home Dashboard v1 (Mood Display, Lighting/Scent/Sound Indicators)
  * [x] Device Management System (Add, Delete, Power Toggle, Scent Interval Control)
  * [x] Mood Management System (Full Change, Scent Change, Song Change, Color Change)
  * [x] My Page System (Profile, Q&A, 1:1 Inquiry, Privacy Policy, Account Deletion)
  * [x] API Routes Implementation (All endpoints with mock responses)
  * [x] Backend API Integration Preparation (All routes ready for backend connection)

### **P3 – Enhancement & Release**

  * [x] Mock System Complete (Frontend & API Routes)
  * [x] API Validation Complete (All endpoints verified)
  * [x] Responsive Design Implementation (375px width optimized)
  * [ ] Mood Selection v2 (LLM Quality Improvement + Rule-based Hybrid)
  * [ ] UI Polish & Mood Library Expansion
  * [ ] Device Simulation Upgrades
  * [ ] Backend Server Integration (Replace mock with real API calls)
  * [ ] AWS Deployment (Amplify)
  * [ ] End-to-End Testing (WearOS → Firestore → ML → WebApp → OpenAI)

-----

## Getting Started

### 필수 요구사항

- **Node.js**: 18.x 이상 (권장: 22.21.0)
- **npm**: 8.x 이상 (권장: 10.9.4)

**Node.js 버전 확인**:
```bash
node --version
```

**nvm 사용 시** (프로젝트 루트에 `.nvmrc` 파일 포함):
```bash
nvm use
```

### 설치 및 실행

1. **의존성 설치:**

    ```bash
    npm install
    ```

2. **환경 변수 설정:**

    프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

    ```env
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-secret-key-here
    ```

    자세한 환경 변수 설정은 `docs/SETUP_GUIDE.md`를 참고하세요.

3. **개발 서버 실행:**

    ```bash
    npm run dev
    ```

    브라우저에서 `http://localhost:3000`으로 접속할 수 있습니다.

### 상세 설치 가이드

자세한 설치 방법, 문제 해결, 버전 정보는 **[docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)**를 참고하세요.

-----

## Backend Integration Guide

### Overview

The frontend Next.js API routes act as a proxy to the backend server. All API routes are prepared with mock responses and can be switched to real backend calls by uncommenting the backend integration code.

### Environment Variables

```env
BACKEND_URL=http://localhost:8000
# or
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Backend API Endpoints Required

The backend server should implement the following APIs (see `docs/API_SPECIFICATION.md` for detailed specifications):

- **Authentication APIs**: Register, Login, Survey Status, Survey Submit, Survey Skip, Forgot Password, Profile, Account Deletion
- **Device Management APIs**: List, Create, Delete, Power Toggle, Scent Interval
- **Mood Management APIs**: Get Current, Update Full, Update Scent, Update Song, Update Color
- **Inquiry APIs**: Submit 1:1 Inquiry

### Session Management

- NextAuth sessions are managed via cookies
- Cookies are automatically forwarded to the backend server
- Alternatively, JWT tokens can be used via Authorization header

### Switching from Mock to Real API

1. Set `BACKEND_URL` environment variable
2. Uncomment backend integration code in API route files
3. Remove mock response code
4. Test API connectivity


-----

## Documentation

자세한 문서는 `docs/` 디렉토리를 참고하세요.

### 주요 문서
- `docs/API_SPECIFICATION.md` - Complete API specification (21 endpoints)
- `docs/PROJECT_STRUCTURE.md` - Project structure guide
- `docs/SETUP_GUIDE.md` - Installation and setup guide
- `docs/DEVELOPMENT_NOTES.md` - 프로젝트 개발 과정의 주요 결정사항, 아키텍처 설계, 이슈 해결 과정 기록

전체 문서 목록은 `docs/README.md`를 참고하세요.

-----

## Team

| Name (KOR) | Name (ENG) | Department | Email |
| :--- | :--- | :--- | :--- |
| 마혁진 | Hyeokjin Ma | Information Systems | tema0311@hanyang.ac.kr |
| 박새연 | Saeyeon Park | Information Systems | saeyeon0317@hanyang.ac.kr |
| 안준성 | Junseong Ahn | Information Systems | lljs1113@hanyang.ac.kr |
| 채희주 | Heejoo Chae | Information Systems | heeju0203@hanyang.ac.kr |
| 최현우 | Hyeonwoo Choi | Information Systems | hhyyrr0713@hanyang.ac.kr |
