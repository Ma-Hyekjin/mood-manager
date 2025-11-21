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

import { PrismaClient } from "@prisma/client";
import { clamp, calculateReward, rgbDistanceScore } from "./preferenceUtils";
import { getUserPreferences } from "./getPreferences";

const prisma = new PrismaClient();
const ALPHA = 0.1; // 학습률 (10%)

export interface MoodUsage {
  fragrance: string;
  light: { R: number; G: number; B: number; brightness: number };
  sound: string;
  durationMinutes: number;
  sighCount: number;
  laughCount: number;
}

/** --------------------------------------------
 * 향 선호도 업데이트 (Top3)
 * -------------------------------------------*/
function updateFragrance(prefs: any, used: string, reward: number) {
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

  let scores: Record<string, number> = {};
  categories.forEach((c) => (scores[c] = 0));

  // 기존 Top3 반영
  scores[prefs.fragrance_top1] = 1.0;
  scores[prefs.fragrance_top2] = 0.7;
  scores[prefs.fragrance_top3] = 0.4;

  // 강화
  scores[used] = scores[used] * (1 - ALPHA) + reward * ALPHA;

  // 상위 3개 정렬
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);

  prefs.fragrance_top1 = sorted[0];
  prefs.fragrance_top2 = sorted[1];
  prefs.fragrance_top3 = sorted[2];

  return prefs;
}

/** --------------------------------------------
 * 조명 업데이트 (RGB + 밝기)
 * -------------------------------------------*/
function updateLighting(prefs: any, usage: MoodUsage, reward: number) {
  prefs.preferred_light_R =
    prefs.preferred_light_R * (1 - ALPHA) + usage.light.R * ALPHA;
  prefs.preferred_light_G =
    prefs.preferred_light_G * (1 - ALPHA) + usage.light.G * ALPHA;
  prefs.preferred_light_B =
    prefs.preferred_light_B * (1 - ALPHA) + usage.light.B * ALPHA;

  prefs.preferred_brightness =
    prefs.preferred_brightness * (1 - ALPHA) +
    usage.light.brightness * ALPHA;

  return prefs;
}

/** --------------------------------------------
 * 음향 장르 업데이트 (Top3)
 * -------------------------------------------*/
function updateSound(prefs: any, usedGenre: string, reward: number) {
  let scores: Record<string, number> = {};

  const genres = [
    prefs.sound_genre_top1,
    prefs.sound_genre_top2,
    prefs.sound_genre_top3,
    usedGenre,
  ];

  const uniqueGenres = Array.from(new Set(genres));

  uniqueGenres.forEach((g) => (scores[g] = 0));

  scores[prefs.sound_genre_top1] = 1.0;
  scores[prefs.sound_genre_top2] = 0.7;
  scores[prefs.sound_genre_top3] = 0.4;

  scores[usedGenre] = scores[usedGenre] * (1 - ALPHA) + reward * ALPHA;

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);

  prefs.sound_genre_top1 = sorted[0];
  prefs.sound_genre_top2 = sorted[1];
  prefs.sound_genre_top3 = sorted[2];

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
      fragrance_top1: updatedPrefs.fragrance_top1 ?? undefined,
      fragrance_top2: updatedPrefs.fragrance_top2 ?? undefined,
      fragrance_top3: updatedPrefs.fragrance_top3 ?? undefined,
  
      preferred_light_R: updatedPrefs.preferred_light_R ?? undefined,
      preferred_light_G: updatedPrefs.preferred_light_G ?? undefined,
      preferred_light_B: updatedPrefs.preferred_light_B ?? undefined,
      preferred_brightness: updatedPrefs.preferred_brightness ?? undefined,
  
      sound_genre_top1: updatedPrefs.sound_genre_top1 ?? undefined,
      sound_genre_top2: updatedPrefs.sound_genre_top2 ?? undefined,
      sound_genre_top3: updatedPrefs.sound_genre_top3 ?? undefined,
    },
  });

  return updated;
}
