# API Routes 구조

이 디렉토리는 Next.js API Routes를 포함합니다. 각 파일은 백엔드 서버로 요청을 프록시하거나 직접 호출하는 역할을 합니다.

## 폴더 구조

```
api/
├── auth/
│   ├── [...nextauth]/          # NextAuth 기본 제공 (소셜 로그인)
│   ├── register/               # 회원가입
│   └── survey-status/          # 설문 조사 완료 여부 확인
├── devices/
│   ├── route.ts                # GET (목록 조회), POST (생성)
│   └── [deviceId]/
│       ├── route.ts            # DELETE (삭제)
│       ├── power/              # PUT (전원 토글)
│       └── scent-level/        # PUT (센트 레벨 변경)
└── moods/
    ├── current/
    │   ├── route.ts            # GET (조회), PUT (전체 변경)
    │   ├── scent/              # PUT (센트 변경)
    │   ├── song/               # PUT (노래 변경)
    │   └── color/              # PUT (컬러 변경)
    └── route.ts                # 사용 안 함 (참고용)
```

## 구현 가이드

각 `route.ts` 파일에는 TODO 주석이 포함되어 있습니다. 다음 순서로 구현하세요:

1. **세션 확인** (인증이 필요한 API의 경우)
2. **요청 본문/파라미터 파싱**
3. **유효성 검사**
4. **백엔드 서버로 요청 전달**
5. **응답 반환**

## 백엔드 URL 설정

환경 변수에서 백엔드 URL을 가져옵니다:

```typescript
const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
```

## 세션 정보 전달

NextAuth 세션 정보를 백엔드로 전달하는 방법:

```typescript
// 방법 1: 쿠키 전달
const response = await fetch(`${backendUrl}/api/...`, {
  headers: {
    "Cookie": request.headers.get("cookie") || "",
  },
});

// 방법 2: Authorization 헤더 (JWT 사용 시)
const response = await fetch(`${backendUrl}/api/...`, {
  headers: {
    "Authorization": `Bearer ${session.accessToken}`,
  },
});
```

## 에러 처리

모든 API는 통일된 에러 응답 형식을 사용합니다:

```typescript
{
  "error": "ERROR_CODE",
  "message": "에러 메시지"
}
```

## 참고 문서

- `API_SPEC.md`: API 명세서
- `BACKEND_INTEGRATION.md`: 백엔드 연동 가이드

