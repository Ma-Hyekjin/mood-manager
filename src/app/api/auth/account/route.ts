// ======================================================
// File: src/app/api/auth/account/route.ts
// ======================================================

/*
  [Account Deletion API 역할]

  DELETE /api/auth/account

  - 회원탈퇴 처리
  - 확인 텍스트 검증 후 계정 삭제
*/

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

/**
 * DELETE /api/auth/account
 *
 * 회원탈퇴 API
 *
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 *
 * 구현 내용:
 * 1. NextAuth 세션 확인 (인증 필수)
 * 2. 요청 본문에서 confirmText 추출
 * 3. confirmText가 "I understand"인지 확인
 * 4. 백엔드 서버로 DELETE 요청 전달
 *    - URL: ${BACKEND_URL}/api/auth/account
 *    - Body: { confirmText: string }
 *    - Headers: 세션 정보 포함
 * 5. 백엔드에서 계정 삭제 처리 (소프트 삭제 또는 하드 삭제)
 * 6. 성공 응답 반환
 *
 * 참고:
 * - 인증이 필요한 엔드포인트
 * - 확인 텍스트가 정확히 일치해야 함
 * - 계정 삭제 후 세션 무효화 필요
 */
export async function DELETE(request: NextRequest) {
  // [MOCK] 목업 모드: 목업 응답 반환
  // TODO: 백엔드 API 연동 시 아래 주석 해제하고 목업 코드 제거
  //
  // const session = await getServerSession();
  //
  // if (!session) {
  //   return NextResponse.json(
  //     { error: "UNAUTHORIZED", message: "Authentication required" },
  //     { status: 401 }
  //   );
  // }
  //
  // const body = await request.json();
  // const { confirmText } = body;
  //
  // if (confirmText !== "I understand") {
  //   return NextResponse.json(
  //     { error: "INVALID_INPUT", message: "Confirmation text does not match" },
  //     { status: 400 }
  //   );
  //
  // const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // const response = await fetch(`${backendUrl}/api/auth/account`, {
  //   method: "DELETE",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Cookie": request.headers.get("cookie") || "",
  //   },
  //   body: JSON.stringify({ confirmText }),
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json();
  //   return NextResponse.json(error, { status: response.status });
  // }
  //
  // const data = await response.json();
  // return NextResponse.json(data);

  // 목업 응답: 회원탈퇴 성공
  const body = await request.json();
  const { confirmText } = body;

  if (confirmText !== "I understand") {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "Confirmation text does not match" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Account deleted successfully",
  });
}

