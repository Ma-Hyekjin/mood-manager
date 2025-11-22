// ======================================================
// File: src/components/navigation/BottomNav.tsx
// ======================================================

/*
  [BottomNav 역할 정리]

  - 화면 하단 고정 네비게이션
  - app/layout.tsx 의 375px 중앙 정렬 영역의 bottom에 맞춰 렌더링
  - 3개 탭:
      1) Home
      2) Mood Library
      3) My Page
  - 현재 경로(pathname)에 따라 강조(active) 스타일 적용
*/

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaPalette, FaUser } from "react-icons/fa";
import React from "react";

export default function BottomNav() {
  const path = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center">
      <div className="w-full max-w-[375px] bg-white border-t flex justify-around py-2">
        {navItem("MYPAGE", <FaUser />, "/mypage", path)}
        {navItem("HOME", <FaHome />, "/home", path)}
        {navItem("MOOD", <FaPalette />, "/mood", path)}
      </div>
    </div>
  );
}

function navItem(label: string, icon: React.ReactNode, href: string, path: string) {
  const active = path.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex flex-col items-center text-xs ${
        active ? "text-black font-semibold" : "text-gray-500"
      }`}
    >
      <div className="text-lg">{icon}</div>
      {label}
    </Link>
  );
}
