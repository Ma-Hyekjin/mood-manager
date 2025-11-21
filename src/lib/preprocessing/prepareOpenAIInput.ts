// src/lib/preprocessing/prepareOpenAIInput.ts
/**
 * [파일 역할]
 * - 전처리된 점수(sleep_score, stress_score)와 날씨 데이터를
 *   OpenAI에 넘길 때 사용할 payload 형태로 변환하는 파일입니다.
 *
 * [디자인 결정]
 * - sleep_score, stress_score, weather를 포함한 payload 생성
 * - timestamp는 현재 시각으로 추가
 * - [EDIT] weather 데이터 추가: 기상청 API에서 가져온 날씨 정보 포함
 *
 * [최종 payload 구조]
 * {
 *   stress: number,
 *   sleep: { score: number, details: object },
 *   weather: { temperature, humidity, rainType, sky },
 *   timestamp: number
 * }
 */

import type { ProcessedMetrics } from "@/lib/preprocessing/preprocess";

export interface OpenAIInputPayload {
  /** 스트레스 지수 (0~100) */
  stress: number;
  /** 수면 정보 */
  sleep: {
    /** 수면 점수 (0~100) */
    score: number;
    /** 수면 세부 정보 (향후 확장 가능) */
    details: Record<string, unknown>;
  };
  /** 날씨 정보 (있는 경우에만 포함) */
  weather?: {
    /** 기온 (°C) */
    temperature: number;
    /** 습도 (%) */
    humidity: number;
    /** 강수형태 (0:없음, 1:비, 2:비/눈, 3:눈) */
    rainType: number;
    /** 하늘상태 (1~4) */
    sky: number;
  };
  /** 타임스탬프 (Unix epoch ms) */
  timestamp: number;
}

export function prepareOpenAIInput(
  metrics: ProcessedMetrics
): OpenAIInputPayload {
  const { sleep_score, stress_score, weather } = metrics;

  return {
    stress: stress_score,
    sleep: {
      score: sleep_score,
      details: {}, // 향후 수면 세부 정보 확장 가능
    },
    // [EDIT] weather 데이터 포함 (있는 경우에만)
    ...(weather && {
      weather: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainType: weather.rainType,
        sky: weather.sky,
      },
    }),
    timestamp: Date.now(),
  };
}
