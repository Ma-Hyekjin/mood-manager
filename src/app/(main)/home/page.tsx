// ======================================================
// File: src/app/(main)/home/page.tsx
// ======================================================

/*
  [Home Page 역할]

  - 페이지 레이아웃과 상태 관리만 담당
  - 모든 UI와 비즈니스 로직은 컴포넌트와 훅으로 분리
  - 레이아웃은 app/layout.tsx에서 375px 중앙정렬이 적용됨
  - DB에서 실제 디바이스 목록을 가져와서 표시
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
import type { BackgroundParams } from "@/hooks/useBackgroundParams";

export default function HomePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [backgroundParams, setBackgroundParams] = useState<BackgroundParams | null>(null);

  // 초기 무드 설정
  const initialMood = MOODS[0];

  // 커스텀 훅 사용
  const { devices, setDevices, addDevice, isLoading } = useDevices(initialMood);
  const { currentMood, setCurrentMood, handleScentChange, handleSongChange } =
    useMood(initialMood, setDevices);
  const { showSurvey, handleSurveyComplete, handleSurveySkip } = useSurvey();

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <TopNav />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">디바이스 목록을 불러오는 중...</p>
        </div>
      ) : (
        <HomeContent
          moodState={{
            current: currentMood,
            onChange: setCurrentMood,
            onScentChange: handleScentChange,
            onSongChange: handleSongChange,
          }}
          deviceState={{
            devices,
            setDevices,
            expandedId,
            setExpandedId,
            onOpenAddModal: () => setShowAddModal(true),
          }}
          backgroundState={{
            params: backgroundParams,
            onChange: setBackgroundParams,
          }}
        />
      )}

      <BottomNav 
        currentMood={currentMood} 
        moodColor={backgroundParams?.moodColor}
      />

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
