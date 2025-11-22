# 백엔드 연동 가이드

## Next.js API Routes vs 백엔드 서버

### 현재 구조
현재 프로젝트는 **Next.js 프론트엔드**와 **별도의 백엔드 서버**를 사용하는 구조입니다.

- **Next.js**: 프론트엔드 (React 컴포넌트, UI)
- **백엔드 서버**: API 서버 (인증, 데이터베이스, 비즈니스 로직)

### API 호출 흐름

```
[프론트엔드] → [Next.js API Routes (선택적)] → [백엔드 서버] → [데이터베이스]
```

## 1. Next.js API Routes 생성 방법

Next.js에서 API Routes를 만드는 것은 **선택사항**입니다. 두 가지 방법이 있습니다:

### 방법 A: Next.js API Routes 사용 (프록시 역할)

Next.js에서 API Routes를 만들어 백엔드 서버로 요청을 프록시하는 방법입니다.

**장점:**
- CORS 문제 해결
- 환경 변수로 백엔드 URL 관리
- 요청/응답 변환 가능

**단점:**
- 추가 레이어 (성능 약간 저하)
- 코드 중복 가능성

**예시: `/src/app/api/auth/login/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 백엔드 서버로 요청 전달
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Login failed" },
        { status: response.status }
      );
    }

    // 성공 시 쿠키 설정 (NextAuth 세션)
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 방법 B: 프론트엔드에서 직접 백엔드 호출 (권장)

프론트엔드에서 직접 백엔드 서버를 호출하는 방법입니다.

**장점:**
- 단순한 구조
- 빠른 응답 시간
- 코드 중복 없음

**단점:**
- CORS 설정 필요
- 환경 변수 관리 필요

**현재 코드 구조 (권장):**

```typescript
// 프론트엔드에서 직접 백엔드 호출
const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({ email, password }),
});
```

## 2. 백엔드 서버 표준 구조

### 권장 백엔드 구조

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   ├── register.ts
│   │   │   └── survey-status.ts
│   │   ├── devices/
│   │   │   ├── index.ts (GET, POST)
│   │   │   ├── [id].ts (GET, PUT, DELETE)
│   │   │   └── [id]/power.ts (PUT)
│   │   └── moods/
│   │       └── current.ts (GET, PUT)
│   ├── middleware/
│   │   ├── auth.ts (인증 미들웨어)
│   │   └── rateLimit.ts (Rate limiting)
│   ├── services/
│   │   ├── userService.ts
│   │   ├── deviceService.ts
│   │   └── moodService.ts
│   └── utils/
│       ├── db.ts (데이터베이스 연결)
│       └── validation.ts
└── package.json
```

### 백엔드 API 엔드포인트 예시

**Express.js 예시:**

```typescript
// src/routes/auth/login.ts
import express from "express";
import { authenticateUser } from "../../services/userService";

const router = express.Router();

router.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 유효성 검사
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "INVALID_INPUT",
        message: "Email and password are required",
      });
    }

    // 사용자 인증
    const user = await authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    // 설문 조사 완료 여부 확인
    const hasSurvey = await checkSurveyStatus(user.id);

    res.json({
      success: true,
      hasSurvey,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    });
  }
});

export default router;
```

## 3. 인증 처리 방식

### NextAuth와 백엔드 연동

**방법 1: NextAuth Credentials Provider 사용 (현재 구조)**

```typescript
// src/app/api/auth/[...nextauth]/route.ts
CredentialsProvider({
  async authorize(credentials) {
    // 백엔드 서버로 인증 요청
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
    };
  },
});
```

**방법 2: JWT 토큰 사용**

백엔드에서 JWT 토큰을 발급하고, 프론트엔드에서 저장하여 사용:

```typescript
// 백엔드 응답
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}

// 프론트엔드에서 저장
localStorage.setItem("token", data.token);

// 이후 API 호출 시
headers: {
  "Authorization": `Bearer ${token}`
}
```

## 4. CORS 설정

백엔드 서버에서 CORS를 허용해야 합니다:

```typescript
// Express.js 예시
import cors from "cors";

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true, // 쿠키 포함 허용
}));
```

## 5. 환경 변수 설정

### 프론트엔드 (`.env.local`)

```env
# 백엔드 서버 URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# 소셜 로그인
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
```

### 백엔드 (`.env`)

```env
# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/moodmanager

# JWT
JWT_SECRET=your-jwt-secret

# 프론트엔드 URL (CORS용)
FRONTEND_URL=http://localhost:3000
```

## 6. CSRF (Cross-Site Request Forgery) 보호

### CSRF란?

악의적인 웹사이트가 사용자의 브라우저를 통해 인증된 요청을 보내는 공격입니다.

### 보호 방법

**1. SameSite 쿠키 사용 (NextAuth 기본 제공)**

NextAuth는 기본적으로 `SameSite=Lax` 쿠키를 사용하여 CSRF를 방지합니다.

**2. CSRF 토큰 사용 (추가 보안)**

```typescript
// 백엔드에서 CSRF 토큰 생성
const csrfToken = generateCSRFToken();

// 프론트엔드로 전달
res.cookie("csrf-token", csrfToken, {
  httpOnly: false, // JavaScript에서 접근 가능
  sameSite: "strict",
});

// 프론트엔드에서 요청 시 포함
headers: {
  "X-CSRF-Token": getCookie("csrf-token")
}
```

**3. Double Submit Cookie 패턴**

```typescript
// 쿠키와 요청 본문에 동일한 토큰 포함
// 서버에서 두 값이 일치하는지 확인
```

### 현재 프로젝트에서의 CSRF

- **NextAuth 사용**: 기본 CSRF 보호 제공
- **추가 보안 필요 시**: 백엔드에서 CSRF 토큰 검증 구현

## 7. Rate Limiting (로그인 시도 제한)

### 프론트엔드 (클라이언트 사이드)

현재 구현된 방식:
- 5회 실패 시 15분 잠금
- 로컬 상태로 관리 (새로고침 시 리셋)

**한계:** 클라이언트 사이드만으로는 완전한 보호 불가

### 백엔드 (서버 사이드) - 필수

```typescript
// Express.js + express-rate-limit 예시
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5회 시도
  message: {
    success: false,
    error: "TOO_MANY_ATTEMPTS",
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/api/auth/login", loginLimiter, async (req, res) => {
  // 로그인 로직
});
```

**IP 기반 Rate Limiting:**

```typescript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.ip, // IP 주소 기반
  skipSuccessfulRequests: true, // 성공한 요청은 카운트 제외
});
```

## 8. API 명세에 따른 Route 생성

### 디바이스 관리 API Routes

**`/src/app/api/devices/route.ts`** (GET, POST)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/devices`, {
      headers: {
        "Cookie": request.headers.get("cookie") || "",
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to fetch devices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // POST 로직
}
```

**`/src/app/api/devices/[deviceId]/route.ts`** (DELETE)

**`/src/app/api/devices/[deviceId]/power/route.ts`** (PUT)

### 무드 관리 API Routes

**`/src/app/api/moods/current/route.ts`** (GET, PUT)

**`/src/app/api/moods/current/scent/route.ts`** (PUT)

**`/src/app/api/moods/current/song/route.ts`** (PUT)

**`/src/app/api/moods/current/color/route.ts`** (PUT)

## 9. 권장 구조 요약

### 옵션 1: Next.js API Routes 사용 (프록시)

```
프론트엔드 → Next.js API Routes → 백엔드 서버
```

**장점:**
- CORS 문제 해결
- 환경 변수 중앙 관리
- 요청/응답 변환 가능

**단점:**
- 추가 레이어
- 코드 중복 가능

### 옵션 2: 직접 백엔드 호출 (권장)

```
프론트엔드 → 백엔드 서버
```

**장점:**
- 단순한 구조
- 빠른 응답
- 코드 중복 없음

**단점:**
- CORS 설정 필요
- 환경 변수 관리 필요

## 10. 백엔드 개발자에게 전달할 사항

1. **API 명세서**: `API_SPEC.md` 파일 참고
2. **CORS 설정**: 프론트엔드 URL 허용
3. **인증 방식**: NextAuth 세션 (쿠키 기반) 또는 JWT
4. **Rate Limiting**: 로그인 API에 적용 필수
5. **에러 응답 형식**: 통일된 형식 사용
6. **환경 변수**: 백엔드 URL, 데이터베이스 연결 정보

## 11. 테스트 방법

### 로컬 개발 환경

1. **백엔드 서버 실행**: `http://localhost:8000`
2. **프론트엔드 실행**: `http://localhost:3000`
3. **환경 변수 설정**: `.env.local` 파일에 `NEXT_PUBLIC_BACKEND_URL` 설정

### API 테스트

```bash
# 로그인 테스트
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"1234"}'
```

## 12. 폼 관리 라이브러리 (react-hook-form + zod)

### 현재 상태

현재 프로젝트는 **순수 React 상태 관리**를 사용하고 있습니다:
- `useState`로 각 필드 관리
- 수동 유효성 검사
- 수동 에러 처리

### 폼 관리 라이브러리란?

**react-hook-form** + **zod** 조합:
- **react-hook-form**: 성능 최적화된 폼 관리
- **zod**: TypeScript-first 스키마 검증

### 장점

1. **성능**: 리렌더링 최소화 (uncontrolled components)
2. **타입 안정성**: TypeScript와 완벽 통합
3. **검증 로직**: 중앙화된 스키마로 관리
4. **에러 처리**: 자동 에러 메시지 표시
5. **코드 간결성**: 보일러플레이트 코드 감소

### 사용 예시

**설치:**
```bash
npm install react-hook-form zod @hookform/resolvers
```

**기본 사용법:**

```typescript
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// 스키마 정의
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[0-9]/, "Password must contain number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    // API 호출
    const response = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <p>{errors.name.message}</p>}

      <input {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register("password")} />
      {errors.password && <p>{errors.password.message}</p>}
      
      {/* 비밀번호 강도 표시 */}
      {password && <PasswordStrength password={password} />}

      <input type="password" {...register("confirmPassword")} />
      {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}
```

### 현재 프로젝트에 적용 시

**장점:**
- 코드가 더 간결해짐
- 검증 로직이 중앙화됨
- 타입 안정성 향상

**단점:**
- 추가 의존성
- 학습 곡선
- 기존 코드 리팩토링 필요

### 권장 사항

**현재 프로젝트 수준에서는 선택사항입니다:**
- 간단한 폼 (로그인, 회원가입): 현재 방식으로도 충분
- 복잡한 폼 (설문 조사 등): react-hook-form 고려

**적용 시기:**
- 폼이 복잡해질 때
- 검증 로직이 많아질 때
- 팀이 라이브러리 사용에 익숙할 때

## 결론

현재 프로젝트는 **프론트엔드에서 직접 백엔드를 호출하는 구조**를 권장합니다. Next.js API Routes는 필요 시에만 사용하세요 (CORS 문제 해결, 요청 변환 등).

백엔드 개발자는 `API_SPEC.md`를 참고하여 API를 구현하면 됩니다.

**폼 관리 라이브러리는 선택사항**이며, 현재 프로젝트 수준에서는 순수 React 상태 관리로도 충분합니다.

