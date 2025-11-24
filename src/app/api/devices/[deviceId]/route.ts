import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth"; // TODO: 백엔드 API 연동 시 사용

/**
 * DELETE /api/devices/:deviceId
 * 
 * 디바이스 삭제 API
 * 
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 * 
 * 구현 내용:
 * 1. NextAuth 세션 확인 (인증 필수)
 * 2. URL 파라미터에서 deviceId 추출
 * 3. 백엔드 서버로 DELETE 요청 전달
 *    - URL: ${BACKEND_URL}/api/devices/${deviceId}
 *    - Headers: 세션 정보 포함
 * 4. 백엔드 응답을 그대로 반환
 *    - 응답: { success: boolean }
 * 5. 권한 확인 (본인의 디바이스인지 확인 - 백엔드에서 처리)
 * 
 * 참고:
 * - 인증이 필요한 엔드포인트
 * - 디바이스 소유자만 삭제 가능 (백엔드에서 검증)
 * - 삭제 시 관련 데이터도 함께 삭제
 */
export async function DELETE(
  _request: NextRequest,
  { params: _params }: { params: Promise<{ deviceId: string }> }
) {
  // [MOCK] 목업 모드: 항상 성공 응답 반환
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
  // const { deviceId } = params;
  //
  // const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // const response = await fetch(`${backendUrl}/api/devices/${deviceId}`, {
  //   method: "DELETE",
  //   headers: {
  //     "Cookie": request.headers.get("cookie") || "",
  //   },
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json();
  //   return NextResponse.json(error, { status: response.status });
  // }
  //
  // const data = await response.json();
  // return NextResponse.json(data);

  // 목업 응답: 삭제 성공
  return NextResponse.json({ success: true });
}

