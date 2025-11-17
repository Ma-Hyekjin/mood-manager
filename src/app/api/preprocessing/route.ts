// src/app/api/preprocessing/route.ts
/**
 * [파일 역할]
 * - 프론트엔드 또는 다른 백엔드 로직에서
 *   "현재 최신 수면 점수 / 스트레스 점수"를 조회할 수 있는 API 엔드포인트입니다.
 *
 * [응답 형태]
 * 200 OK:
 *   {
 *     "sleep_score": number,   // 0~100
 *     "stress_score": number,  // 0~100
 *     "updated_at": number     // 캐시에 업데이트된 시각 (epoch ms)
 *   }
 *
 * 204 No Content:
 *   - 아직 전처리된 데이터가 없는 경우
 *
 * [주의사항]
 * - 이 API는 “전처리 결과 조회용”이므로 raw 데이터는 반환하지 않음.
 * - OpenAI API 라우트에서 이 엔드포인트를 먼저 호출해서
 *   score를 가져간 뒤, 프롬프트에 포함시키면 됨.
 */

import { NextResponse } from "next/server";
import { startPeriodicListener } from "@/backend/listener/periodicListener";
import { getProcessedMetrics } from "@/backend/cache/periodicCache";

// 서버리스 환경에서는 모듈 레벨 호출이 매번 실행될 수 있으므로
// 함수 내부에서 호출하는 것이 더 안전하지만,
// 현재는 중복 방지 로직이 있어서 모듈 레벨에서 호출해도 문제없음
if (typeof window === "undefined") {
  startPeriodicListener();
}

export async function GET() {
  // 서버리스 환경 대응: 요청마다 리스너 시작 시도 (중복 방지 로직으로 안전)
  startPeriodicListener();

  const metrics = getProcessedMetrics();

  if (!metrics) {
    // 아직 어떤 데이터도 전처리되지 않은 상태
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(metrics, { status: 200 });
}
