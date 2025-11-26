// src/lib/llm/optimizePrompt.ts
/**
 * 프롬프트 최적화
 * 
 * 최소 비용으로 유효한 응답을 받기 위한 프롬프트 최적화
 */

import type { LLMInput } from "./prepareLLMInput";

interface MoodStreamSegment {
  timestamp: number;
  mood: any;
  music: { genre: string; title: string };
  scent: { type: string; name: string };
  lighting: { color: string; rgb: [number, number, number] };
  duration: number;
}

/**
 * 프롬프트 최적화 전략
 * 
 * 1. 구조화된 JSON 요청 (Few-shot 대신 구조 명시)
 * 2. 불필요한 설명 제거
 * 3. 핵심 정보만 포함
 * 4. 예시 최소화
 * 5. 30분 스트림 전체 정보 포함
 */
export function generateOptimizedPrompt(
  input: LLMInput,
  segments?: MoodStreamSegment[]
): string {
  const { preprocessed, moodName, musicGenre, scentType, userPreferences, timeOfDay, season } = input;
  
  // 날씨 정보 간소화
  const weather = `${preprocessed.weather.temperature}°C, ${preprocessed.weather.humidity}%, ${
    ['없음', '비', '비/눈', '눈'][preprocessed.weather.rainType]
  }, ${['', '맑음', '', '구름', '흐림'][preprocessed.weather.sky]}`;
  
  // 감정 이벤트 간소화 (영어 표기)
  const emotions = Object.entries({
    laughter: preprocessed.emotionEvents.laughter?.length || 0,
    sigh: preprocessed.emotionEvents.sigh?.length || 0,
    anger: preprocessed.emotionEvents.anger?.length || 0,
    sadness: preprocessed.emotionEvents.sadness?.length || 0,
  })
    .filter(([_, count]) => count > 0)
    .map(([emotion, count]) => `${emotion}(${count})`)
    .join(", ") || "calm";
  
  // 선호도 간소화 (선호만 표시)
  const musicPrefs = Object.entries(userPreferences.music)
    .filter(([_, v]) => v === '+')
    .map(([k]) => k)
    .slice(0, 3)
    .join(', ');
  
  const colorPrefs = Object.entries(userPreferences.color)
    .filter(([_, v]) => v === '+')
    .map(([k]) => k)
    .slice(0, 3)
    .join(', ');
  
  const scentPrefs = Object.entries(userPreferences.scent)
    .filter(([_, v]) => v === '+')
    .map(([k]) => k)
    .slice(0, 3)
    .join(', ');

  // 아이콘 카탈로그 (카테고리 키만 LLM이 선택)
  const iconCatalog = [
    { key: "rain", desc: "rainy, watery, calm" },
    { key: "sun", desc: "bright, sunny, energetic" },
    { key: "cloud", desc: "cloudy, soft, overcast" },
    { key: "leaf", desc: "nature, green, relaxing" },
    { key: "wave", desc: "ocean, marine, flowing" },
    { key: "sparkle", desc: "twinkle, magical, light" },
    { key: "snow", desc: "snowy, cold, quiet" },
    { key: "star", desc: "night sky, dreamy" },
    { key: "flower", desc: "floral, gentle" },
    { key: "bubble", desc: "soft, playful" },
  ];
  const iconCatalogText = iconCatalog
    .map((i) => `- ${i.key}: ${i.desc}`)
    .join("\n");
  
  // 10개 세그먼트 정보 간소화 (있는 경우)
  let streamInfo = "";
  if (segments && segments.length > 0) {
    // 스트림 요약: 무드 패턴, 장르, 향 종류
    const uniqueMoods = [...new Set(segments.map(s => s.moodName || s.mood?.name).filter(Boolean))];
    const uniqueGenres = [...new Set(segments.map(s => s.musicGenre || s.music?.genre).filter(Boolean))];
    const uniqueScents = [...new Set(segments.map(s => s.scentType || s.scent?.type).filter(Boolean))];
    
    streamInfo = `[10개세그먼트] 무드:${uniqueMoods.join(',')} 장르:${uniqueGenres.join(',')} 향:${uniqueScents.join(',')}`;
  }
  
  // 최적화된 프롬프트 (토큰 최소화, 영어 응답 강제)
  return `Mood background design (Respond in English only)

[MOOD] ${moodName} | [MUSIC] ${musicGenre} | [SCENT] ${scentType} | [TIME] ${timeOfDay}h | [SEASON] ${season}
${streamInfo ? streamInfo + "\n" : ""}
[BIOMETRICS] stress:${preprocessed.recent_stress_index}/100 sleep:${preprocessed.latest_sleep_score}/100
[WEATHER] ${weather}
[EMOTIONS] ${emotions}
[PREFERENCES] music:${musicPrefs} color:${colorPrefs} scent:${scentPrefs}

[ICON CATALOG]
Choose exactly ONE iconCategory key from the list below:
${iconCatalogText}

Return ONE JSON object only, in English, with the following fields.
Important:
- Use ONLY one of the iconCategory keys above for backgroundIcon.category.
- Do NOT invent new icon categories.

{
  "moodAlias": "2-4 word English nickname",
  "musicSelection": "track title / style in English",
  "moodColor": "#HEX",
  "lighting": {"rgb": [0-255,0-255,0-255], "brightness": 0-100, "temperature": 2000-6500},
  "backgroundIcon": {"category": "rain | sun | cloud | leaf | wave | sparkle | snow | star | flower | bubble"},
  "backgroundWind": {"direction": 0-360, "speed": 0-10},
  "animationSpeed": 0-10,
  "iconOpacity": 0-1
}`;
}

