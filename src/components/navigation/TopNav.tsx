// ======================================================
// File: src/components/navigation/TopNav.tsx
// ======================================================

/*
  [TopNav 역할 정리]

  - app/layout.tsx 의 375px 중앙정렬 프레임 안의 최상단 네비게이션 바
  - Mood Manager 로고(svg)를 중앙 배치
*/

"use client";

import Image from "next/image";

export default function TopNav() {
  return (
    <div className="w-full h-14 flex items-center justify-center border-b bg-white">
      <Image
        src="/logos/mood-manager-logo.svg"
        alt="Mood Manager"
        width={150}
        height={28}
        className="h-7 w-auto"
        priority
      />
    </div>
  );
}
