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
      prefs.fragranceTop1,
      prefs.fragranceTop2,
      prefs.fragranceTop3
    ].filter(Boolean) as string[],

    lighting: prefs.preferredLightR !== null
      ? {
          r: prefs.preferredLightR,
          g: prefs.preferredLightG,
          b: prefs.preferredLightB,
          brightness: prefs.preferredBrightness
        }
      : null,

    sound_genres: [
      prefs.soundGenreTop1,
      prefs.soundGenreTop2,
      prefs.soundGenreTop3
    ].filter(Boolean) as string[],
  };
}
