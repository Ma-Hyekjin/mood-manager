// ======================================================
// File: src/app/(main)/home/components/MoodDashboard/components/MoodDuration.tsx
// ======================================================

import type { Mood } from "@/types/mood";

interface MoodDurationProps {
  mood: Mood;
  duration: number;
  currentIndex: number;
  totalSegments: number;
  onSegmentSelect?: (index: number) => void;
}

export default function MoodDuration({
  mood,
  duration,
  currentIndex,
  totalSegments,
  onSegmentSelect,
}: MoodDurationProps) {
  const clampedTotal = totalSegments > 0 ? totalSegments : 10;
  const clampedIndex =
    currentIndex >= 0 ? (currentIndex < clampedTotal ? currentIndex : clampedTotal - 1) : 0;

  // 세그먼트 기준 진행 정보
  const currentSegmentNumber = clampedIndex + 1; // 1-based
  const remainingSegments = clampedTotal - currentSegmentNumber;

  const ticks = Array.from({ length: clampedTotal }, (_, idx) => idx);

  return (
    <div className="mb-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Mood Duration</span>
        <span className="text-xs font-medium text-gray-800">
          Seg {currentSegmentNumber}/{clampedTotal}
        </span>
      </div>
      {/* 10개 세그먼트 눈금 바 */}
      <div className="w-full flex gap-[2px]">
        {ticks.map((idx) => {
          const isCurrent = idx === clampedIndex;
          return (
            <div
              key={idx}
              className="flex-1 h-2 rounded-full transition-all cursor-pointer"
              onClick={() => onSegmentSelect?.(idx)}
              style={{
                backgroundColor: isCurrent ? mood.color : "rgba(255,255,255,0.5)",
                opacity: isCurrent ? 1 : 0.4,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

