// src/lib/preprocessing/preprocess.ts
/**
 * [파일 역할]
 * - raw_periodic 한 건(단일 샘플)을 입력받아
 *   수면 점수(sleep_score)와 스트레스 점수(stress_score)를 계산하는
 *   “전처리 핵심 엔진” 파일입니다.
 *
 * [전체 파이프라인 연결 흐름]
 * 1) WearOS → Firestore(users/{userId}/raw_periodic)에 raw 데이터 저장
 * 2) backend/listener/periodicListener.ts 에서 raw_periodic 컬렉션을 onSnapshot으로 구독
 * 3) 새 문서가 감지되면 backend/jobs/preprocessPeriodic.ts 호출
 * 4) preprocessPeriodic.ts → 이 파일의 preprocessPeriodicSample() 호출
 * 5) 여기서 sleep_score / stress_score를 계산
 * 6) backend/cache/periodicCache.ts 에 결과를 저장
 * 7) /api/preprocessing route 에서 최신 score를 응답
 * 8) OpenAI 호출 시 { sleep_score, stress_score }를 그대로 전달
 *
 * [입력]
 * - PeriodicRaw (src/lib/types/periodic.ts 참고)
 *
 * [출력]
 * - { sleep_score: number, stress_score: number }
 *
 * [주의사항]
 * - 이 함수는 "단일 샘플용" 전처리입니다.
 *   → 수면 세션(여러 샘플)의 평균 점수 등은 별도 함수로 확장 예정.
 */

import { PeriodicRaw } from "@/lib/types/periodic";
import { calculateSleepScore } from "@/lib/sleep";
import { calculateStressIndex } from "@/lib/stress";

export interface ProcessedMetrics {
  sleep_score: number;   // 0~100
  stress_score: number;  // 0~100
}

export function preprocessPeriodicSample(raw: PeriodicRaw): ProcessedMetrics {
  // 수면 점수 계산 (0~100)
  const sleep_score = calculateSleepScore(raw);

  // 스트레스 점수 계산 (0~100)
  const stress_score = calculateStressIndex(raw);

  return {
    sleep_score,
    stress_score,
  };
}
