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

### 개발 이력
- **[DEVELOPMENT_NOTES.md](./DEVELOPMENT_NOTES.md)**: 프로젝트 개발 과정의 주요 결정사항, 아키텍처 설계, 이슈 해결 과정 기록

### 설치 및 실행
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**: 프로젝트 설치 및 실행 가이드 (버전 정보, 문제 해결 포함)

---

## 빠른 참조

### 프론트엔드 개발자
1. 프로젝트 구조: `PROJECT_STRUCTURE.md` - 전체 구조 및 WearOS 앱 정보
2. API 사용: `API_SPECIFICATION.md` - API 명세 확인
3. 개발 이력: `DEVELOPMENT_NOTES.md` - 아키텍처, 리팩토링 이력, 이슈 해결

### 백엔드 개발자
1. API 명세: `API_SPECIFICATION.md` - 모든 API 엔드포인트 명세
2. 프로젝트 구조: `PROJECT_STRUCTURE.md` - WearOS 앱 데이터 전송 구조
3. 개발 이력: `DEVELOPMENT_NOTES.md` - 아키텍처 결정, LLM 통합, 무드스트림 구조

### 프로젝트 관리자
1. 프로젝트 구조: `PROJECT_STRUCTURE.md` - 전체 프로젝트 구조
2. 개발 이력: `DEVELOPMENT_NOTES.md` - 개발 이력, 향후 계획, 기술 스택
3. API 명세: `API_SPECIFICATION.md` - API 엔드포인트 전체 목록

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
- ⚠️ 백엔드 연동 대기 중

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

## 문서 구조

### 핵심 문서
- **README.md**: 문서 인덱스 및 빠른 참조
- **SETUP_GUIDE.md**: 설치 및 실행 가이드
- **API_SPECIFICATION.md**: API 명세서
- **PROJECT_STRUCTURE.md**: 프로젝트 구조 설명
- **DEVELOPMENT_NOTES.md**: 프로젝트 개발 과정의 주요 결정사항, 아키텍처 설계, 이슈 해결 과정 기록
  - 리팩토링 이력
  - 아키텍처 결정
  - API 설계
  - 이슈 및 해결
  - 향후 계획
