// ======================================================
// File: src/app/(main)/home/components/Device/DeviceCardSmall.tsx
// ======================================================

import { Device } from "../../types/device";

export default function DeviceCardSmall({
  device,
  onClick,
}: {
  device: Device;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        p-3 rounded-xl shadow-sm border cursor-pointer transition-all
        ${device.power ? "bg-white" : "bg-gray-200 opacity-60"}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="text-xl">{getIcon(device.type)}</div>
        <div className="text-xs">{device.battery}%</div>
      </div>

      <div className="mt-2 text-sm font-medium">{device.name}</div>
    </div>
  );
}

function getIcon(type: Device["type"]) {
  if (type === "manager") return "🌈";
  if (type === "light") return "💡";
  if (type === "scent") return "🧴";
  if (type === "speaker") return "🔊";
  return "🔧";
}
