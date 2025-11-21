// src/lib/preferences/mapPreferencesForAI.ts
/**
 * UserPreferences DB row → OpenAI-friendly 구조로 변환
 */

import type { UserPreferences } from "@prisma/client";

export function mapPreferencesForAI(prefs: UserPreferences | null) {
  if (!prefs) {
    return {
      fragrance: [],
      lighting: null,
      sound_genres: []
    };
  }

  return {
    fragrance: [
      prefs.fragrance_top1,
      prefs.fragrance_top2,
      prefs.fragrance_top3
    ].filter(Boolean) as string[],

    lighting: prefs.preferred_light_R !== null
      ? {
          r: prefs.preferred_light_R,
          g: prefs.preferred_light_G,
          b: prefs.preferred_light_B,
          brightness: prefs.preferred_brightness
        }
      : null,

    sound_genres: [
      prefs.sound_genre_top1,
      prefs.sound_genre_top2,
      prefs.sound_genre_top3
    ].filter(Boolean) as string[],
  };
}
