// ======================================================
// File: src/app/(main)/home/page.tsx
// ======================================================

/*
  [Home Page 역할 정리]

  - TopNav, MoodDashboard, DeviceGrid, BottomNav로 구성되는 홈 메인 화면
  - expandedId 상태로 확장 카드(open 1개) 관리
  - 최초 기본 디바이스(Manager, Light) 2개를 샘플로 배치
  - DeviceGrid로 확장/축소/삭제 액션 전달
  - 레이아웃은 app/layout.tsx에서 375px 중앙정렬이 이미 적용됨
*/

"use client";

import { useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import BottomNav from "@/components/navigation/BottomNav";

import MoodDashboard from "./components/MoodDashboard/MoodDashboard";
import DeviceGrid from "./components/Device/DeviceGrid";

import type { Device } from "./types/device";

export default function HomePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 샘플 초기 디바이스
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "manager-1",
      type: "manager",
      name: "Mood Manager",
      battery: 86,
      power: true,
      output: {
        brightness: 80,
        color: "#ffffff",
        scentType: "Default",
        scentLevel: 5,
        volume: 50,
        nowPlaying: "Calm Breeze",
      },
    },
    {
      id: "light-1",
      type: "light",
      name: "Smart Light 1",
      battery: 65,
      power: true,
      output: {
        brightness: 70,
        color: "#FFD966",
      },
    },
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />

      <div className="pt-2 pb-20 px-3">
        <MoodDashboard />

        <DeviceGrid
          devices={devices}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          setDevices={setDevices}
        />
      </div>

      <BottomNav />
    </div>
  );
}
