// ======================================================
// File: src/app/(main)/home/components/MoodDashboard/components/MoodDuration.tsx
// ======================================================

import type { Mood } from "@/types/mood";

interface MoodDurationProps {
  mood: Mood;
  duration: number;
}

export default function MoodDuration({ mood, duration }: MoodDurationProps) {
  return (
    <div className="mb-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Mood Duration</span>
        <span className="text-xs font-medium text-gray-800">
          {duration} min remaining
        </span>
      </div>
      {/* 간트 차트 스타일의 진행 바 */}
      <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${(duration / 60) * 100}%`, // 60분 기준으로 표시
            backgroundColor: mood.color,
          }}
        />
      </div>
    </div>
  );
}

