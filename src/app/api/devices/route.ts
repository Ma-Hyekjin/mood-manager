import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

/**
 * GET /api/devices
 * 
 * 디바이스 목록 조회 API
 * 
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 * 
 * 구현 내용:
 * 1. NextAuth 세션 확인 (인증 필수)
 * 2. 세션이 없으면 401 반환
 * 3. 백엔드 서버로 GET 요청 전달
 *    - URL: ${BACKEND_URL}/api/devices
 *    - Headers: 세션 정보 포함 (쿠키 또는 Authorization 헤더)
 * 4. 백엔드 응답을 그대로 반환
 *    - 응답: { devices: Device[] }
 * 
 * 참고:
 * - 인증이 필요한 엔드포인트
 * - 현재 사용자의 디바이스만 반환
 * - 초기 로드 시 호출
 */
export async function GET(request: NextRequest) {
  // [MOCK] 목업 모드: 빈 디바이스 목록 반환 (프론트엔드에서 목업 데이터 사용)
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
  // const response = await fetch(`${backendUrl}/api/devices`, {
  //   method: "GET",
  //   headers: {
  //     "Cookie": request.headers.get("cookie") || "",
  //   },
  // });
  //
  // if (!response.ok) {
  //   return NextResponse.json(
  //     { error: "INTERNAL_ERROR", message: "Failed to fetch devices" },
  //     { status: 500 }
  //   );
  // }
  //
  // const data = await response.json();
  // return NextResponse.json(data);

  // 목업 응답: 빈 배열 (프론트엔드에서 초기 목업 데이터 사용)
  return NextResponse.json({ devices: [] });
}

/**
 * POST /api/devices
 * 
 * 디바이스 생성 API
 * 
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 * 
 * 구현 내용:
 * 1. NextAuth 세션 확인 (인증 필수)
 * 2. 요청 본문에서 type, name 추출
 * 3. 유효성 검사 (type이 유효한 DeviceType인지 확인)
 * 4. 백엔드 서버로 POST 요청 전달
 *    - URL: ${BACKEND_URL}/api/devices
 *    - Body: { type, name? }
 *    - Headers: 세션 정보 포함
 * 5. 백엔드 응답을 그대로 반환
 *    - 응답: { device: Device }
 * 
 * 참고:
 * - 인증이 필요한 엔드포인트
 * - name이 없으면 백엔드에서 자동 생성
 * - 생성된 디바이스는 기본 설정으로 초기화
 */
export async function POST(request: NextRequest) {
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
  // const body = await request.json();
  // const { type, name } = body;
  //
  // const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // const response = await fetch(`${backendUrl}/api/devices`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Cookie": request.headers.get("cookie") || "",
  //   },
  //   body: JSON.stringify({ type, name }),
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json();
  //   return NextResponse.json(error, { status: response.status });
  // }
  //
  // const data = await response.json();
  // return NextResponse.json(data);

  // 목업 응답: 새 디바이스 생성
  const body = await request.json();
  const { type, name } = body;
  
  return NextResponse.json({
    device: {
      id: `${type}-${Date.now()}`,
      type,
      name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} 1`,
      battery: 100,
      power: true,
      output: {},
    },
  });
}
