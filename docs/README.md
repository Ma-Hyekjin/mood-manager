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
- **[MOOD_STREAM_ARCHITECTURE.md](./MOOD_STREAM_ARCHITECTURE.md)**: 무드스트림 아키텍처 및 처리 흐름
- **[MOOD_STREAM_IMPLEMENTATION.md](./MOOD_STREAM_IMPLEMENTATION.md)**: 무드스트림 구현 정리

### LLM 관련
- **[LLM_INPUT_PARAMETERS.md](./LLM_INPUT_PARAMETERS.md)**: LLM 입력 파라미터 가이드
- **[OPENAI_INTEGRATION.md](./OPENAI_INTEGRATION.md)**: OpenAI 통합 가이드
- **[COST_OPTIMIZATION.md](./COST_OPTIMIZATION.md)**: 비용 최적화 전략

### 디자인 가이드
- **[RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md)**: 반응형 디자인 가이드 (375px 고정 너비)

### 설치 및 실행
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**: 프로젝트 설치 및 실행 가이드 (버전 정보, 문제 해결 포함)

---

## 빠른 참조

### 프론트엔드 개발자
1. 프로젝트 구조: `PROJECT_STRUCTURE.md` - 전체 구조 및 WearOS 앱 정보
2. API 사용: `API_SPECIFICATION.md` - API 명세 확인
3. 무드스트림: `MOOD_STREAM_ARCHITECTURE.md` - 무드스트림 아키텍처 및 처리 흐름
4. LLM 통합: `LLM_INPUT_PARAMETERS.md` - LLM 입력 파라미터 가이드

### 백엔드 개발자
1. API 명세: `API_SPECIFICATION.md` - 모든 API 엔드포인트 명세
2. 무드스트림: `MOOD_STREAM_ARCHITECTURE.md` - 무드스트림 생성 및 처리 로직
3. 프로젝트 구조: `PROJECT_STRUCTURE.md` - WearOS 앱 데이터 전송 구조
4. LLM 입력: `LLM_INPUT_PARAMETERS.md` - LLM에 전달할 파라미터 구조

### 프로젝트 관리자
1. 무드스트림: `MOOD_STREAM_IMPLEMENTATION.md` - 구현 정리 및 다음 단계
2. 비용 최적화: `COST_OPTIMIZATION.md` - OpenAI 비용 최적화 전략
3. 프로젝트 구조: `PROJECT_STRUCTURE.md` - 전체 프로젝트 구조

---

## 현재 프로젝트 상태

### 프론트엔드
- ✅ 모든 페이지 구현 완료 (9개 페이지)
- ✅ API Routes 구현 완료 (21개, 목업 모드)
- ✅ Toast Notification, Error Boundary 적용
- ✅ 로딩 스켈레톤 UI 추가
- ✅ 코드 분리 완료 (모든 페이지 300라인 이하)
- ⚠️ 백엔드 연동 대기 중

### WearOS 앱
- ✅ 완성된 v4 버전
- ✅ Firebase 연동 완료
- ✅ Firestore 데이터 전송 정상 작동
- ✅ Health Services 연동
- ✅ Audio Event 수집
