// ======================================================
// File: src/app/api/auth/verify-reset-code/route.ts
// ======================================================

/*
  [Verify Reset Code API 역할]

  POST /api/auth/verify-reset-code

  - 인증코드 확인 및 비밀번호 재설정 토큰 발급
  - 인증코드 유효기간 확인 (10분)
  - 인증코드 확인 후 비밀번호 재설정 토큰 발급
*/

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/verify-reset-code
 *
 * 인증코드 확인 및 비밀번호 재설정 토큰 발급 API
 *
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 *
 * 구현 내용:
 * 1. 요청 본문에서 email, code 추출
 * 2. 이메일 및 인증코드 유효성 검사
 * 3. 백엔드 서버로 POST 요청 전달
 *    - URL: ${BACKEND_URL}/api/auth/verify-reset-code
 *    - Body: { email: string, code: string }
 * 4. 백엔드에서 인증코드 확인
 *    - 이메일과 인증코드가 일치하는지 확인
 *    - 인증코드 유효기간 확인 (10분)
 *    - 인증코드 사용 여부 확인 (한 번만 사용 가능)
 * 5. 인증코드 확인 성공 시 비밀번호 재설정 토큰 발급 (JWT 또는 랜덤 토큰)
 * 6. 토큰을 DB에 저장 (email, token, expiresAt)
 * 7. 성공 응답 반환 (토큰 포함)
 *
 * 참고:
 * - 공개 엔드포인트 (인증 불필요)
 * - 인증코드 유효기간: 10분
 * - 비밀번호 재설정 토큰 유효기간: 30분
 * - 인증코드는 한 번만 사용 가능 (사용 후 무효화)
 */
export async function POST(request: NextRequest) {
  // [MOCK] 목업 모드: 목업 응답 반환
  // TODO: 백엔드 API 연동 시 아래 주석 해제하고 목업 코드 제거
  //
  // const body = await request.json();
  // const { email, code } = body;
  //
  // if (!email || typeof email !== "string") {
  //   return NextResponse.json(
  //     { error: "INVALID_INPUT", message: "Email is required" },
  //     { status: 400 }
  //   );
  // }
  //
  // if (!code || typeof code !== "string" || code.length !== 6) {
  //   return NextResponse.json(
  //     { error: "INVALID_INPUT", message: "Verification code must be 6 digits" },
  //     { status: 400 }
  //   );
  // }
  //
  // const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // const response = await fetch(`${backendUrl}/api/auth/verify-reset-code`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({ email, code }),
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json();
  //   return NextResponse.json(error, { status: response.status });
  // }
  //
  // const data = await response.json();
  // return NextResponse.json(data);

  // 목업 응답
  const body = await request.json();
  const { email, code } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "Email is required" },
      { status: 400 }
    );
  }

  if (!code || typeof code !== "string" || code.length !== 6) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "Verification code must be 6 digits" },
      { status: 400 }
    );
  }

  // Mock: "123456"만 성공 처리
  if (code === "123456") {
    return NextResponse.json({
      success: true,
      token: "mock-reset-token-" + Date.now(),
      message: "Verification code confirmed",
    });
  }

  return NextResponse.json(
    { error: "INVALID_CODE", message: "Invalid verification code" },
    { status: 400 }
  );
}

