// ======================================================
// File: src/app/(main)/home/components/MoodDashboard/components/HeartAnimation.tsx
// ======================================================

"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface HeartAnimationProps {
  onComplete: () => void;
}

/**
 * 하트 애니메이션 컴포넌트
 * - 더블클릭 시 나타나서 위로 올라가며 사라지는 애니메이션
 */
export default function HeartAnimation({ onComplete }: HeartAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 300); // 애니메이션 완료 후 콜백 호출
    }, 1000); // 1초 후 사라짐

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Heart
        size={32}
        className="text-red-500 fill-red-500 animate-heart-float"
      />
    </div>
  );
}

