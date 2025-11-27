// src/lib/preferences/updatePreferences.ts
/**
 * [파일 역할]
 * - 사용자 선호도(UserPreferences)를 강화학습 기반으로 업데이트하는 핵심 모듈입니다.
 * - 사용자가 어떤 향/조명/음향을 사용했는지 + 감정(웃음/한숨) + 사용시간을 기반으로
 *   user_preferences 테이블의 값을 지속적으로 개인화하여 업데이트합니다.
 *
 * [입력]
 * - userId: number
 * - usage: {
 *      fragrance: string;
 *      light: { R: number; G: number; B: number; brightness: number };
 *      sound: string;
 *      durationMinutes: number;
 *      sighCount: number;
 *      laughCount: number;
 *   }
 *
 * [출력]
 * - 업데이트된 UserPreferences 객체
 *
 * [사용되는 로직]
 * - reward 계산 (사용 시간 + 웃음 + 한숨)
 * - 향 선호도 업데이트 (Top3 재정렬)
 * - 조명(RGB/밝기) 업데이트 (EMA 방식)
 * - 음향 장르 선호 업데이트 (Top3 재정렬)
 *
 * [주의사항]
 * - userId가 유효한지 검사해야 합니다.
 * - Prisma update 실패 시 예외 처리 필요.
 * - update 이후 반드시 정렬된 Top3 구조가 유지됩니다.
 */

import { prisma } from "@/lib/prisma";
import { calculateReward } from "./preferenceUtils";
import { getUserPreferences } from "./getPreferences";
const ALPHA = 0.1; // 학습률 (10%)

export interface MoodUsage {
  fragrance: string;
  light: { R: number; G: number; B: number; brightness: number };
  sound: string;
  durationMinutes: number;
  sighCount: number;
  laughCount: number;
}

type PreferenceData = {
  fragranceTop1?: string | null;
  fragranceTop2?: string | null;
  fragranceTop3?: string | null;
  preferredLightR?: number | null;
  preferredLightG?: number | null;
  preferredLightB?: number | null;
  preferredBrightness?: number | null;
  soundGenreTop1?: string | null;
  soundGenreTop2?: string | null;
  soundGenreTop3?: string | null;
};

/** --------------------------------------------
 * 향 선호도 업데이트 (Top3)
 * -------------------------------------------*/
function updateFragrance(prefs: PreferenceData, used: string, reward: number) {
  const categories = [
    "musk",
    "aromatic",
    "woody",
    "citrus",
    "honey",
    "green",
    "dry",
    "leathery",
    "marine",
    "spicy",
    "floral",
    "powdery",
  ];

  const scores: Record<string, number> = {};
  categories.forEach((c) => (scores[c] = 0));

  // 기존 Top3 반영
  scores[prefs.fragranceTop1 || "citrus"] = 1.0;
  scores[prefs.fragranceTop2 || "floral"] = 0.7;
  scores[prefs.fragranceTop3 || "woody"] = 0.4;

  // 강화
  scores[used] = scores[used] * (1 - ALPHA) + reward * ALPHA;

  // 상위 3개 정렬
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);

  prefs.fragranceTop1 = sorted[0];
  prefs.fragranceTop2 = sorted[1];
  prefs.fragranceTop3 = sorted[2];

  return prefs;
}

/** --------------------------------------------
 * 조명 업데이트 (RGB + 밝기)
 * -------------------------------------------*/
function updateLighting(prefs: PreferenceData, usage: MoodUsage, _reward: number) {
  prefs.preferredLightR =
    (prefs.preferredLightR || 255) * (1 - ALPHA) + usage.light.R * ALPHA;
  prefs.preferredLightG =
    (prefs.preferredLightG || 255) * (1 - ALPHA) + usage.light.G * ALPHA;
  prefs.preferredLightB =
    (prefs.preferredLightB || 255) * (1 - ALPHA) + usage.light.B * ALPHA;

  prefs.preferredBrightness =
    (prefs.preferredBrightness || 100) * (1 - ALPHA) +
    usage.light.brightness * ALPHA;

  return prefs;
}

/** --------------------------------------------
 * 음향 장르 업데이트 (Top3)
 * -------------------------------------------*/
function updateSound(prefs: PreferenceData, usedGenre: string, _reward: number) {
  const scores: Record<string, number> = {};

  const genres = [
    prefs.soundGenreTop1,
    prefs.soundGenreTop2,
    prefs.soundGenreTop3,
    usedGenre,
  ];

  const uniqueGenres = Array.from(new Set(genres)).filter((g): g is string => !!g);

  uniqueGenres.forEach((g) => (scores[g] = 0));

  scores[prefs.soundGenreTop1 || "pop"] = 1.0;
  scores[prefs.soundGenreTop2 || "jazz"] = 0.7;
  scores[prefs.soundGenreTop3 || "classical"] = 0.4;

  scores[usedGenre] = (scores[usedGenre] || 0) * (1 - ALPHA) + _reward * ALPHA;

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);

  prefs.soundGenreTop1 = sorted[0];
  prefs.soundGenreTop2 = sorted[1];
  prefs.soundGenreTop3 = sorted[2];

  return prefs;
}

/** --------------------------------------------
 * 메인: 사용자 선호도 업데이트
 * -------------------------------------------*/
export async function updateUserPreferences(
  userId: number,
  usage: MoodUsage
) {
  const prefs = await getUserPreferences(userId);
  if (!prefs) return null;

  // Narrowing 강제
  const p = prefs;

  const reward = calculateReward(
    usage.durationMinutes,
    usage.laughCount,
    usage.sighCount
  );

  const updatedPrefs1 = updateFragrance(p, usage.fragrance, reward);
  const updatedPrefs2 = updateLighting(updatedPrefs1, usage, reward);
  const updatedPrefs = updateSound(updatedPrefs2, usage.sound, reward);

  const updated = await prisma.userPreferences.update({
    where: { userId },
    data: {
      fragranceTop1: updatedPrefs.fragranceTop1 ?? undefined,
      fragranceTop2: updatedPrefs.fragranceTop2 ?? undefined,
      fragranceTop3: updatedPrefs.fragranceTop3 ?? undefined,

      preferredLightR: updatedPrefs.preferredLightR !== null && updatedPrefs.preferredLightR !== undefined ? Math.round(updatedPrefs.preferredLightR) : undefined,
      preferredLightG: updatedPrefs.preferredLightG !== null && updatedPrefs.preferredLightG !== undefined ? Math.round(updatedPrefs.preferredLightG) : undefined,
      preferredLightB: updatedPrefs.preferredLightB !== null && updatedPrefs.preferredLightB !== undefined ? Math.round(updatedPrefs.preferredLightB) : undefined,
      preferredBrightness: updatedPrefs.preferredBrightness ?? undefined,

      soundGenreTop1: updatedPrefs.soundGenreTop1 ?? undefined,
      soundGenreTop2: updatedPrefs.soundGenreTop2 ?? undefined,
      soundGenreTop3: updatedPrefs.soundGenreTop3 ?? undefined,
    },
  });

  return updated;
}
