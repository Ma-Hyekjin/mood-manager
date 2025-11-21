// src/app/api/preprocessing/route.ts
/**
 * [파일 역할]
 * - 프론트엔드 또는 다른 백엔드 로직에서
 *   "오늘 날짜의 수면/스트레스 지표"를 조회할 수 있는 API 엔드포인트입니다.
 *
 * [EDIT] API 응답 형식 완전히 변경
 * 기존: raw_periodic 1개당 { sleep_score, stress_score, updated_at } 반환
 * 변경: 오늘 날짜의 모든 데이터를 조회하여 다음 지표 반환
 *   1. 그 날의 평균 스트레스 지수
 *   2. 최근 스트레스 지수
 *   3. 가장 최근 수면의 수면 점수
 *   4. 가장 최근 수면의 수면 시간
 *   5. 날씨 정보 (기온, 습도, 강수형태, 하늘상태)
 *
 * [응답 형태]
 * 200 OK:
 *   {
 *     "average_stress_index": number,    // 그 날의 평균 스트레스 지수 (0~100)
 *     "recent_stress_index": number,     // 최근 스트레스 지수 (0~100)
 *     "latest_sleep_score": number,     // 가장 최근 수면의 수면 점수 (0~100)
 *     "latest_sleep_duration": number,  // 가장 최근 수면의 수면 시간 (분)
 *     "weather": {                       // [EDIT] 날씨 정보 추가
 *       "temperature": number,           // 기온 (°C)
 *       "humidity": number,              // 습도 (%)
 *       "rainType": number,              // 강수형태 (0:없음, 1:비, 2:비/눈, 3:눈)
 *       "sky": number                    // 하늘상태 (1~4)
 *     }
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
// [EDIT] 날씨 데이터 가져오기 추가
import { fetchWeather } from "@/lib/weather/fetchWeather";

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

    // [EDIT] 날씨 데이터 가져오기 추가
    // 기상청 API를 호출하여 현재 날씨 정보를 가져옵니다.
    // API 호출 실패 시에도 응답은 계속 진행합니다 (weather는 optional).
    let weather;
    try {
      weather = await fetchWeather();
      // eslint-disable-next-line no-console
      console.log("[preprocessing] 날씨 데이터 조회 성공:", weather);
    } catch (weatherError) {
      // eslint-disable-next-line no-console
      console.warn(
        "[preprocessing] 날씨 데이터 조회 실패, 응답은 계속 진행:",
        weatherError
      );
      // weather는 undefined로 유지되어 optional 처리됨
    }

    const latestMetrics = preprocessPeriodicSample(latestRaw, weather);
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

    // 6) 응답 반환 (4가지 지표 + 날씨 정보)
    return NextResponse.json(
      {
        average_stress_index: averageStressIndex,
        recent_stress_index: recentStressIndex,
        latest_sleep_score: latestSleepScore,
        latest_sleep_duration: latestSleepDuration,
        // [EDIT] 날씨 정보 포함 (있는 경우에만)
        ...(weather && {
          weather: {
            temperature: weather.temperature,
            humidity: weather.humidity,
            rainType: weather.rainType,
            sky: weather.sky,
          },
        }),
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
