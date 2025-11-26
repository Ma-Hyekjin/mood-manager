// src/hooks/useBackgroundParams.ts
/**
 * LLM 배경 파라미터 훅
 * 
 * 무드스트림이 재생성될 때만 LLM으로 배경 파라미터 생성
 * (새로고침 버튼 클릭 시에만 호출)
 */

import { useState, useEffect } from "react";
import type { MoodStream } from "./useMoodStream";

export interface BackgroundParams {
  moodAlias: string;
  musicSelection: string;
  moodColor: string;
  lighting: {
    rgb: [number, number, number];
    brightness: number;
    temperature?: number;
  };
  backgroundIcon: {
    name: string;
    category: string;
  };
  backgroundWind: {
    direction: number;
    speed: number;
  };
  animationSpeed: number;
  iconOpacity: number;
  iconCount?: number;
  iconSize?: number;
  particleEffect?: boolean;
  gradientColors?: string[];
  transitionDuration?: number;
  source?: string; // "openai" | "mock-no-key" | "cache" 등
}

/**
 * 무드스트림 기반 배경 파라미터 훅
 * 
 * @param moodStream - 무드스트림 (null이면 호출 안 함)
 * @param shouldFetch - OpenAI 호출 여부 (새로고침 버튼 클릭 시에만 true)
 */
export function useBackgroundParams(
  moodStream: MoodStream | null,
  shouldFetch: boolean = false
) {
  const [backgroundParams, setBackgroundParams] = useState<BackgroundParams | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchBackgroundParams() {
      // 무드스트림이 없거나 호출하지 않으면 스킵
      if (!moodStream || !shouldFetch) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/ai/background-params", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "stream",
            segments: moodStream.segments, // 10개 세그먼트 전체 전달
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch background params");
        }

        const data = await response.json();
        console.log("[BackgroundParams] LLM response source:", data.source);
        setBackgroundParams(data);
      } catch (error) {
        console.error("Error fetching background params:", error);
        // 기본값 사용
        setBackgroundParams({
          moodAlias: moodStream.currentMood.name,
          musicSelection: moodStream.currentMood.music.title,
          moodColor: moodStream.currentMood.lighting.color,
          lighting: {
            rgb: moodStream.currentMood.lighting.rgb,
            brightness: 50,
            temperature: 4000,
          },
          backgroundIcon: {
            name: "FaLeaf",
            category: "nature",
          },
          backgroundWind: {
            direction: 180,
            speed: 3,
          },
          animationSpeed: 4,
          iconOpacity: 0.7,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchBackgroundParams();
  }, [moodStream?.streamId, shouldFetch]); // streamId가 변경될 때만 재요청

  return { backgroundParams, isLoading };
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [230, 243, 255];
}

