# 무드매니저 (Mood Manager)


### AI-Based Personalized Mood Management System for Smart Homes

---

## Proposal

“Mood Manager,” is an AI-powered active multimodal wellness platform that analyzes users’ biometric signals collected through wearable devices (Wear OS) to automatically provide an environment optimized for their physical and emotional state. It integrates multimodal data such as heart rate, HRV, voice characteristics, and motion to infer the user’s mood and automatically adjust various environmental elements, including lighting, scent, and sound.

This project is a team effort within the Hanyang University Software Engineering course (in collaboration with LG Electronics). Utilizing a **`Wear OS (Native)` - `Firebase (Cloud Bridge)` - `Next.js Web App (Cloud Hosted)`** 3-Tier architecture, it aims to realize natural interaction between humans and intelligent devices, demonstrating how AI can support focus, relaxation, and mental well-being by exploring the technical possibilities.



## 제안
'무드매니저(Mood Manager)'는 웨어러블 기기를 통해 수집된 사용자의 생체 신호를 분석하여, 개인의 현재 상태에 최적화된 환경(조명, 향기, 소리)을 자동으로 제공하는 AI 기반 능동형 멀티모달 웰니스 플랫폼이다.

본 프로젝트는 한양대학교 소프트웨어공학 (LG전자 산학협력) 과정의 팀 프로젝트이다.

**`Wear OS (Native)` - `Firebase (Cloud Bridge)` - `Next.js Web App (Cloud Hosted)`** 3-Tier 아키텍처를 통해 사용자와 지능형 기기 간의 자연스러운 상호작용을 구현하고, AI가 사용자의 집중, 이완, 정신 건강 증진을 어떻게 지원할 수 있는지 기술적 가능성을 탐색하는 것을 목표로 한다.

---
## 🏗️ 시스템 아키텍처 (System Architecture)

본 프로젝트는 다음과 같은 3-Tier 구조로 설계된다.

1.  **Wearable (Wear OS - Data Collection):**
    * `Kotlin` 네이티브 앱으로 구현.
    * `Health Connect API` 및 `AudioRecord`를 통해 생체 신호 및 음성 데이터를 실시간으로 수집.
    * `Porcupine SDK`를 이용해 온디바이스 웨이크 워드를 감지.
    * 수집/처리된 데이터를 Firebase Firestore로 전송.
2.  **Cloud Bridge (Firebase Firestore):**
    * Wear OS 앱과 Next.js 웹 앱 간의 실시간 데이터 중계 역할을 수행.
    * `onSnapshot` 리스너를 통해 데이터 변경 사항을 웹 앱에 즉시 푸시(push).
3.  **Web Application (Next.js - Dashboard & Control Logic):**
    * `TypeScript`와 `Next.js (App Router)` 기반
    * Firestore로부터 실시간 데이터를 수신하여 사용자 상태를 시각화(대시보드)
    * 수신된 데이터를 바탕으로 Rule-based AI 모델을 통해 사용자에게 필요한 '무드 상태'를 추천.
    * 선택된 무드 상태에 따라 조명/향/음향 제어 명령을 시뮬레이션.
    * **AWS**를 통해 클라우드에 호스팅.

---

## 🛠️ 기술 스택 (Tech Stack)

* **Frontend (Web App)**:
    * Framework: `Next.js 14+ (App Router)`
    * Language: `TypeScript`
    * UI: `React`, `Tailwind CSS`, `Shadcn/ui`
    * Data Visualization: `Chart.js` (or Recharts/Nivo)
    * State Management: React Context API / Zustand (필요시)
* **Backend Logic (Web App / Cloud)**:
    * Runtime: `Node.js` (via Next.js)
    * API: `Next.js Route Handlers` 또는 `Server Actions`
    * AI Model: Rule-based (implemented in TypeScript/Node.js)
    * (Optional) Serverless: `AWS Lambda`
* **Wearable (Wear OS App)**:
    * Language: `Kotlin`
    * Platform: `Android / Wear OS SDK`
    * Key APIs/SDKs: `Health Connect API`, `AudioRecord`, `Porcupine SDK`, `Firebase SDK (Kotlin)`
    * Background: `ForegroundService`
* **Cloud Platform & Database**:
    * Realtime Bridge & DB: `Firebase Firestore`
    * Hosting (Web App): `AWS` (Service TBD: e.g., Amplify, EC2, Vercel for Next.js)

---

## ✨ 주요 기능 및 개발 로드맵 (Features & Roadmap)

단계별 목표 달성을 통해 최종 MVP를 완성.

### P1: 환경 설정 및 기본 파이프라인 구축 (Environment Setup & Basic Pipeline)

각 플랫폼의 기본 환경을 설정하고 데이터가 흐를 수 있는 최소한의 통로 세팅.

* [x] **프로젝트 초기 설정**: Next.js (TS, Tailwind), Android Studio (Kotlin, Wear OS) 환경 구성
* [ ] **Firebase 설정**: Firestore 데이터베이스 활성화 및 기본 데이터 구조 설계 (`users/{userId}/moodData` 등)
* [ ] **[Wear OS] 기본 앱 구조**: `ForegroundService` 골격, 마이크/센서 권한 요청 로직 구현
* [ ] **[Wear OS] 데이터 전송 (Dummy)**: Wear OS 앱에서 Firestore로 임시 데이터(`update`) 전송 기능 구현 (e.g., 버튼 클릭 시)
* [ ] **[WebApp] 데이터 수신 (Listener)**: Next.js 앱에서 `useEffect` 내 `onSnapshot`을 사용하여 Firestore 데이터를 받아 콘솔에 출력하는 기능 구현
* [ ] **[WebApp] 기본 레이아웃**: 메인 대시보드 UI 구조 (차트 영역, 제어 영역 등) 구현 (`Shadcn/ui` 활용)

### P2: 핵심 데이터 연동 및 Rule-Engine 구현 (Core Data Integration & Rule Engine)

실제 데이터를 연동하고, 상태를 추론하는 기본 로직 설계.

* [ ] **[Wear OS] Health Connect 연동**: 스트레스 지수, 심박수 등 1\~2개 핵심 생체 데이터 수집 및 Firestore 전송
* [ ] **[Wear OS] Wake Word 연동**: `Porcupine SDK` 연동하여 키워드 감지 시 Firestore에 이벤트 전송
* [ ] **[WebApp] 실시간 대시보드**: Firestore에서 받은 실제 데이터를 `Chart.js` 등을 이용해 시각화
* [ ] **[WebApp/Backend] Rule-based 상태 추론 엔진 v1**: 수신된 데이터(스트레스, 키워드 등) 기반으로 간단한 규칙(if/else)을 통해 '무드 상태' 추론 로직 구현 (Next.js API Route 또는 lib 폴더 내)
* [ ] **[WebApp] 제어 로직 시뮬레이션 v1**: 추론된 '무드 상태'에 따라 UI 상에서 조명/향/음향 아이콘 또는 상태 텍스트 변경

### P3: 기능 고도화 및 배포 (Enhancement & Deployment)

더 많은 데이터를 활용 + AI 로직을 개선을 통해 실제 배포 환경 구축.

* [ ] **[Wear OS] 추가 데이터 연동**: 음성 특징(톤/속도 분석 - 기본) 등 추가 데이터 수집 및 전송
* [ ] **[WebApp/Backend] Rule-based 상태 추론 엔진 v2**: 더 많은 입력 데이터를 고려하여 규칙 정교화
* [ ] **[WebApp] 사용자 인터페이스 개선**: 무드 라이브러리, 디바이스 관리 등 부가 기능 UI 구현 (Mock API 또는 실제 연동)
* [ ] **[Deployment] AWS 배포**: Next.js 웹 앱을 AWS (Amplify 또는 선택한 서비스)에 배포
* [ ] **[Test] End-to-End 테스트**: Wear OS 데이터 발생부터 Web App UI 변경까지 전체 흐름 테스트 및 안정화

---

## 🚀 시작하기 (Getting Started)

*(For Next.js Web Application)*

1.  **Clone the repository:**
    ```bash
    git clone [GITHUB_REPOSITORY_URL]
    cd mood-manager-webapp # Assuming the web app is in a subfolder or separate repo
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:** Create a `.env.local` file with Firebase credentials etc.
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) with your browser.

*(Instructions for Wear OS app setup can be added separately or linked here)*
---

## 👨‍💻 팀 (Team)

| Name (KOR) | Name (ENG) | Department | Email |
|-------------|-------------|-------------|-----------------------------|
| 마혁진 | Hyeokjin Ma | Dept. of Information Systems | tema0311@hanyang.ac.kr |
| 박새연 | Saeyeon Park | Dept. of Information Systems | saeyeon0317@hanyang.ac.kr |
| 안준성 | Junseong Ahn | Dept. of Information Systems | lljs1113@hanyang.ac.kr |
| 채희주 | Heejoo Chae | Dept. of Information Systems | heeju0203@hanyang.ac.kr |
| 최현우 | Hyeonwoo Choi | Dept. of Information Systems | hhyyrr0713@hanyang.ac.kr |