import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth"; // TODO: 백엔드 API 연동 시 사용

/**
 * PUT /api/moods/current/color
 * 
 * 조명 컬러 변경 (무드 업데이트) API
 * 
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 * 
 * 구현 내용:
 * 1. NextAuth 세션 확인 (인증 필수)
 * 2. 요청 본문에서 moodId 추출
 * 3. 유효성 검사 (moodId가 유효한지 확인)
 * 4. 백엔드 서버로 PUT 요청 전달
 *    - URL: ${BACKEND_URL}/api/moods/current/color
 *    - Body: { moodId: string }
 *    - Headers: 세션 정보 포함
 * 5. 백엔드 응답을 그대로 반환
 *    - 응답: { mood: Mood, updatedDevices: Device[] }
 * 
 * 참고:
 * - 인증이 필요한 엔드포인트
 * - 조명 컬러 변경으로 인한 무드 업데이트
 * - 관련 디바이스(Manager, Light) 상태 자동 업데이트
 * - 새로고침 버튼 클릭 시 호출
 */
export async function PUT(request: NextRequest) {
  // [MOCK] 목업 모드: 목업 무드 반환
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
  // const { moodId } = body;
  //
  // const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // const response = await fetch(`${backendUrl}/api/moods/current/color`, {
  //   method: "PUT",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Cookie": request.headers.get("cookie") || "",
  //   },
  //   body: JSON.stringify({ moodId }),
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json();
  //   return NextResponse.json(error, { status: response.status });
  // }
  //
  // const data = await response.json();
  // return NextResponse.json(data);

  // 목업 응답: 컬러 변경된 무드 반환
  const body = await request.json();
  return NextResponse.json({
    mood: {
      id: body.moodId || "energy-1",
      name: "Morning Energy",
      color: "#FFD700",
      song: { title: "Sunrise", duration: 180 },
      scent: { type: "Citrus", name: "Orange", color: "#FFD700" },
    },
    updatedDevices: [],
  });
}

