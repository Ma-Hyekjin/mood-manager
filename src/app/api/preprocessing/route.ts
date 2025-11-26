// src/app/api/preprocessing/route.ts
/**
 * GET /api/preprocessing
 * 
 * 오늘 날짜의 전처리된 데이터 조회
 * 
 * [응답 구조]
 * - average_stress_index: 그 날의 평균 스트레스 지수 (0~100)
 * - recent_stress_index: 최근 스트레스 지수 (0~100)
 * - latest_sleep_score: 최근 수면 점수 (0~100)
 * - latest_sleep_duration: 최근 수면 시간 (분)
 * - weather: 날씨 정보
 * - emotionEvents: 감정 이벤트 (타임스탬프 배열)
 * 
 * [204 응답]
 * - 오늘 날짜의 데이터가 없는 경우
 * - 프론트엔드에서 기본값 사용
 */

import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";

/**
 * [MOCK] 목업 모드
 * TODO: HJ 브랜치의 실제 구현으로 교체
 */
export async function GET() {
  // TODO: 세션 확인
  // const session = await getServerSession();
  // if (!session) {
  //   return NextResponse.json(
  //     { error: "UNAUTHORIZED", message: "Authentication required" },
  //     { status: 401 }
  //   );
  // }

  // TODO: 실제 데이터 조회
  // const userId = session.user.id;
  // const todayRawData = await fetchTodayPeriodicRaw(userId);
  // if (todayRawData.length === 0) {
  //   return new NextResponse(null, { status: 204 });
  // }

  // [MOCK] 목업 데이터
  const mockData = {
    average_stress_index: 45,
    recent_stress_index: 39,
    latest_sleep_score: 79,
    latest_sleep_duration: 600,
    weather: {
      temperature: 9.6,
      humidity: 26,
      rainType: 0, // 0: 없음, 1: 비, 2: 비/눈, 3: 눈
      sky: 1, // 1: 맑음, 3: 구름 많음, 4: 흐림
    },
    emotionEvents: {
      laughter: [Date.now() - 3600000, Date.now() - 7200000], // 1시간 전, 2시간 전
      sigh: [Date.now() - 1800000], // 30분 전
      anger: [],
      sadness: [],
      neutral: [Date.now() - 900000], // 15분 전 (기본값)
    },
  };

  return NextResponse.json(mockData, { status: 200 });
}

