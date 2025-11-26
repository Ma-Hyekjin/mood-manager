// ======================================================
// File: src/app/api/moods/saved/route.ts
// ======================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * POST /api/moods/saved
 * 
 * 무드를 무드셋에 저장
 * 
 * Request Body:
 * {
 *   moodId: string;
 *   moodName: string;
 *   moodColor: string;
 *   music: { genre: string; title: string };
 *   scent: { type: string; name: string };
 *   preferenceCount?: number;
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   savedMood: { ... };
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { moodId, moodName, moodColor, music, scent, preferenceCount = 0 } = body;

    if (!moodId || !moodName || !moodColor || !music || !scent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: 실제 DB 연동 시 Firestore 사용
    // Firestore 구조:
    // users/{userId}/savedMoods/{savedMoodId}
    // {
    //   moodId, moodName, moodColor, music, scent, preferenceCount,
    //   savedAt: timestamp, updatedAt: timestamp
    // }

    // [MOCK] 목업 응답
    const savedMood = {
      id: `saved-${Date.now()}`,
      moodId,
      moodName,
      moodColor,
      music,
      scent,
      preferenceCount,
      savedAt: Date.now(),
    };

    return NextResponse.json({
      success: true,
      savedMood,
    });
  } catch (error) {
    console.error("Error saving mood:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/moods/saved
 * 
 * 저장된 무드 목록 조회
 * 
 * Response:
 * {
 *   savedMoods: Array<{ ... }>;
 * }
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // TODO: 실제 DB 연동 시 Firestore에서 조회
    // [MOCK] 목업 응답
    const savedMoods = [
      {
        id: "saved-1234567890",
        moodId: "calm-1",
        moodName: "Calm Breeze",
        moodColor: "#E6F3FF",
        music: {
          genre: "newage",
          title: "Calm Breeze",
        },
        scent: {
          type: "Marine",
          name: "Wave",
        },
        preferenceCount: 2,
        savedAt: Date.now() - 86400000, // 1일 전
      },
      {
        id: "saved-1234567891",
        moodId: "focus-1",
        moodName: "Deep Focus",
        moodColor: "#F5F5DC",
        music: {
          genre: "classical",
          title: "Concentration",
        },
        scent: {
          type: "Musk",
          name: "Cloud",
        },
        preferenceCount: 3,
        savedAt: Date.now() - 172800000, // 2일 전
      },
    ];

    return NextResponse.json({
      savedMoods,
    });
  } catch (error) {
    console.error("Error fetching saved moods:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

