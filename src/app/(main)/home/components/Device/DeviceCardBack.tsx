/**
 * File: src/app/(main)/home/components/Device/DeviceCardBack.tsx
 *
 * DeviceCardBack Component (뒤집힌 상세 카드)
 *
 * 구성 요소:
 *  - Icon + Name + Battery + Delete Button
 *  - Large Power Button
 *  - 상세 출력값
 *      - Light → 밝기/색상
 *      - Scent → 향/분사량
 *      - Speaker → 볼륨/재생 정보
 *      - Manager → 전체 출력
 *
 * Props:
 *  - device: Device
 *  - onClose() → 앞면으로 복귀
 *  - onUpdateSettings()
 *  - onDelete()
 */

import Image from "next/image";
import { Device } from "../../types/device";

interface DeviceCardBackProps {
  device: Device;
  onClose: () => void;
  onUpdateSettings: (updated: Device) => void;
  onDelete: () => void;
}

export default function DeviceCardBack({
  device,
  onClose,
  onUpdateSettings,
  onDelete,
}: DeviceCardBackProps) {
  return (
    <div className="w-full p-5 rounded-xl shadow bg-white">
      {/* 상단: 아이콘 + 이름 + 배터리 + 삭제 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Image
            src={`/icons/${device.type}.png`}
            width={24}
            height={24}
            alt="icon"
          />
          <span className="font-semibold text-lg">{device.name}</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm">{device.battery}%</span>
          <button onClick={onDelete} className="text-red-500 text-xl">
            ✕
          </button>
        </div>
      </div>

      {/* 전원 버튼 */}
      <button
        className="w-full bg-black text-white py-2 rounded-lg mb-4"
        onClick={() =>
          onUpdateSettings({ ...device, power: !device.power })
        }
      >
        {device.power ? "Turn Off" : "Turn On"}
      </button>

      {/* 출력 정보 영역 */}
      <div className="text-sm space-y-2">
        {device.type === "light" && (
          <>
            <p>Brightness: {device.output.brightness}</p>
            <p>Color: {device.output.color}</p>
          </>
        )}

        {device.type === "scent" && (
          <>
            <p>Scent: {device.output.scentType}</p>
            <p>Level: {device.output.scentLevel}</p>
          </>
        )}

        {device.type === "speaker" && (
          <>
            <p>Volume: {device.output.volume}</p>
            <p>Now Playing: {device.output.nowPlaying}</p>
          </>
        )}

        {device.type === "manager" && (
          <>
            <p>Brightness: {device.output.brightness}</p>
            <p>Scent: {device.output.scentType}</p>
            <p>Volume: {device.output.volume}</p>
          </>
        )}
      </div>

      {/* 닫기 */}
      <button
        onClick={onClose}
        className="w-full mt-5 border py-2 rounded-lg text-gray-600"
      >
        Close
      </button>
    </div>
  );
}
