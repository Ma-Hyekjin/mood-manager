/**
 * File: src/app/(main)/home/page.tsx
 *
 * Home Page (Full Version)
 *
 * 구성 요소:
 *  - TopNav (상단바)
 *  - MoodDashboard (무드 대시보드)
 *  - DeviceGrid (디바이스 카드 그리드)
 *  - SurveyOverlay (최초 로그인시)
 *  - DeviceTypeSelectModal (기기 종류 선택)
 *  - DeviceNameInputModal (기기 이름 입력)
 *  - DeviceDeleteModal (기기 삭제 확인)
 *  - BottomNav (하단 네비게이션)
 *
 * 주요 상태:
 *  - devices[] : 디바이스 목록
 *  - hasSurvey : 설문 여부
 *  - 모달 상태들 (type, name, delete)
 *
 */

"use client";

import { useState } from "react";

import TopNav from "@/components/navigation/TopNav";
import BottomNav from "@/components/navigation/BottomNav";

import MoodDashboard from "./components/MoodDashboard/MoodDashboard";
import DeviceGrid from "./components/Device/DeviceGrid";

import DeviceTypeSelectModal from "./components/Device/DeviceTypeSelectModal";
import DeviceNameInputModal from "./components/Device/DeviceNameInputModal";
import DeviceDeleteModal from "./components/Device/DeviceDeleteModal";

// import SurveyOverlay from "./components/SurveyOverlay/SurveyOverlay";

import { Device, DeviceType } from "./types/device";

export default function HomePage() {
  // -------------------------------
  // 1. 디바이스 Mock 데이터
  // -------------------------------
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "manager-1",
      type: "manager",
      name: "Manager",
      battery: 80,
      power: true,
      output: {
        brightness: 80,
        scentType: "Citrus",
        scentLevel: 5,
        volume: 20,
      },
    },
    {
      id: "light-1",
      type: "light",
      name: "스마트전구 1",
      battery: 60,
      power: true,
      output: {
        brightness: 70,
        color: "#FFE680",
      },
    },
  ]);

  // -------------------------------
  // 2. Survey 상태
  // -------------------------------
  const [hasSurvey, setHasSurvey] = useState(false);

  // -------------------------------
  // 3. Device 추가 모달 상태
  // -------------------------------
  const [typeModal, setTypeModal] = useState(false);
  const [nameModal, setNameModal] = useState(false);

  const [newDeviceType, setNewDeviceType] = useState<DeviceType | null>(null);

  // -------------------------------
  // 4. Device 삭제 모달 상태
  // -------------------------------
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // -------------------------------
  // 5. Device 조작 함수들
  // -------------------------------

  // + 카드 클릭 → 타입 선택 모달 열기
  const handleAddDeviceStart = () => setTypeModal(true);

  // 타입 선택 후 → 이름 입력 모달
  const handleSelectType = (type: DeviceType) => {
    setNewDeviceType(type);
    setTypeModal(false);
    setNameModal(true);
  };

  // 이름 입력 제출
  const handleSubmitName = (name: string) => {
    if (!newDeviceType) return;

    const newDevice: Device = {
      id: `${newDeviceType}-${Date.now()}`,
      type: newDeviceType,
      name,
      battery: 100,
      power: true,
      output: {},
    };

    setDevices((prev) => [...prev, newDevice]);
    setNameModal(false);
  };

  // 장치 업데이트
  const handleUpdateDevice = (updated: Device) => {
    setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  // 삭제 모달 → 실제 삭제
  const handleDeleteDevice = () => {
    if (!deleteTarget) return;
    setDevices((prev) => prev.filter((d) => d.id !== deleteTarget));
    setDeleteModal(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-white">

      {/* Top Navigation */}
      <TopNav />

      {/* Main Content */}
      <div className="pt-16 pb-20 px-4 w-full max-w-md mx-auto space-y-6">

        {/* Mood Dashboard */}
        <MoodDashboard
          moodName="Relax"
          moodColor="#7BC6FF"
          scent={{
            name: "Citrus",
            level: 5,
            icon: "/icons/scent.png",
          }}
          nowPlaying={{
            title: "Healing Flow",
            albumImg: "/icons/music.png",
          }}
        />

        {/* Device Grid */}
        <DeviceGrid
          devices={devices}
          onAddDevice={handleAddDeviceStart}
          onUpdateDevice={handleUpdateDevice}
          onDeleteDevice={(id) => {
            setDeleteTarget(id);
            setDeleteModal(true);
          }}
        />
      </div>

      {/* Survey Overlay */}
      
      {/* {!hasSurvey && (
        <SurveyOverlay
          onComplete={() => setHasSurvey(true)}
          onSkip={() => setHasSurvey(true)}
        />
      )} */}

      {/* Device Type 선택 모달 */}
      <DeviceTypeSelectModal
        isOpen={typeModal}
        onSelect={handleSelectType}
        onCancel={() => setTypeModal(false)}
      />

      {/* Device Name 입력 모달 */}
      <DeviceNameInputModal
        isOpen={nameModal}
        onSubmit={handleSubmitName}
        onCancel={() => setNameModal(false)}
      />

      {/* Device 삭제 모달 */}
      <DeviceDeleteModal
        isOpen={deleteModal}
        onConfirm={handleDeleteDevice}
        onCancel={() => setDeleteModal(false)}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
