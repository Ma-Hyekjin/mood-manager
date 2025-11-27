// src/app/api/preferences/route.ts
/**
 * [파일 역할]
 * - 사용자 선호도 저장 및 조회 API
 * - 설문 완료 시 선호도를 DB에 저장
 * - LLM Input 형식(Record<string, '+' | '-'>)으로 저장
 *
 * [사용되는 위치]
 * - POST /api/preferences: 설문 완료 시 선호도 저장
 * - GET /api/preferences: 사용자 선호도 조회
 *
 * [주의사항]
 * - 인증이 필요한 엔드포인트
 * - 선호도는 JSON 형식으로 저장 (scentPreferences, colorPreferences, musicPreferences)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/preferences
 *
 * 사용자 선호도 조회
 *
 * 응답:
 * - 성공: { success: true, preferences: {...} }
 * - 실패: { error: "ERROR_CODE", message: "에러 메시지" }
 */
export async function GET(_request: NextRequest) {
  try {
    // 1. 세션 검증
    const sessionOrError = await requireAuth();
    if (sessionOrError instanceof NextResponse) {
      return sessionOrError;
    }
    const session = sessionOrError;

    // 2. 선호도 조회
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      preferences: preferences || null,
    });
  } catch (error) {
    console.error("[GET /api/preferences] 선호도 조회 실패:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "선호도 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/preferences
 *
 * 사용자 선호도 저장 (설문 완료 시)
 *
 * 요청:
 * {
 *   "scentLiked": ["Citrus", "Floral", "Woody"],
 *   "scentDisliked": ["Musk", "Leathery"],
 *   "colorLiked": ["warmWhite", "skyBlue"],
 *   "colorDisliked": ["red"],
 *   "musicLiked": ["newage", "classical"],
 *   "musicDisliked": ["jazz"]
 * }
 *
 * 응답:
 * - 성공: { success: true }
 * - 실패: { error: "ERROR_CODE", message: "에러 메시지" }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 세션 검증
    const sessionOrError = await requireAuth();
    if (sessionOrError instanceof NextResponse) {
      return sessionOrError;
    }
    const session = sessionOrError;

    // 2. 요청 본문 파싱
    const body = await request.json();
    const {
      scentLiked,
      scentDisliked,
      colorLiked,
      colorDisliked,
      musicLiked,
      musicDisliked,
    } = body;

    // 3. 배열을 쉼표로 구분된 문자열로 변환
    const scentLikedStr = Array.isArray(scentLiked) ? scentLiked.join(',') : null;
    const scentDislikedStr = Array.isArray(scentDisliked) ? scentDisliked.join(',') : null;
    const colorLikedStr = Array.isArray(colorLiked) ? colorLiked.join(',') : null;
    const colorDislikedStr = Array.isArray(colorDisliked) ? colorDisliked.join(',') : null;
    const musicLikedStr = Array.isArray(musicLiked) ? musicLiked.join(',') : null;
    const musicDislikedStr = Array.isArray(musicDisliked) ? musicDisliked.join(',') : null;

    // 4. 선호도 저장 (upsert)
    await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        scentLiked: scentLikedStr,
        scentDisliked: scentDislikedStr,
        colorLiked: colorLikedStr,
        colorDisliked: colorDislikedStr,
        musicLiked: musicLikedStr,
        musicDisliked: musicDislikedStr,
      },
      update: {
        scentLiked: scentLikedStr,
        scentDisliked: scentDislikedStr,
        colorLiked: colorLikedStr,
        colorDisliked: colorDislikedStr,
        musicLiked: musicLikedStr,
        musicDisliked: musicDislikedStr,
      },
    });

    // 5. User.hasSurvey 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hasSurvey: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/preferences] 선호도 저장 실패:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "선호도 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
