/**
 * File: src/app/(main)/home/components/Device/DeviceCardFront.tsx
 *
 * DeviceCardFront Component (앞면 카드)
 *
 * 구성 요소:
 *  - Icon
 *  - Device Name
 *  - Battery Icon (% 색상 변화)
 *  - Power Toggle Button
 *  - Output Summary
 *
 * Props:
 *  - device: Device
 *  - onClick(): 카드 flip
 *  - onTogglePower()
 *
 * UX:
 *  - power=false → 전체 60% opacity
 */

import Image from "next/image";
import { Device } from "../../types/device";

interface DeviceCardFrontProps {
  device: Device;
  onClick: () => void;
  onTogglePower: () => void;
}

export default function DeviceCardFront({
  device,
  onClick,
  onTogglePower,
}: DeviceCardFrontProps) {
  const batteryColor =
    device.battery > 60
      ? "text-green-500"
      : device.battery > 30
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div
      className={`w-full p-4 rounded-xl shadow cursor-pointer transition ${
        device.power ? "opacity-100" : "opacity-60"
      }`}
      onClick={onClick}
    >
      {/* 상단: 아이콘, 이름, 배터리 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Image
            src={`/icons/${device.type}.png`}
            width={24}
            height={24}
            alt="icon"
          />
          <span className="font-semibold">{device.name}</span>
        </div>

        <span className={`font-bold ${batteryColor}`}>{device.battery}%</span>
      </div>

      {/* 전원 토글 */}
      <button
        className="w-full bg-black text-white py-1 rounded-lg"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePower();
        }}
      >
        {device.power ? "Power Off" : "Power On"}
      </button>

      {/* Output Summary */}
      <div className="text-xs mt-3 text-gray-600">
        {device.type === "light" && (
          <>Brightness: {device.output.brightness}</>
        )}
        {device.type === "scent" && <>Scent: {device.output.scentType}</>}
        {device.type === "speaker" && <>Volume: {device.output.volume}</>}
        {device.type === "manager" && <>Multi-control device</>}
      </div>
    </div>
  );
}
