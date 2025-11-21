// ======================================================
// File: src/components/navigation/TopNav.tsx
// ======================================================

/*
  [TopNav 역할 정리]

  - app/layout.tsx 의 375px 중앙정렬 프레임 안의 최상단 네비게이션 바
  - Mood Manager 로고(svg)를 중앙 배치
  - 좌우 버튼은 현재 없음 (향후 설정/알림 버튼 등 확장 가능)
*/

"use client";

export default function TopNav() {
  return (
    <div className="w-full h-14 flex items-center justify-center border-b bg-white">
      <img src="/mood-manager-logo.svg" className="h-7" alt="Mood Manager" />
    </div>
  );
}
