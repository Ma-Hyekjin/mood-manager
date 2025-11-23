// ======================================================
// File: src/app/api/auth/reset-password/route.ts
// ======================================================

/*
  [Reset Password API 역할]

  POST /api/auth/reset-password

  - 비밀번호 재설정 처리
  - 토큰 기반 인증
  - 새 비밀번호로 변경
*/

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/reset-password
 *
 * 비밀번호 재설정 API
 *
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 *
 * 구현 내용:
 * 1. 요청 본문에서 email, token, newPassword 추출
 * 2. 토큰 및 비밀번호 유효성 검사
 * 3. 백엔드 서버로 POST 요청 전달
 *    - URL: ${BACKEND_URL}/api/auth/reset-password
 *    - Body: { email: string, token: string, newPassword: string }
 * 4. 백엔드에서 토큰 확인
 *    - 토큰 유효기간 확인 (30분)
 *    - 토큰과 이메일 일치 확인
 * 5. 새 비밀번호 해시 처리
 * 6. DB에서 사용자 비밀번호 업데이트
 * 7. 토큰 무효화 (한 번만 사용 가능)
 * 8. 성공 응답 반환
 *
 * 참고:
 * - 공개 엔드포인트 (토큰 기반 인증)
 * - 토큰 유효기간: 30분
 * - 토큰은 한 번만 사용 가능 (사용 후 무효화)
 * - 비밀번호는 해시 처리하여 저장
 */
export async function POST(request: NextRequest) {
  // [MOCK] 목업 모드: 목업 응답 반환
  // TODO: 백엔드 API 연동 시 아래 주석 해제하고 목업 코드 제거
  //
  // const body = await request.json();
  // const { email, token, newPassword } = body;
  //
  // if (!email || typeof email !== "string") {
  //   return NextResponse.json(
  //     { error: "INVALID_INPUT", message: "Email is required" },
  //     { status: 400 }
  //   );
  // }
  //
  // if (!token || typeof token !== "string") {
  //   return NextResponse.json(
  //     { error: "INVALID_INPUT", message: "Token is required" },
  //     { status: 400 }
  //   );
  // }
  //
  // if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
  //   return NextResponse.json(
  //     { error: "INVALID_INPUT", message: "Password must be at least 6 characters" },
  //     { status: 400 }
  //   );
  // }
  //
  // const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({ email, token, newPassword }),
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
  const { email, token, newPassword } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "Email is required" },
      { status: 400 }
    );
  }

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "Token is required" },
      { status: 400 }
    );
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  // Mock: 항상 성공 처리
  return NextResponse.json({
    success: true,
    message: "Password has been reset successfully",
  });
}

