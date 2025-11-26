// ======================================================
// File: src/app/(main)/home/components/MoodDashboard/components/MoodHeader.tsx
// ======================================================

"use client";

import { useState } from "react";
import { RefreshCcw, Star } from "lucide-react";
import type { Mood } from "@/types/mood";
import HeartAnimation from "./HeartAnimation";

interface MoodHeaderProps {
  mood: Mood;
  isSaved: boolean;
  onSaveToggle: () => void;
  onRefresh: () => void;
  llmSource?: string;
  onPreferenceClick?: () => void; // 선호도 클릭 핸들러
  preferenceCount?: number; // 현재 무드의 선호도 카운트 (0-3)
  maxReached?: boolean; // 최대 3번 도달 여부
}

export default function MoodHeader({
  mood,
  isSaved,
  onSaveToggle,
  onRefresh,
  llmSource,
  onPreferenceClick,
  preferenceCount = 0,
  maxReached = false,
}: MoodHeaderProps) {
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  // 더블클릭 감지
  const handleDoubleClick = () => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;

    if (timeSinceLastClick < 300) {
      // 더블클릭 감지 (300ms 이내)
      if (!maxReached && onPreferenceClick) {
        setShowHeartAnimation(true);
        onPreferenceClick();
      }
      setLastClickTime(0); // 리셋
    } else {
      setLastClickTime(now);
    }
  };

  return (
    <>
      {showHeartAnimation && (
        <HeartAnimation
          onComplete={() => setShowHeartAnimation(false)}
        />
      )}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col flex-1">
          <div
            className="text-base font-semibold text-gray-800 cursor-pointer select-none"
            onDoubleClick={handleDoubleClick}
            title={
              maxReached
                ? "최대 선호도 카운트(3)에 도달했습니다"
                : "더블클릭하여 선호도 표시 (최대 3번)"
            }
          >
            {mood.name}
            {preferenceCount > 0 && (
              <span className="ml-1.5 text-xs text-yellow-500">
                ⭐ {preferenceCount}/3
              </span>
            )}
          </div>
          {llmSource && (
            <span className="text-[10px] text-gray-500">
              LLM: {llmSource}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* 무드셋 저장 버튼 (별) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSaveToggle();
            }}
            className={`p-1.5 rounded-full bg-white/40 backdrop-blur hover:bg-white/60 transition ${
              isSaved ? "text-yellow-500" : "text-gray-800"
            }`}
            title={isSaved ? "Remove from saved moods" : "Save to mood library"}
          >
            <Star size={16} fill={isSaved ? "currentColor" : "none"} />
          </button>
          {/* 새로고침 버튼 (무드 클러스터 내에서 변경) */}
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-full bg-white/40 backdrop-blur hover:bg-white/60 transition text-gray-800"
            title="Refresh mood (same mood cluster)"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
