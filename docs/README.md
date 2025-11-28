# Documentation

이 디렉토리에는 프로젝트의 핵심 문서가 포함되어 있습니다.

---

## 문서 목록

### 프로젝트 구조 및 개요
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**: 프로젝트 구조 및 WearOS 앱 정보
  - 웹앱 구조 (Next.js)
  - WearOS 앱 상세 정보
  - 구조 개선 제안 (선택사항)
  - Monorepo 전환 정보

### API 관련
- **[API_SPECIFICATION.md](./API_SPECIFICATION.md)**: 전체 API 명세서 (무드스트림, 전처리, LLM 등)

### 구현 및 아키텍처
- **[REFACTORING_PLAN.md](./REFACTORING_PLAN.md)**: 최종 리팩토링 계획 및 향후 작업 정리 (데이터 플로우, 타입 정의, 구현 계획 포함)

### 설치 및 실행
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**: 프로젝트 설치 및 실행 가이드 (버전 정보, 문제 해결 포함)
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)**: 데이터베이스 설정 가이드

---

## 빠른 참조

### 프론트엔드 개발자
1. 프로젝트 구조: `PROJECT_STRUCTURE.md` - 전체 구조 및 WearOS 앱 정보
2. API 사용: `API_SPECIFICATION.md` - API 명세 확인
3. 리팩토링 계획: `REFACTORING_PLAN.md` - 최종 리팩토링 계획 및 향후 작업 (데이터 플로우, 타입 정의 포함)

### 백엔드 개발자
1. API 명세: `API_SPECIFICATION.md` - 모든 API 엔드포인트 명세
2. 리팩토링 계획: `REFACTORING_PLAN.md` - 최종 리팩토링 계획 및 향후 작업 (데이터 플로우, 타입 정의 포함)
3. 프로젝트 구조: `PROJECT_STRUCTURE.md` - WearOS 앱 데이터 전송 구조

### 프로젝트 관리자
1. 리팩토링 계획: `REFACTORING_PLAN.md` - 최종 리팩토링 계획 및 향후 작업
2. 프로젝트 구조: `PROJECT_STRUCTURE.md` - 전체 프로젝트 구조

---

## 현재 프로젝트 상태

### 프론트엔드
- ✅ 모든 페이지 구현 완료 (9개 페이지)
- ✅ API Routes 구현 완료 (21개, 목업 모드)
- ✅ Toast Notification, Error Boundary 적용
- ✅ 로딩 스켈레톤 UI 추가
- ✅ 코드 분리 완료 (모든 페이지 300라인 이하)
- ✅ Home 컴포넌트 리팩토링 완료 (커스텀 훅 분리, Props 그룹화)
- ✅ TypeScript 타입 안정성 향상 (`any` 타입 제거)
- ✅ 관리자 모드 완전 구현 (localStorage 기반 무드셋 관리)
- ⚠️ 실제 데이터베이스 연동 대기 중 (Prisma 스키마 준비 완료, 실제 데이터 저장/조회 미구현)
- ⚠️ 시계열+마르코프 체인 모델 구현 대기 중 (현재는 LLM 2단계 처리로 대체 계획)

### WearOS 앱
- ✅ 완성된 v4 버전
- ✅ Firebase 연동 완료
- ✅ Firestore 데이터 전송 정상 작동
- ✅ Health Services 연동
- ✅ Audio Event 수집

### 개발 환경
- ✅ Next.js 15.5.6
- ✅ React 19.1.0
- ✅ TypeScript 5.9.3
- ✅ Prisma 6.19.0
- ✅ OpenAI API 통합 (gpt-4o-mini)

---

## 핵심 문서 요약

### REFACTORING_PLAN.md
최종 리팩토링 계획 및 향후 작업 정리
- 현재 완료된 작업 요약
- 리팩토링 단계별 계획 (Phase 1-3)
- 데이터 플로우 (전처리 → LLM 1차 → LLM 2차)
- 타입 정의 (PreprocessedData, EmotionSegment, MoodSegment)
- 사용자 선호도 시스템
- 단기/중기/장기 향후 작업
- 우선순위 매트릭스
