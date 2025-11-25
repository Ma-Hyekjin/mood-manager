// src/lib/auth/session.ts
/**
 * [파일 역할]
 * - NextAuth 세션 검증 헬퍼 함수 제공
 * - API Route Handler에서 인증된 사용자 정보를 쉽게 가져올 수 있도록 지원
 *
 * [사용되는 위치]
 * - 인증이 필요한 모든 API Route Handler
 * - 예: /api/devices, /api/moods, /api/auth/profile 등
 *
 * [주의사항]
 * - NextAuth의 getServerSession 함수는 App Router에서만 사용 가능
 * - 클라이언트 컴포넌트에서는 useSession 훅 사용
 */

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * 세션 타입 정의
 * - NextAuth 세션 구조에 맞춰 타입 정의
 */
export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
}

/**
 * 현재 요청의 세션 정보를 가져옵니다.
 *
 * @returns 세션 정보 (로그인된 경우) 또는 null (로그인 안 된 경우)
 *
 * @example
 * const session = await getSession();
 * if (!session) {
 *   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 * }
 * const userId = session.user.id;
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return null;
    }

    // NextAuth 세션을 우리 타입으로 변환
    return {
      user: {
        id: (session.user as { id?: string }).id || "",
        email: session.user.email || "",
        name: session.user.name || null,
        image: session.user.image || null,
      },
    };
  } catch (error) {
    console.error("[getSession] 세션 조회 실패:", error);
    return null;
  }
}

/**
 * 세션을 검증하고, 인증되지 않은 경우 401 응답을 반환합니다.
 *
 * @returns 세션 정보 또는 401 NextResponse
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   const sessionOrError = await requireAuth();
 *   if (sessionOrError instanceof NextResponse) {
 *     return sessionOrError; // 401 응답 반환
 *   }
 *   const session = sessionOrError;
 *   // 인증된 사용자 처리...
 * }
 */
export async function requireAuth(): Promise<AuthSession | NextResponse> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        error: "UNAUTHORIZED",
        message: "인증이 필요합니다.",
      },
      { status: 401 }
    );
  }

  return session;
}

/**
 * 사용자 ID만 추출하는 헬퍼 함수
 *
 * @returns 사용자 ID 또는 null
 *
 * @example
 * const userId = await getUserId();
 * if (!userId) {
 *   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 * }
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.id || null;
}
