// src/lib/preprocessing/prepareOpenAIInput.ts
/**
 * [파일 역할]
 * - 전처리된 점수(sleep_score, stress_score)를
 *   OpenAI에 넘길 때 사용할 payload 형태로 변환하는 파일입니다.
 *
 * [디자인 결정]
 * - 현재는 단순히 숫자 두 개만 넘김:
 *   { sleep_score: number, stress_score: number }
 * - timestamp, 세부 feature(Deep/REM 등)는 포함하지 않음 (MVP 기준)
 */

import type { ProcessedMetrics } from "@/lib/preprocessing/preprocess";

export interface OpenAIInputPayload {
  sleep_score: number;   // 0~100
  stress_score: number;  // 0~100
}

export function prepareOpenAIInput(
  metrics: ProcessedMetrics
): OpenAIInputPayload {
  const { sleep_score, stress_score } = metrics;

  return {
    sleep_score,
    stress_score,
  };
}
