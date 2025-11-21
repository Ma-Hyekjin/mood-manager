/**
 * File: src/components/navigation/TopNav.tsx
 *
 * Top Navigation Bar
 * - Mood Manager Logo 표시
 * - 홈 전체 상단에서 고정 위치
 */

import Image from "next/image";

export default function TopNav() {
  return (
    <div className="w-full h-14 flex items-center justify-center bg-white shadow-sm fixed top-0 left-0 z-40">
      <Image
        src="/mood-manager-logo.svg"  // 실제 파일 넣으면 그 이름 사용
        alt="Mood Manager"
        width={140}
        height={32}
        className="object-contain"
      />
    </div>
  );
}
