// src/lib/sleep/calculateSleepScore.ts
/**
 * [파일 역할]
 * - Firestore(raw_periodic)에 저장된 단일 생체신호(raw 데이터)를 입력받아
 *   "수면 점수(SleepScore: 0~100)"를 계산하는 공식 모듈입니다.
 *
 * [이 파일이 필요한 이유]
 * - WearOS의 raw 데이터는 그 자체로는 의미가 없고,
 *   "수면 점수"라는 **추상적 상태 정보**로 변환해야
 *   무드 추천, 사용자 맞춤 피드백, OpenAI 모델 입력 등에 활용 가능함.
 *
 * [수면 점수 공식 — Specification 100% 반영]
 * Inputs:
 *   heart_rate_avg        평균 심박수 (bpm)
 *   hrv_sdnn             HRV SDNN (ms)
 *   movement_count       움직임 횟수
 *   respiratory_rate_avg 평균 호흡수 (brpm)
 *   timestamp            점수 계산에 사용하지 않음
 *
 * -----------------------------
 *  정규화 규칙 (0 ~ 1 스케일링)
 * -----------------------------
 * 1) HR_score (0~1)
 *    best_hr = 50
 *    worst_hr = 90
 *    HR_score = clamp((worst_hr - HR) / (worst_hr - best_hr))
 *
 * 2) SDNN_score (0~1)
 *    min_sdnn = 20
 *    max_sdnn = 100
 *    SDNN_score = clamp((SDNN - min_sdnn) / (max_sdnn - min_sdnn))
 *
 * 3) Movement_score (0~1)
 *    best_mov = 0
 *    worst_mov = 60
 *    Movement_score = clamp((worst_mov - MOV) / worst_mov)
 *
 * 4) Resp_score (0~1)
 *    normal_resp = 16
 *    Resp_score = clamp(1 - |RESP - normal_resp| / 8)
 *
 *
 * -----------------------------
 *   가중치 적용 (Weighted Sum)
 * -----------------------------
 *   w_hr   = 0.30
 *   w_sdnn = 0.30
 *   w_mov  = 0.25
 *   w_resp = 0.15
 *
 *   SleepScore_0to1 =
 *      HR_score   * w_hr +
 *      SDNN_score * w_sdnn +
 *      Movement_score * w_mov +
 *      Resp_score * w_resp
 *
 *
 * -----------------------------
 *   최종 수면 점수 (0~100)
 * -----------------------------
 *   SleepScore = round(SleepScore_0to1 * 100)
 *
 *
 * [주의사항]
 * - timestamp는 입력으로 들어오지만 수면 점수 계산에는 사용하지 않습니다.
 * - 이 점수는 "즉시 수면 상태"를 반영하는 간단한 모델이며,
 *   실제 수면 세션 전체 분석 기능과는 별개입니다.
 */

import { PeriodicRaw } from "@/lib/types/periodic";
import { clamp } from "./utils";

export function calculateSleepScore(data: PeriodicRaw): number {
  const HR = data.heart_rate_avg ?? 0;
  const SDNN = data.hrv_sdnn ?? 0;
  const MOV = data.movement_count ?? 0;
  const RESP = data.respiratory_rate_avg ?? 0;

  // -------------------------------
  // 1) HR Score
  // -------------------------------
  const best_hr = 50;
  const worst_hr = 90;

  const HR_score = clamp(
    (worst_hr - HR) / (worst_hr - best_hr),
    0,
    1
  );

  // -------------------------------
  // 2) SDNN Score
  // -------------------------------
  const min_sdnn = 20;
  const max_sdnn = 100;

  const SDNN_score = clamp(
    (SDNN - min_sdnn) / (max_sdnn - min_sdnn),
    0,
    1
  );

  // -------------------------------
  // 3) Movement Score
  // -------------------------------
  const best_mov = 0;
  const worst_mov = 60;

  const Movement_score = clamp(
    (worst_mov - MOV) / worst_mov,
    0,
    1
  );

  // -------------------------------
  // 4) Respiration Score
  // -------------------------------
  const normal_resp = 16;

  const Resp_score = clamp(
    1 - Math.abs(RESP - normal_resp) / 8,
    0,
    1
  );

  // -------------------------------
  // 5) 가중치 조합
  // -------------------------------
  const w_hr = 0.30;
  const w_sdnn = 0.30;
  const w_mov = 0.25;
  const w_resp = 0.15;

  const SleepScore_0to1 =
    HR_score * w_hr +
    SDNN_score * w_sdnn +
    Movement_score * w_mov +
    Resp_score * w_resp;

  // -------------------------------
  // 6) 최종 점수 변환 (0~100)
  // -------------------------------
  const SleepScore = Math.round(SleepScore_0to1 * 100);

  return SleepScore;
}
