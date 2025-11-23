// ======================================================
// File: src/app/(main)/home/components/Device/AddDeviceCard.tsx
// ======================================================

/*
  [AddDeviceCard 역할]

  - 항상 마지막 줄에 나타나는 + 카드
  - 클릭 시 onAdd() 호출
  - 현재 무드 컬러에 따라 동적으로 스타일 변경
*/

"use client";

import { type Mood } from "@/types/mood";
import { blendWithWhite } from "@/lib/utils";

interface AddDeviceCardProps {
  onAdd: () => void;
  currentMood?: Mood; // 현재 무드 (옵셔널, 없으면 기본 스타일)
}

export default function AddDeviceCard({
  onAdd,
  currentMood,
}: AddDeviceCardProps) {
  // + 아이콘과 윤곽선을 무드 컬러로 변경
  const moodColor = currentMood?.color || "#6B7280";

  // 무드 컬러를 흰색에 가깝게 블렌딩 (90% 흰색 + 10% 무드 컬러)
  const backgroundColor = currentMood
    ? blendWithWhite(currentMood.color, 0.9)
    : "rgb(255, 255, 255)";

  return (
    <div
      className="h-[100px] p-3 rounded-xl shadow-sm cursor-pointer transition-all flex flex-col justify-center items-center backdrop-blur-sm"
      style={{
        borderColor: moodColor,
        borderWidth: "1px",
        borderStyle: "solid",
        backgroundColor: `${backgroundColor}CC`, // 80% 투명도
      }}
      onClick={onAdd}
    >
      <div 
        className="text-4xl font-light"
        style={{
          color: moodColor,
        }}
      >
        +
      </div>
    </div>
  );
}
