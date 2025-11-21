// src/app/api/preprocessing/route.ts
/**
 * [파일 역할]
 * - 프론트엔드 또는 다른 백엔드 로직에서
 *   "오늘 날짜의 수면/스트레스 지표"를 조회할 수 있는 API 엔드포인트입니다.
 *
 * [EDIT] API 응답 형식 완전히 변경
 * 기존: raw_periodic 1개당 { sleep_score, stress_score, updated_at } 반환
 * 변경: 오늘 날짜의 모든 데이터를 조회하여 다음 4가지 지표 반환
 *   1. 그 날의 평균 스트레스 지수
 *   2. 최근 스트레스 지수
 *   3. 가장 최근 수면의 수면 점수
 *   4. 가장 최근 수면의 수면 시간
 *
 * [응답 형태]
 * 200 OK:
 *   {
 *     "average_stress_index": number,    // 그 날의 평균 스트레스 지수 (0~100)
 *     "recent_stress_index": number,     // 최근 스트레스 지수 (0~100)
 *     "latest_sleep_score": number,     // 가장 최근 수면의 수면 점수 (0~100)
 *     "latest_sleep_duration": number    // 가장 최근 수면의 수면 시간 (분)
 *   }
 *
 * 204 No Content:
 *   - 오늘 날짜의 데이터가 없는 경우
 *
 * [주의사항]
 * - 이 API는 오늘 날짜의 모든 raw_periodic 데이터를 조회하여 계산합니다.
 * - OpenAI API 라우트에서 이 엔드포인트를 먼저 호출해서
 *   지표를 가져간 뒤, 프롬프트에 포함시키면 됨.
 */

import { NextResponse } from "next/server";
import { startPeriodicListener } from "@/backend/listener/periodicListener";
// [EDIT] fetchTodayPeriodicRaw 새로 추가: 오늘 날짜의 모든 raw_periodic 데이터 조회
import { fetchTodayPeriodicRaw } from "@/backend/jobs/fetchTodayPeriodicRaw";
import { preprocessPeriodicSample } from "@/lib/preprocessing";
import { calcTodaySleepScore } from "@/backend/jobs/calcTodaySleepScore";

// 서버리스 환경에서는 모듈 레벨 호출이 매번 실행될 수 있으므로
// 함수 내부에서 호출하는 것이 더 안전하지만,
// 현재는 중복 방지 로직이 있어서 모듈 레벨에서 호출해도 문제없음
if (typeof window === "undefined") {
  startPeriodicListener();
}

// TODO: 실제 서비스에서는 세션/토큰에서 userId 추출
const USER_ID = "testUser";

export async function GET() {
  // 서버리스 환경 대응: 요청마다 리스너 시작 시도 (중복 방지 로직으로 안전)
  startPeriodicListener();

  try {
    // [EDIT] 기존 로직 완전히 재작성
    // 1) 오늘 날짜의 모든 raw_periodic 데이터 가져오기
    const todayRawData = await fetchTodayPeriodicRaw(USER_ID);

    if (todayRawData.length === 0) {
      // 오늘 날짜의 데이터가 없는 경우
      return new NextResponse(null, { status: 204 });
    }

    // 2) 각 raw 데이터에 대해 스트레스 지수 계산
    const stressScores: number[] = [];
    for (const raw of todayRawData) {
      const metrics = preprocessPeriodicSample(raw);
      stressScores.push(metrics.stress_score);
    }

    // 3) 그 날의 평균 스트레스 지수 계산
    const averageStressIndex = Math.round(
      stressScores.reduce((sum, score) => sum + score, 0) / stressScores.length
    );

    // 4) 최근 스트레스 지수 (가장 최근 raw_periodic의 stress_score)
    // fetchTodayPeriodicRaw에서 이미 timestamp desc로 정렬되어 있음
    const latestRaw = todayRawData[0];
    const latestMetrics = preprocessPeriodicSample(latestRaw);
    const recentStressIndex = latestMetrics.stress_score;

    // 5) 가장 최근 수면의 수면 점수 및 수면 시간 계산
    // [EDIT] 항상 수면 세션 기반으로 계산 (수면 시간 반영)
    const sleepResult = await calcTodaySleepScore(USER_ID);
    
    let latestSleepScore: number;
    let latestSleepDuration: number;

    if (sleepResult.score !== null) {
      // 수면 세션이 있는 경우
      latestSleepScore = sleepResult.score;
      latestSleepDuration = sleepResult.totalMinutes; // 타입 가드로 인해 number로 추론됨
    } else {
      // 수면 세션이 없는 경우: 수면 점수 0, 수면 시간 0 반환
      // 단일 raw_periodic의 수면 점수는 의미가 없으므로 사용하지 않음
      latestSleepScore = 0;
      latestSleepDuration = 0;
    }

    // 6) 응답 반환 (4가지 지표)
    return NextResponse.json(
      {
        average_stress_index: averageStressIndex,
        recent_stress_index: recentStressIndex,
        latest_sleep_score: latestSleepScore,
        latest_sleep_duration: latestSleepDuration,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[preprocessing] 에러 발생:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
