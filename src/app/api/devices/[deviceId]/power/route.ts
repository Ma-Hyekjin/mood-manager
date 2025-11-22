import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

/**
 * PUT /api/devices/:deviceId/power
 * 
 * 디바이스 전원 토글 API
 * 
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 * 
 * 구현 내용:
 * 1. NextAuth 세션 확인 (인증 필수)
 * 2. URL 파라미터에서 deviceId 추출
 * 3. 요청 본문에서 power (boolean) 추출
 * 4. 백엔드 서버로 PUT 요청 전달
 *    - URL: ${BACKEND_URL}/api/devices/${deviceId}/power
 *    - Body: { power: boolean }
 *    - Headers: 세션 정보 포함
 * 5. 백엔드 응답을 그대로 반환
 *    - 응답: { device: Device }
 * 6. 권한 확인 (본인의 디바이스인지 확인 - 백엔드에서 처리)
 * 
 * 참고:
 * - 인증이 필요한 엔드포인트
 * - 디바이스 소유자만 전원 변경 가능 (백엔드에서 검증)
 * - 전원 상태 변경 시 DB 업데이트
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  // [MOCK] 목업 모드: 목업 디바이스 반환
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
  // const body = await request.json();
  // const { power } = body;
  //
  // const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // const response = await fetch(`${backendUrl}/api/devices/${deviceId}/power`, {
  //   method: "PUT",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Cookie": request.headers.get("cookie") || "",
  //   },
  //   body: JSON.stringify({ power }),
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json();
  //   return NextResponse.json(error, { status: response.status });
  // }
  //
  // const data = await response.json();
  // return NextResponse.json(data);

  // 목업 응답: 전원 상태 변경된 디바이스 반환
  const { deviceId } = params;
  const body = await request.json();
  const { power } = body;
  
  return NextResponse.json({
    device: {
      id: deviceId,
      type: "light",
      name: "Device",
      battery: 100,
      power,
      output: {},
    },
  });
}

