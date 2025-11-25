# TODO 리스트

**작성일**: 2025년
**상태**: 프론트엔드 완료, 백엔드 연동 대기

---

## ✅ 완료된 작업

### 프론트엔드
- ✅ 모든 페이지 구현 완료 (로그인, 회원가입, 비밀번호 찾기, 홈, 마이페이지)
- ✅ 컴포넌트 분리 완료 (모든 페이지 300라인 이하)
- ✅ API Routes 구현 완료 (21개, 목업 모드)
- ✅ Toast Notification, Error Boundary 적용
- ✅ 로딩 스켈레톤 UI 추가
- ⚠️ OpenAI 코드 작성 완료 (실제 사용은 백엔드에서, 패키지 미설치)

---

## 🎯 현재 해야 할 일

### 1. 백엔드 연동 대기 중 ⏳
**상태**: 백엔드 담당자가 API 구현 중

**준비 완료 사항**:
- ✅ API 명세서 완료 (`docs/API_SPEC.md`)
- ✅ 모든 API Route 코드 준비됨 (주석 처리)
- ✅ 에러 처리 로직 포함
- ✅ 목업 모드로 모든 기능 테스트 완료

**백엔드 담당자에게 전달**:
- API 명세서 참고 (`docs/API_SPEC.md`)
- 요청/응답 형식 정확히 일치
- CORS 설정 필요
- 인증 방식 확인 (NextAuth 세션)

---

### 2. 백엔드 연동 시 작업 순서

#### 2.1 환경 설정
```bash
# .env.local 파일에 추가
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

#### 2.2 API Routes 주석 해제
각 API Route 파일에서:
1. 목업 응답 코드 주석 처리
2. 실제 백엔드 호출 코드 주석 해제
3. 테스트

**주요 파일**:
- `src/app/api/auth/**/route.ts`
- `src/app/api/devices/**/route.ts`
- `src/app/api/moods/**/route.ts`
- `src/app/api/inquiry/route.ts`

#### 2.3 단계별 테스트
1. **인증 API** 먼저 테스트
   - 로그인/회원가입
   - 세션 관리 확인
2. **디바이스 API** 테스트
   - 목록 조회
   - 생성/삭제
   - 전원 제어
3. **무드 API** 테스트
   - 현재 무드 조회
   - 무드 변경
4. **통합 테스트**
   - 전체 플로우
   - 에러 케이스

---

## 📋 백엔드 연동 후 작업

### 필수 작업
- [ ] API 연동 테스트
- [ ] 에러 케이스 처리 확인
- [ ] 성능 확인
- [ ] 버그 수정

### 선택 작업
- [ ] 실시간 업데이트 (WebSocket/SSE)
- [ ] 캐싱 전략 (React Query/SWR)
- [ ] 성능 최적화

---

## 📝 참고 문서

- `docs/API_SPEC.md` - API 명세서
- `docs/API_ROUTES.md` - API Routes 구조

