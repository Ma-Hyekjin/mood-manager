// src/lib/preferences/mapPreferencesForAI.ts
/**
 * UserPreferences DB row → LLM Input 형식으로 변환
 *
 * [변환 로직]
 * - Top3 선호도 → '+' (좋아함)
 * - 나머지 항목 → 'else: +' (기본 긍정)
 * - 싫어하는 항목(-)은 현재 DB에 없어서 미지원
 */

import type { UserPreferences } from "@prisma/client";

// 모든 향 타입 목록 (Fragrance componentsJson.type 기준)
const ALL_SCENT_TYPES = [
  "musk", "aromatic", "woody", "citrus", "honey",
  "green", "dry", "leathery", "marine", "spicy",
  "floral", "powdery"
];

// 모든 음악 장르 목록 (Sound componentsJson.genre 기준)
const ALL_MUSIC_GENRES = [
  "newage", "classical", "jazz", "rnb-soul",
  "electronic-dance", "pop", "rock", "ambient"
];

// 모든 색상 목록 (Light color 기준)
const ALL_COLORS = [
  "warmWhite", "softPink", "skyBlue", "lavender",
  "mint", "peach", "lemonYellow", "coral",
  "black", "green", "red", "blue", "purple"
];

/**
 * UserPreferences → LLM Input 형식 변환
 */
export function mapPreferencesForAI(prefs: UserPreferences | null) {
  if (!prefs) {
    return {
      music: { else: "+" } as Record<string, '+' | '-'>,
      color: { else: "+" } as Record<string, '+' | '-'>,
      scent: { else: "+" } as Record<string, '+' | '-'>,
    };
  }

  // 1. 향 선호도 (Top3 → '+', 나머지 → 'else: +')
  const scentPreferences: Record<string, '+' | '-'> = {};
  const likedScents = [
    prefs.fragranceTop1,
    prefs.fragranceTop2,
    prefs.fragranceTop3
  ].filter(Boolean) as string[];

  likedScents.forEach(scent => {
    scentPreferences[scent.toLowerCase()] = '+';
  });

  // 나머지는 'else: +'
  scentPreferences.else = '+';

  // 2. 음악 장르 선호도 (Top3 → '+', 나머지 → 'else: +')
  const musicPreferences: Record<string, '+' | '-'> = {};
  const likedGenres = [
    prefs.soundGenreTop1,
    prefs.soundGenreTop2,
    prefs.soundGenreTop3
  ].filter(Boolean) as string[];

  likedGenres.forEach(genre => {
    musicPreferences[genre.toLowerCase()] = '+';
  });

  // 나머지는 'else: +'
  musicPreferences.else = '+';

  // 3. 색상 선호도 (RGB → 색상명 변환)
  const colorPreferences: Record<string, '+' | '-'> = {};

  if (prefs.preferredLightR !== null && prefs.preferredLightG !== null && prefs.preferredLightB !== null) {
    // RGB 값으로 색상명 추론
    const colorName = rgbToColorName(
      prefs.preferredLightR,
      prefs.preferredLightG,
      prefs.preferredLightB
    );
    colorPreferences[colorName] = '+';
  }

  // 나머지는 'else: +'
  colorPreferences.else = '+';

  return {
    music: musicPreferences,
    color: colorPreferences,
    scent: scentPreferences,
  };
}

/**
 * RGB 값을 색상명으로 변환
 */
function rgbToColorName(r: number, g: number, b: number): string {
  // 간단한 색상 매핑 (대표 색상만)
  if (r > 200 && g > 200 && b > 200) return "warmWhite";
  if (r > 200 && g < 100 && b < 100) return "red";
  if (r < 100 && g > 200 && b < 100) return "green";
  if (r < 100 && g < 100 && b > 200) return "blue";
  if (r > 150 && g > 100 && b < 100) return "coral";
  if (r > 150 && g < 100 && b > 150) return "purple";
  if (r < 50 && g < 50 && b < 50) return "black";
  if (r > 200 && g > 150 && b < 150) return "softPink";
  if (r < 150 && g > 150 && b > 200) return "skyBlue";
  if (r > 150 && g < 150 && b > 200) return "lavender";
  if (r < 150 && g > 200 && b > 150) return "mint";
  if (r > 200 && g > 150 && b > 100) return "peach";
  if (r > 200 && g > 200 && b < 150) return "lemonYellow";

  return "warmWhite"; // 기본값
}
