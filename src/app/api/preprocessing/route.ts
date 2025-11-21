// src/app/api/preprocessing/route.ts
/**
 * [파일 역할]
 * - 오늘 날짜의 생체 데이터(raw_periodic)를 기반으로
 *   스트레스/수면/날씨/선호도/감정 데이터를 종합하여 반환하는 API
 *
 * [구성 요소]
 * 1) 평균 스트레스 지수
 * 2) 최근 스트레스 지수
 * 3) 가장 최근 수면 점수 (수면 세션 기반)
 * 4) 가장 최근 수면 시간
 * 5) 날씨 정보
 * 6) 사용자 선호도 (향/조명/음악 Top3)
 * 7) 한숨/웃음 등 감정 신호
 */

import { NextResponse } from "next/server";
import { startPeriodicListener } from "@/backend/listener/periodicListener";
import { fetchTodayPeriodicRaw } from "@/backend/jobs/fetchTodayPeriodicRaw";
import { calcTodaySleepScore } from "@/backend/jobs/calcTodaySleepScore";
import { fetchWeather } from "@/lib/weather/fetchWeather";

// Preferences
import { getUserPreferences } from "@/lib/preferences/getPreferences";
import { mapPreferencesForAI } from "@/lib/preferences/mapPreferencesForAI";

// Emotion
import { fetchDailySignals } from "@/lib/moodSignals/fetchDailySignals";

// Stress
import { calculateStressIndex } from "@/lib/stress/calculateStressIndex";

if (typeof window === "undefined") {
  startPeriodicListener();
}

const USER_ID = "testUser"; // TODO: JWT/Session 기반 userId로 변경

// ------------------------------------------------------------
// GET /api/preprocessing
// ------------------------------------------------------------
export async function GET() {
  startPeriodicListener();

  try {
    // ------------------------------------------------------------
    // 1) 오늘 날짜 raw_periodic 데이터 조회
    // ------------------------------------------------------------
    const todayRawData = await fetchTodayPeriodicRaw(USER_ID);

    if (todayRawData.length === 0) {
      return new NextResponse(null, { status: 204 });
    }

    // ------------------------------------------------------------
    // 2) 스트레스 계산
    // ------------------------------------------------------------
    const stressScores = todayRawData.map((raw) => calculateStressIndex(raw));

    const averageStressIndex = Math.round(
      stressScores.reduce((a, b) => a + b, 0) / stressScores.length
    );

    const latestRaw = todayRawData[0];
    const recentStressIndex = calculateStressIndex(latestRaw);

    // ------------------------------------------------------------
    // 3) 날씨 정보
    // ------------------------------------------------------------
    let weather = undefined;
    try {
      weather = await fetchWeather();
    } catch (err) {
      console.warn("[preprocessing] 날씨 조회 실패:", err);
    }

    // ------------------------------------------------------------
    // 4) 수면 점수 (수면 세션 기반)
    // ------------------------------------------------------------
    const sleepResult = await calcTodaySleepScore(USER_ID);

    let latestSleepScore: number;
    let latestSleepDuration: number;

    if (sleepResult.score !== null) {
      latestSleepScore = sleepResult.score;
      latestSleepDuration = sleepResult.totalMinutes;
    } else {
      latestSleepScore = 0;
      latestSleepDuration = 0;
    }

    // ------------------------------------------------------------
    // 5) 사용자 선호도
    // ------------------------------------------------------------
    const prefsRow = await getUserPreferences(1);
    const preferences = mapPreferencesForAI(prefsRow);

    // ------------------------------------------------------------
    // 6) 감정(한숨/웃음)
    // ------------------------------------------------------------
    const signals = await fetchDailySignals(USER_ID);

    // ------------------------------------------------------------
    // 7) 최종 JSON 응답
    // ------------------------------------------------------------
    return NextResponse.json(
      {
        average_stress_index: averageStressIndex,
        recent_stress_index: recentStressIndex,

        latest_sleep_score: latestSleepScore,
        latest_sleep_duration: latestSleepDuration,

        ...(weather && {
          weather: {
            temperature: weather.temperature,
            humidity: weather.humidity,
            rainType: weather.rainType,
            sky: weather.sky,
          },
        }),

        preferences,
        mood_signals: signals,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[preprocessing] 에러 발생:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
