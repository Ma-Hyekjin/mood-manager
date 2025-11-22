import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/register
 * 
 * 회원가입 API
 * 
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 * 
 * 구현 내용:
 * 1. 요청 본문에서 familyName, name, birthDate, gender, email, password 추출
 * 2. 유효성 검사 (이미 프론트엔드에서 검증했지만 서버 사이드에서도 검증)
 * 3. 백엔드 서버로 POST 요청 전달
 *    - URL: ${BACKEND_URL}/api/auth/register
 *    - Body: { familyName, name, birthDate, gender, email, password }
 * 4. 백엔드 응답을 그대로 반환
 * 5. 에러 처리 (400, 500 등)
 * 
 * 참고:
 * - 인증이 필요하지 않은 엔드포인트
 * - 성공 시 설문 페이지로 이동 (프론트엔드에서 처리)
 * - 이메일 중복 체크는 백엔드에서 처리
 */
export async function POST(request: NextRequest) {
  // [MOCK] 목업 모드: 항상 성공 응답 반환
  // TODO: 백엔드 API 연동 시 아래 주석 해제하고 목업 코드 제거
  // 
  // try {
  //   const body = await request.json();
  //   const { familyName, name, birthDate, gender, email, password } = body;
  //
  //   const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  //   const response = await fetch(`${backendUrl}/api/auth/register`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ familyName, name, birthDate, gender, email, password }),
  //   });
  //
  //   if (!response.ok) {
  //     const error = await response.json();
  //     return NextResponse.json(error, { status: response.status });
  //   }
  //
  //   const data = await response.json();
  //   return NextResponse.json(data);
  // } catch (error) {
  //   return NextResponse.json(
  //     { success: false, error: "INTERNAL_ERROR", message: "Registration failed" },
  //     { status: 500 }
  //   );
  // }

  // 목업 응답
  const body = await request.json();
  return NextResponse.json({
    success: true,
    user: {
      id: `user-${Date.now()}`,
      email: body.email,
      familyName: body.familyName,
      name: body.name,
    },
  });
}

