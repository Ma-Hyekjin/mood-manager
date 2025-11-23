# API 아키텍처

**작성일**: 2025년

---

## 채택한 방식: Next.js API Routes

프로젝트에서 백엔드 API를 구현하는 방법으로 **Next.js API Routes**를 채택했습니다.

---

## 채택 이유

### 프로젝트 특성
- 21개 API 엔드포인트 (대부분 간단한 CRUD)
- 프론트엔드와 백엔드 같은 팀에서 개발
- 빠른 프로토타이핑 필요
- 서버리스 배포 고려 (Vercel 등)

### 개발 효율성
- 같은 프로젝트에서 프론트엔드와 백엔드 관리
- 타입 공유 가능 (TypeScript)
- 코드 수정이 쉬움
- 배포가 간단함

### 비용 효율성
- 서버리스 배포 시 사용한 만큼만 비용
- 작은 프로젝트에 적합
- 별도 서버 운영 불필요

### 타입 안정성
- 프론트엔드와 백엔드가 같은 타입 사용
- API 인터페이스 일관성 유지
- 컴파일 타임 에러 검출 가능

---

## 현재 구조

```
mood-manager/
├── src/
│   ├── app/
│   │   ├── api/                    # Next.js API Routes
│   │   │   ├── auth/               # 인증 API (9개)
│   │   │   ├── devices/            # 디바이스 API (7개)
│   │   │   ├── moods/              # 무드 API (5개)
│   │   │   └── inquiry/            # 문의 API (1개)
```

**총 21개 API 엔드포인트**:
- 인증 API: 9개
- 디바이스 관리 API: 7개
- 무드 관리 API: 5개

---

## 구현 방식

### 현재 상태: 목업 모드
- 모든 API Route가 목업 응답 반환
- 실제 백엔드 호출 코드는 주석 처리됨
- 백엔드 연동 시 주석 해제만 하면 됨

### 백엔드 연동 시
1. 환경 변수 설정: `BACKEND_URL` 또는 `NEXT_PUBLIC_BACKEND_URL`
2. 각 API Route에서 주석 해제
3. 목업 코드 제거
4. 테스트

### 예시 코드 구조

```typescript
// src/app/api/devices/route.ts
export async function GET(request: NextRequest) {
  // [MOCK] 목업 모드
  return NextResponse.json({ devices: [] });
  
  // TODO: 백엔드 연동 시 아래 주석 해제
  // const session = await getServerSession();
  // const backendUrl = process.env.BACKEND_URL;
  // const response = await fetch(`${backendUrl}/api/devices`, {
  //   headers: { "Cookie": request.headers.get("cookie") || "" },
  // });
  // return response;
}
```

---

## API Routes 목록

### 인증 API (9개)
1. `POST /api/auth/register` - 회원가입
2. `POST /api/auth/login` - 로그인
3. `GET /api/auth/survey-status` - 설문 조사 완료 여부 확인
4. `POST /api/auth/forgot-password` - 비밀번호 찾기 (인증코드 전송)
5. `POST /api/auth/verify-reset-code` - 인증코드 확인
6. `POST /api/auth/reset-password` - 비밀번호 재설정
7. `GET /api/auth/profile` - 프로필 조회
8. `PUT /api/auth/profile` - 프로필 업데이트
9. `DELETE /api/auth/account` - 회원탈퇴

### 디바이스 관리 API (7개)
1. `GET /api/devices` - 디바이스 목록 조회
2. `POST /api/devices` - 디바이스 생성
3. `DELETE /api/devices/:deviceId` - 디바이스 삭제
4. `PUT /api/devices/:deviceId/power` - 전원 토글
5. `PUT /api/devices/:deviceId/name` - 이름 변경
6. `PUT /api/devices/:deviceId/scent-level` - 센트 레벨 변경 (레거시)
7. `PUT /api/devices/:deviceId/scent-interval` - 센트 분사 주기 변경

### 무드 관리 API (5개)
1. `GET /api/moods/current` - 현재 무드 조회
2. `PUT /api/moods/current` - 무드 전체 변경
3. `PUT /api/moods/current/scent` - 센트 변경
4. `PUT /api/moods/current/song` - 노래 변경
5. `PUT /api/moods/current/color` - 조명 컬러 변경

### 기타 API (1개)
1. `POST /api/inquiry` - 1:1 문의 제출

---

## 마이그레이션 전략 (필요 시)

### Next.js API Routes → 별도 서버

현재는 Next.js API Routes로 충분하지만, 향후 필요 시 마이그레이션 가능:

1. **단계별 마이그레이션**:
   - 복잡한 API부터 별도 서버로 이동
   - Next.js API Routes는 프록시로 사용
   - 점진적으로 모든 API 이동

2. **프록시 패턴**:
   ```typescript
   export async function GET(request: NextRequest) {
     // 복잡한 로직은 별도 서버로
     const response = await fetch(`${BACKEND_URL}/api/complex-logic`);
     return response;
   }
   ```

**마이그레이션 고려 시점**:
- 트래픽이 크게 증가할 때
- 복잡한 백엔드 로직이 필요할 때
- 실시간 기능(WebSocket)이 필요할 때
- ML 서버와의 통신이 복잡할 때

---

## 장점

1. 간단한 설정: 별도 서버 설정 불필요
2. 빠른 개발: 프론트엔드와 백엔드 같은 프로젝트
3. 타입 안정성: TypeScript 타입 공유
4. 비용 효율적: 서버리스 배포 시 사용한 만큼만 비용
5. 배포 간단: 한 번의 배포로 프론트엔드와 백엔드 모두 배포

---

## 제한사항

1. 확장성 제한: 서버리스 함수 제한 (실행 시간, 메모리)
2. 서버 리소스 공유: API와 페이지가 같은 서버 사용
3. 독립적 배포 불가: 프론트엔드와 백엔드를 따로 배포 불가
4. 복잡한 로직 제한: 장시간 실행 작업 어려움

현재 프로젝트 규모에서는 문제 없음

---

## 현재 상태

- 모든 API Route 구현 완료 (21개)
- 목업 모드로 동작 중
- 백엔드 연동 준비 완료 (주석 처리된 코드 포함)
