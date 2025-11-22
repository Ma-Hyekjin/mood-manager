import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

/**
 * GET /api/moods/current
 * 
 * 현재 무드 및 무드스트림 조회 API
 * 
 * [무드 생성 로직]
 * 백엔드에서 10분마다 자동으로 검증을 수행합니다:
 * 1. 현재 생체 데이터(V1)와 예측 무드(V0 * P^10)의 클러스터를 비교
 * 2. 클러스터가 다르면 즉시 새 30분 무드스트림 생성
 * 3. 클러스터가 같으면 기존 스트림 유지, 10분 전에 다음 스트림 예약
 * 4. 전환 시 현재 노래가 끝난 후 새 무드로 전환 (자연스러운 UX)
 * 
 * [클러스터 정의]
 * - '-': 부정 클러스터 (우울, 분노, 슬픔 등)
 * - '0': 중립 클러스터 (안정, 평온 등)
 * - '+': 긍정 클러스터 (기쁨, 즐거움 등)
 * 
 * [예외 처리]
 * 데이터 부족 또는 모델 실패 시 '+' 클러스터 중 하나를 기본값으로 제안
 * 
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 * 
 * 구현 내용:
 * 1. NextAuth 세션 확인 (인증 필수)
 * 2. 백엔드 서버로 GET 요청 전달
 *    - URL: ${BACKEND_URL}/api/moods/current
 *    - Headers: 세션 정보 포함
 * 3. 백엔드 응답을 그대로 반환
 *    - 응답 형식:
 *      {
 *        currentMood: Mood, // 현재 적용 중인 무드
 *        moodStream: Array<{ timestamp: string, mood: Mood }>, // 30분 스트림 (약 10곡)
 *        cluster: '-' | '0' | '+', // 현재 무드의 클러스터
 *        streamStatus: 'maintained' | 'regenerated', // 스트림 상태
 *        nextCheck: string, // 다음 검증 시점 (ISO 8601)
 *        nextStreamReady?: string // 다음 스트림 준비 완료 시점 (유지 시에만)
 *      }
 * 
 * 참고:
 * - 인증이 필요한 엔드포인트
 * - 프론트엔드는 주기적으로(예: 1분마다) 이 API를 호출하여 최신 무드스트림 받음
 * - streamStatus가 'regenerated'이고 현재 노래가 끝나면 새 무드로 전환
 * - 자세한 로직은 MOOD_GENERATION_LOGIC.md 참고
 */
export async function GET(request: NextRequest) {
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
  // const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // const response = await fetch(`${backendUrl}/api/moods/current`, {
  //   method: "GET",
  //   headers: {
  //     "Cookie": request.headers.get("cookie") || "",
  //   },
  // });
  //
  // if (!response.ok) {
  //   return NextResponse.json(
  //     { error: "INTERNAL_ERROR", message: "Failed to fetch current mood" },
  //     { status: 500 }
  //   );
  // }
  //
  // const data = await response.json();
  // return NextResponse.json(data);

  // 목업 응답: 기본 무드 반환
  return NextResponse.json({
    mood: {
      id: "calm-1",
      name: "Calm Breeze",
      color: "#E6F3FF",
      song: { title: "Calm Breeze", duration: 182 },
      scent: { type: "Marine", name: "Wave", color: "#87CEEB" },
    },
    updatedDevices: [],
  });
}

/**
 * PUT /api/moods/current
 * 
 * 무드 전체 변경 API
 * 
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 * 
 * 구현 내용:
 * 1. NextAuth 세션 확인 (인증 필수)
 * 2. 요청 본문에서 moodId 추출
 * 3. 유효성 검사 (moodId가 유효한지 확인)
 * 4. 백엔드 서버로 PUT 요청 전달
 *    - URL: ${BACKEND_URL}/api/moods/current
 *    - Body: { moodId: string }
 *    - Headers: 세션 정보 포함
 * 5. 백엔드 응답을 그대로 반환
 *    - 응답: { mood: Mood, updatedDevices: Device[] }
 * 
 * 참고:
 * - 인증이 필요한 엔드포인트
 * - 무드 변경 시 관련 디바이스(Manager, Light) 상태 자동 업데이트
 * - 색상, 음악, 향 모두 변경
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
  // const response = await fetch(`${backendUrl}/api/moods/current`, {
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

  // 목업 응답: 변경된 무드 반환
  const body = await request.json();
  return NextResponse.json({
    mood: {
      id: body.moodId || "calm-1",
      name: "Calm Breeze",
      color: "#E6F3FF",
      song: { title: "Calm Breeze", duration: 182 },
      scent: { type: "Marine", name: "Wave", color: "#87CEEB" },
    },
    updatedDevices: [],
  });
}

