// ======================================================
// File: src/app/api/inquiry/route.ts
// ======================================================

/*
  [Inquiry API 역할]

  POST /api/inquiry

  - 1:1 문의 제출 및 저장
*/

import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth"; // TODO: 백엔드 API 연동 시 사용

/**
 * POST /api/inquiry
 *
 * 1:1 문의 제출 API
 *
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 *
 * 구현 내용:
 * 1. NextAuth 세션 확인 (인증 필수)
 * 2. 요청 본문에서 subject, message 추출
 * 3. 유효성 검사 (subject, message가 비어있지 않은지 확인)
 * 4. 백엔드 서버로 POST 요청 전달
 *    - URL: ${BACKEND_URL}/api/inquiry
 *    - Body: { subject: string, message: string, userId: string }
 *    - Headers: 세션 정보 포함
 * 5. 백엔드에서 문의 저장 (DB에 저장)
 * 6. 성공 응답 반환
 *    - 응답: { success: boolean, inquiryId: string }
 *
 * 참고:
 * - 인증이 필요한 엔드포인트
 * - 문의는 관리자가 확인 후 답변 가능
 */
export async function POST(request: NextRequest) {
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
  // const { subject, message } = body;
  //
  // if (!subject || !message) {
  //   return NextResponse.json(
  //     { error: "INVALID_INPUT", message: "Subject and message are required" },
  //     { status: 400 }
  //   );
  //
  // const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // const response = await fetch(`${backendUrl}/api/inquiry`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Cookie": request.headers.get("cookie") || "",
  //   },
  //   body: JSON.stringify({
  //     subject,
  //     message,
  //     userId: session.user.id,
  //   }),
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json();
  //   return NextResponse.json(error, { status: response.status });
  // }
  //
  // const data = await response.json();
  // return NextResponse.json(data);

  // 목업 응답: 문의 제출 성공
  const body = await request.json();
  const { subject, message } = body;

  if (!subject || !message) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "Subject and message are required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    inquiryId: `inquiry-${Date.now()}`,
  });
}

