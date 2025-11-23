// ======================================================
// File: src/app/(main)/home/components/HomeContent.tsx
// ======================================================

/*
  [HomeContent 역할]
  
  - 홈 페이지의 메인 컨텐츠 영역
  - MoodDashboard와 DeviceGrid를 포함
  - 향 배경 효과 포함
*/

"use client";

import MoodDashboard from "./MoodDashboard/MoodDashboard";
import DeviceGrid from "./Device/DeviceGrid";
import ScentBackground from "@/components/ui/ScentBackground";
import type { Device } from "@/types/device";
import type { Mood } from "@/types/mood";

interface HomeContentProps {
  currentMood: Mood;
  devices: Device[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  onOpenAddModal: () => void;
  onMoodChange: (mood: Mood) => void;
  onScentChange: (mood: Mood) => void;
  onSongChange: (mood: Mood) => void;
}

export default function HomeContent({
  currentMood,
  devices,
  expandedId,
  setExpandedId,
  setDevices,
  onOpenAddModal,
  onMoodChange,
  onScentChange,
  onSongChange,
}: HomeContentProps) {
  // 현재 향 레벨 가져오기 (Manager 디바이스에서) - 파티클 밀도 조절용
  const currentScentLevel = devices.find((d) => d.type === "manager")?.output?.scentLevel || 5;

  return (
    <>
      {/* 향 배경 효과 - 백그라운드 레이어 */}
      <ScentBackground
        scentType={currentMood.scent.type}
        scentColor={currentMood.scent.color}
        intensity={currentScentLevel}
      />

      <div className="pt-2 px-3 flex flex-col flex-1 overflow-hidden relative z-10">
        {/* 무드 대시보드 - 고정 */}
        <div className="flex-shrink-0 relative z-20">
          <MoodDashboard
            mood={currentMood}
            onMoodChange={onMoodChange}
            onScentChange={onScentChange}
            onSongChange={onSongChange}
          />
        </div>

        {/* 디바이스 그리드 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto mt-1 pb-20">
          <DeviceGrid
            devices={devices}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            setDevices={setDevices}
            openAddModal={onOpenAddModal}
            currentMood={currentMood}
          />
        </div>
      </div>
    </>
  );
}

