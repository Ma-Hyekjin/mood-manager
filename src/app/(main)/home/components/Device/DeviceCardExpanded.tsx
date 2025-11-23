// ======================================================
// File: src/app/(main)/home/components/Device/DeviceCardExpanded.tsx
// ======================================================

/*
  [DeviceCardExpanded 역할 정리]

  - 확장된 디바이스 카드 (col-span-2)
  - smallCard 클릭 → expanded 형태로 변경
  - 카드 전체를 클릭하면 다시 접힘(onClose)
  - 이름 변경 기능 (인라인 편집)
  - Power On/Off 버튼 클릭 시 전원 토글 (onTogglePower) - 전원 아이콘 사용
  - 오른쪽 아래 "Delete" 버튼 클릭 시 디바이스 삭제(onDelete)
  - 디바이스 타입에 따라 상태 설명문 다르게 표시
  - Manager는 다른 디바이스보다 긴 상태 설명
*/

"use client";

import { Device } from "@/types/device";
import { type Mood } from "@/types/mood";
import { ReactNode, useState } from "react";
import { FaPalette, FaLightbulb, FaSprayCan, FaVolumeUp, FaCog } from "react-icons/fa";
import { Power } from "lucide-react";
import { blendWithWhite } from "@/lib/utils";

export default function DeviceCardExpanded({
  device,
  currentMood,
  onClose,
  onDelete,
  onTogglePower,
  onUpdateName,
}: {
  device: Device;
  currentMood?: Mood;
  onClose: () => void;
  onDelete: () => void;
  onTogglePower: () => void;
  onUpdateName: (name: string) => void;
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(device.name);

  // 무드 컬러를 흰색에 가깝게 블렌딩 (90% 흰색 + 10% 무드 컬러)
  const backgroundColor = currentMood
    ? blendWithWhite(currentMood.color, 0.9)
    : "rgb(255, 255, 255)";

  const handleNameSubmit = () => {
    if (editedName.trim() !== "" && editedName !== device.name) {
      onUpdateName(editedName.trim());
    } else {
      setEditedName(device.name);
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setEditedName(device.name);
    setIsEditingName(false);
  };

  return (
    <div
      className={`p-4 rounded-xl shadow-md border relative animate-expand cursor-pointer transition-all min-h-[200px] backdrop-blur-sm
        ${device.power ? "" : "opacity-60"}
      `}
      style={{
        backgroundColor: device.power
          ? `${backgroundColor}CC` // 80% 투명도 (CC = 204/255)
          : "rgba(200, 200, 200, 0.8)",
      }}
      onClick={onClose}
    >
      {/* 상단: 아이콘 + 이름 + 배터리 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-3xl">{getIcon(device.type)}</div>
          {isEditingName ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNameSubmit();
                } else if (e.key === "Escape") {
                  handleNameCancel();
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-lg font-semibold bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-black"
              autoFocus
            />
          ) : (
            <div
              className="text-lg font-semibold cursor-text hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingName(true);
              }}
              title="Click to edit name"
            >
              {device.name}
            </div>
          )}
        </div>

        <div className="text-sm font-medium">{device.battery}%</div>
      </div>

      {/* 전원 버튼 - 아이콘 사용 */}
      <div className="flex justify-center mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation(); // 부모 클릭(onClose) 방지
            onTogglePower();
          }}
          className={`p-3 rounded-full transition-all ${
            device.power
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-400 text-white hover:bg-gray-500"
          }`}
          title={device.power ? "Power On" : "Power Off"}
        >
          <Power size={24} />
        </button>
      </div>

      {/* 타입별 상태 설명 */}
      <div className="mt-4 pb-8 text-sm text-gray-600 leading-relaxed">
        {getStatusDescription(device)}
      </div>

      {/* Delete 버튼 */}
      <div
        onClick={(e) => {
          e.stopPropagation(); // 부모 클릭(onClose) 방지
          onDelete();
        }}
        className="absolute bottom-4 right-4 text-red-500 text-sm underline cursor-pointer hover:text-red-700"
      >
        Delete
      </div>
    </div>
  );
}

function getStatusDescription(device: Device): ReactNode {
  if (!device.power) {
    return "Power is turned off.";
  }

  switch (device.type) {
    case "manager":
      const lightStatus = device.output.brightness
        ? `Light Status: ${device.output.brightness}%`
        : "Light Status: -";
      const scentStatus = device.output.scentType
        ? `Scent Status: ${device.output.scentType} (Level ${device.output.scentLevel || 0})`
        : "Scent Status: -";
      const musicStatus = device.output.nowPlaying
        ? `Music Status: ${device.output.nowPlaying}`
        : "Music Status: -";
      return (
        <div className="flex flex-col gap-1">
          <div>{lightStatus}</div>
          <div>{scentStatus}</div>
          <div>{musicStatus}</div>
        </div>
      );
    case "light":
      return device.output.brightness
        ? `Light Status: ${device.output.brightness}%`
        : "Light Status: -";
    case "scent":
      return device.output.scentType
        ? `Scent Status: ${device.output.scentType} (Level ${device.output.scentLevel || 0})`
        : "Scent Status: -";
    case "speaker":
      return device.output.nowPlaying
        ? `Music Status: ${device.output.nowPlaying}`
        : "Music Status: -";
    default:
      return "";
  }
}

function getIcon(type: Device["type"]) {
  if (type === "manager") return <FaPalette className="text-purple-500 text-3xl" />;
  if (type === "light") return <FaLightbulb className="text-yellow-500 text-3xl" />;
  if (type === "scent") return <FaSprayCan className="text-green-500 text-3xl" />;
  if (type === "speaker") return <FaVolumeUp className="text-blue-500 text-3xl" />;
  return <FaCog className="text-gray-500 text-3xl" />;
}
