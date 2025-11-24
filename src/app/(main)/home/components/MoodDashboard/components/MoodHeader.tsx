// ======================================================
// File: src/app/(main)/home/components/MoodDashboard/components/MoodHeader.tsx
// ======================================================

import { RefreshCcw, Heart } from "lucide-react";
import type { Mood } from "@/types/mood";

interface MoodHeaderProps {
  mood: Mood;
  isSaved: boolean;
  onSaveToggle: () => void;
  onRefresh: () => void;
}

export default function MoodHeader({
  mood,
  isSaved,
  onSaveToggle,
  onRefresh,
}: MoodHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="text-base font-semibold text-gray-800">
        {mood.name}
      </div>
      <div className="flex items-center gap-2">
        {/* 무드셋 저장 버튼 (하트) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSaveToggle();
          }}
          className={`p-1.5 rounded-full bg-white/40 backdrop-blur hover:bg-white/60 transition ${
            isSaved ? "text-red-500" : "text-gray-800"
          }`}
          title={isSaved ? "Remove from saved moods" : "Save to mood library"}
        >
          <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
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
  );
}

