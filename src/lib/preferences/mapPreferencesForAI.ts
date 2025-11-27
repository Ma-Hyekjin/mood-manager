// src/lib/preferences/mapPreferencesForAI.ts
/**
 * UserPreferences DB row → LLM Input 형식으로 변환
 *
 * [변환 로직]
 * - DB에 이미 LLM Input 형식(Record<string, '+' | '-'>)으로 저장되어 있음
 * - 선호 항목: '+' (좋아함)
 * - 비선호 항목: '-' (싫어함)
 * - 나머지 항목: 'else: +' (기본 긍정)
 */

import type { UserPreferences } from "@prisma/client";

type PreferenceMap = Record<string, '+' | '-'>;

/**
 * UserPreferences → LLM Input 형식 변환
 */
export function mapPreferencesForAI(prefs: UserPreferences | null) {
  // 기본값: 모든 항목 긍정
  const defaultPreferences = { else: "+" as const };

  if (!prefs) {
    return {
      music: defaultPreferences,
      color: defaultPreferences,
      scent: defaultPreferences,
    };
  }

  // DB에 이미 LLM Input 형식으로 저장되어 있으므로 그대로 반환
  return {
    music: parseJsonPreference(prefs.musicPreferences) || defaultPreferences,
    color: parseJsonPreference(prefs.colorPreferences) || defaultPreferences,
    scent: parseJsonPreference(prefs.scentPreferences) || defaultPreferences,
  };
}

/**
 * JSON 필드를 안전하게 파싱
 */
function parseJsonPreference(jsonValue: unknown): PreferenceMap | null {
  if (!jsonValue) {
    return null;
  }

  // Prisma Json 타입은 object로 반환됨
  if (typeof jsonValue === 'object' && jsonValue !== null) {
    // else 키가 없으면 추가
    const prefs = jsonValue as PreferenceMap;
    if (!('else' in prefs)) {
      return { ...prefs, else: '+' };
    }
    return prefs;
  }

  return null;
}
