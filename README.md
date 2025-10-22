# 무드매니저 (Mood Manager)

'무드매니저(Mood Manager)'는 웨어러블 기기를 통해 수집된 사용자의 생체 신호를 분석하여, 개인의 현재 상태에 최적화된 환경(조명, 향기, 소리)을 자동으로 제공하는 AI 기반 능동형 멀티모달 웰니스 플랫폼이다.

본 프로젝트는 한양대학교 소프트웨어공학 (LG전자 산학협력) 과정의 팀 프로젝트이다.

---

## 🛠️ 기술 스택 (Tech Stack)

* **Framework**: Next.js 14+ (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS & Shadcn/ui
* **State Management**: React Query (Server State), Zustand (Client State)
* **Data Visualization**: Chart.js (또는 D3.js)
* **Deployment**: Vercel
* **Backend**: Next.js Route Handlers (Option 1)
* **Database**: Vercel Postgres (Option 1)

---

## ✨ 주요 기능 및 개발 로드맵 (Features & Roadmap)

개발 우선순위(P1, P2, P3)에 따라 기능을 정렬하고 진행 상황을 체크합니다.

### P1: 핵심 웹 애플리케이션 기반 (MVP)

가장 먼저 사용자에게 보여줄 수 있는 최소 기능 단위(MVP)를 구축합니다.

* [ ] **프로젝트 초기 설정**: Next.js 14+, TypeScript, Tailwind CSS, Shadcn/ui 기본 환경 구성
* [ ] **메인 레이아웃 구현**: 공통 Header, Sidebar, Footer 등 기본 UI 구조 설계
* [ ] **[WebApp] 프리셋 관리 (UI + Mock API)**: 사용자가 환경(조명/향기/소리) 조합을 '프리셋'으로 저장/수정/삭제하는 페이지 (CRUD)
* [ ] **[WebApp] 기기 연동 및 관리 (UI + Mock API)**: 제어할 IoT 기기를 등록/관리하는 페이지 (CRUD)
* [ ] **[WebApp] 메인 대시보드 (UI)**: 현재 상태 및 생체 신호를 보여줄 차트 컴포넌트 배치 (Static/Mock Data 활용)
* [ ] **(Optional) 사용자 인증 (UI)**: 로그인 / 회원가입 페이지 UI 구현

### P2: 백엔드 연동 및 핵심 기능 구현

Mock API를 실제 동작하는 백엔드 API로 교체하고 데이터를 연동합니다.

* [ ] **[Backend] API 라우트 개발**: Next.js Route Handlers를 사용하여 프리셋, 기기 관리 API 실제 구현
* [ ] **[Backend] 데이터베이스 스키마 설계**: Vercel Postgres 연동 및 사용자, 프리셋, 기기 테이블 생성
* [ ] **[WebApp] 상태 관리 적용**: React Query(서버) 및 Zustand(클라이언트)를 사용한 전역 상태 관리
* [ ] **[WebApp] 대시보드 데이터 바인딩**: API를 통해 실제 데이터(또는 시뮬레이션 데이터)를 받아와 차트 업데이트
* [ ] **[Control] IoT 기기 제어 로직 (시뮬레이션)**: 프리셋 선택 시 백엔드에 제어 요청을 보내는 로직 (백엔드는 콘솔 로그 또는 Mock 제어)

### P3: 데이터 수집 및 능동형 제어 (고도화)

프로젝트의 핵심 목표인 '능동형 제어'를 구현합니다.

* [ ] **[Data] 생체 신호 수신부 (Mock)**: 웨어러블 기기로부터 데이터를 받는 API 엔드포인트 구현 (초기에는 Mock Data 수신)
* [ ] **[Analysis] 사용자 상태 추론 엔진 (Rule-based)**: 수신된 Mock 데이터를 기반으로 '집중', '이완', '불안' 등 상태 추론 로직 (초기 버전)
* [ ] **[WebApp] 실시간 대시보드 구현**: Server-Sent Events (SSE) 또는 WebSocket을 사용하여 추론된 상태를 대시보드에 실시간 반영
* [ ] **[Control] 능동형 멀티모달 제어**: 추론된 상태에 따라 백엔드가 자동으로 P2에서 구현한 '기기 제어 로직'을 트리거
* [ ] **[Data] (Optional) 시계열 데이터베이스 연동**: 대용량 생체 신호 저장을 위한 InfluxDB/TimescaleDB 연동 검토

---

## 🚀 시작하기 (Getting Started)

1.  **Clone the repository:**
    ```bash
    git clone [GITHUB_REPOSITORY_URL]
    cd mood-manager
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or yarn dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 👨‍💻 팀 (Team)

* 마혁진 Hyeokjin Ma
* 박새연 Saeyeon Park
* 안준성 Junseong Ahn
* 채희주 Heeju Chae
* 최현우 Hyeonwoo Choi