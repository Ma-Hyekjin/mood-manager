import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth"; // TODO: 백엔드 API 연동 시 사용

/**
 * GET /api/auth/survey-status
 * 
 * 설문 조사 완료 여부 확인 API
 * 
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 * 
 * 구현 내용:
 * 1. NextAuth 세션 확인 (인증 필수)
 * 2. 세션이 없으면 401 반환
 * 3. 백엔드 서버로 GET 요청 전달
 *    - URL: ${BACKEND_URL}/api/auth/survey-status
 *    - Headers: 세션 정보 포함 (쿠키 또는 Authorization 헤더)
 * 4. 백엔드 응답을 그대로 반환
 *    - 응답: { hasSurvey: boolean }
 * 
 * 참고:
 * - 인증이 필요한 엔드포인트
 * - 로그인 후 설문 페이지 또는 홈 페이지로 리다이렉트 결정에 사용
 */
export async function GET(_request: NextRequest) {
  // [MOCK] 목업 모드: 항상 설문 미완료로 반환
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
  // const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // const response = await fetch(`${backendUrl}/api/auth/survey-status`, {
  //   method: "GET",
  //   headers: {
  //     "Cookie": request.headers.get("cookie") || "",
  //   },
  // });
  //
  // if (!response.ok) {
  //   return NextResponse.json(
  //     { error: "INTERNAL_ERROR", message: "Failed to check survey status" },
  //     { status: 500 }
  //   );
  // }
  //
  // const data = await response.json();
  // return NextResponse.json(data);

  // 목업 응답: 설문 미완료
  return NextResponse.json({ hasSurvey: false });
}

