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

import { useState } from "react";
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
  const [isClicked, setIsClicked] = useState(false);

  // + 아이콘과 윤곽선을 무드 컬러로 변경
  const moodColor = currentMood?.color || "#6B7280";

  // 무드 컬러를 흰색에 가깝게 블렌딩 (90% 흰색 + 10% 무드 컬러)
  const backgroundColor = currentMood
    ? blendWithWhite(currentMood.color, 0.9)
    : "rgb(255, 255, 255)";

  // 클릭 시 색상 변화 (약간 어둡게)
  const clickedBackgroundColor = currentMood
    ? blendWithWhite(currentMood.color, 0.85) // 더 어둡게
    : "rgb(240, 240, 240)";

  const handleClick = () => {
    setIsClicked(true);
    // 애니메이션 후 원래 상태로 복귀
    setTimeout(() => {
      setIsClicked(false);
      onAdd();
    }, 150); // 150ms 후 원래 상태로
  };

  return (
    <div
      className={`h-[100px] p-3 rounded-xl shadow-sm cursor-pointer transition-all duration-150 flex flex-col justify-center items-center backdrop-blur-sm ${
        isClicked ? "scale-95" : "scale-100"
      }`}
      style={{
        borderColor: moodColor,
        borderWidth: "1px",
        borderStyle: "solid",
        backgroundColor: isClicked
          ? `${clickedBackgroundColor}CC`
          : `${backgroundColor}CC`, // 80% 투명도
      }}
      onClick={handleClick}
    >
      <div 
        className="text-4xl font-light transition-colors duration-150"
        style={{
          color: isClicked ? blendWithWhite(moodColor, 0.3) : moodColor,
        }}
      >
        +
      </div>
    </div>
  );
}
