// ======================================================
// File: src/app/(main)/home/components/Device/DeviceCardExpanded.tsx
// ======================================================

/*
  [DeviceCardExpanded 역할 정리]

  - 확장된 디바이스 카드 (col-span-2)
  - smallCard 클릭 → expanded 형태로 변경
  - 카드 전체를 클릭하면 다시 접힘(onClose)
  - Power On/Off 버튼 클릭 시 전원 토글 (onTogglePower)
  - 오른쪽 아래 "Delete" 버튼 클릭 시 디바이스 삭제(onDelete)
  - 디바이스 타입에 따라 상태 설명문 다르게 표시
  - Manager는 다른 디바이스보다 긴 상태 설명
*/

"use client";

import { Device } from "@/types/device";
import { ReactNode } from "react";
import { FaPalette, FaLightbulb, FaSprayCan, FaVolumeUp, FaCog } from "react-icons/fa";

export default function DeviceCardExpanded({
  device,
  onClose,
  onDelete,
  onTogglePower,
}: {
  device: Device;
  onClose: () => void;
  onDelete: () => void;
  onTogglePower: () => void;
}) {
  return (
    <div
      className={`p-4 rounded-xl shadow-md border relative animate-expand cursor-pointer transition-all min-h-[200px]
        ${device.power ? "bg-white" : "bg-gray-200 opacity-60"}
      `}
      onClick={onClose}
    >
      {/* 상단: 아이콘 + 이름 + 배터리 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-3xl">{getIcon(device.type)}</div>
          <div className="text-lg font-semibold">{device.name}</div>
        </div>

        <div className="text-sm font-medium">{device.battery}%</div>
      </div>

      {/* 전원 버튼 */}
      <div className="flex justify-center mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation(); // 부모 클릭(onClose) 방지
            onTogglePower();
          }}
          className={`px-6 py-2 rounded-full transition-all ${
            device.power
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-400 text-white hover:bg-gray-500"
          }`}
        >
          {device.power ? "Power Off" : "Power On"}
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
