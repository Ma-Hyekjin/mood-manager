// ======================================================
// File: src/app/api/auth/forgot-password/route.ts
// ======================================================

/*
  [Forgot Password API 역할]

  POST /api/auth/forgot-password

  - 이메일 기반 비밀번호 재설정 요청
  - 이메일이 존재하는지 확인 (보안상 존재 여부와 관계없이 동일한 응답 반환)
  - 비밀번호 재설정 토큰 생성 및 이메일 전송
  - 토큰은 1시간 유효
*/

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/forgot-password
 *
 * 비밀번호 재설정 이메일 전송 API
 *
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 *
 * 구현 내용:
 * 1. 요청 본문에서 email 추출
 * 2. 이메일 형식 유효성 검사
 * 3. 백엔드 서버로 POST 요청 전달
 *    - URL: ${BACKEND_URL}/api/auth/forgot-password
 *    - Body: { email: string }
 * 4. 백엔드에서 이메일 존재 여부 확인 (보안상 존재하지 않아도 동일한 응답)
 * 5. 비밀번호 재설정 토큰 생성 (JWT 또는 랜덤 토큰)
 * 6. 이메일 전송 서비스 호출 (SendGrid, AWS SES 등)
 * 7. 토큰을 DB에 저장 (email, token, expiresAt)
 * 8. 성공 응답 반환 (보안상 이메일 존재 여부와 관계없이 동일한 메시지)
 *
 * 참고:
 * - 공개 엔드포인트 (인증 불필요)
 * - 이메일 열거 공격 방지를 위해 존재하지 않는 이메일이어도 동일한 응답 반환
 * - 토큰은 1시간 유효
 * - 재설정 링크: ${FRONTEND_URL}/reset-password?token=${token}
 */
export async function POST(request: NextRequest) {
  // [MOCK] 목업 모드: 목업 응답 반환
  // TODO: 백엔드 API 연동 시 아래 주석 해제하고 목업 코드 제거
  //
  // const body = await request.json();
  // const { email } = body;
  //
  // if (!email || typeof email !== "string") {
  //   return NextResponse.json(
  //     { error: "INVALID_INPUT", message: "Email is required" },
  //     { status: 400 }
  //   );
  // }
  //
  // // Email validation
  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // if (!emailRegex.test(email)) {
  //   return NextResponse.json(
  //     { error: "INVALID_INPUT", message: "Invalid email format" },
  //     { status: 400 }
  //   );
  // }
  //
  // const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({ email }),
  // });
  //
  // if (!response.ok) {
  //   // 보안상 에러도 동일한 성공 메시지 반환
  //   return NextResponse.json({
  //     success: true,
  //     message: "If an account with that email exists, we've sent you a password reset link.",
  //   });
  // }
  //
  // const data = await response.json();
  // return NextResponse.json(data);

  // 목업 응답: 보안상 이메일 존재 여부와 관계없이 동일한 메시지 반환
  const body = await request.json();
  const { email } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "Email is required" },
      { status: 400 }
    );
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "Invalid email format" },
      { status: 400 }
    );
  }

  // 보안상 이메일 존재 여부와 관계없이 동일한 응답 반환
  return NextResponse.json({
    success: true,
    message: "If an account with that email exists, we've sent you a password reset link.",
  });
}

