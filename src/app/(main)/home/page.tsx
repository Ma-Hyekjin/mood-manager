// ======================================================
// File: src/app/(main)/home/page.tsx
// ======================================================

/*
  [Home Page 역할]
  
  - 페이지 레이아웃과 상태 관리만 담당
  - 모든 UI와 비즈니스 로직은 컴포넌트와 훅으로 분리
  - 레이아웃은 app/layout.tsx에서 375px 중앙정렬이 적용됨
*/

"use client";

import { useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import BottomNav from "@/components/navigation/BottomNav";
import HomeContent from "./components/HomeContent";
import DeviceAddModal from "./components/Device/DeviceAddModal";
import SurveyOverlay from "./components/SurveyOverlay/SurveyOverlay";
import type { Device } from "@/types/device";
import { MOODS } from "@/types/mood";
import { useDevices } from "@/hooks/useDevices";
import { useMood } from "@/hooks/useMood";
import { useSurvey } from "@/hooks/useSurvey";

export default function HomePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // 초기 데이터 설정
  const initialMood = MOODS[0];
  const initialDevices: Device[] = [
    {
      id: "manager-1",
      type: "manager",
      name: "Mood Manager",
      battery: 100,
      power: true,
      output: {
        brightness: 85,
        color: initialMood.color,
        scentType: initialMood.scent.name,
        scentLevel: 7,
        volume: 65,
        nowPlaying: initialMood.song.title,
      },
    },
    {
      id: "light-1",
      type: "light",
      name: "Smart Light 1",
      battery: 100,
      power: true,
      output: {
        brightness: 75,
        color: initialMood.color,
      },
    },
  ];

  // 커스텀 훅 사용
  const { devices, setDevices, addDevice } = useDevices(initialDevices, initialMood);
  const { currentMood, setCurrentMood, handleScentChange, handleSongChange } = useMood(initialMood, setDevices);
  const { showSurvey, handleSurveyComplete, handleSurveySkip } = useSurvey();

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <TopNav />

      <HomeContent
        currentMood={currentMood}
        devices={devices}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        setDevices={setDevices}
        onOpenAddModal={() => setShowAddModal(true)}
        onMoodChange={setCurrentMood}
        onScentChange={handleScentChange}
        onSongChange={handleSongChange}
      />

      <BottomNav />

      {showAddModal && (
        <DeviceAddModal
          onClose={() => setShowAddModal(false)}
          onConfirm={(type: Device["type"], name?: string) => {
            addDevice(type, name);
            setShowAddModal(false);
          }}
        />
      )}

      {showSurvey && (
        <SurveyOverlay
          onComplete={handleSurveyComplete}
          onSkip={handleSurveySkip}
        />
      )}
    </div>
  );
}
