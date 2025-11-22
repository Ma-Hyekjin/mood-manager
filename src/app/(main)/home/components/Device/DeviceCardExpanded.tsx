// ======================================================
// File: src/app/(main)/home/components/Device/DeviceCardExpanded.tsx
// ======================================================

import { Device } from "../../types/device";

export default function DeviceCardExpanded({
  device,
  onClose,
  onDelete,
}: {
  device: Device;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="p-4 rounded-xl shadow-md border bg-white relative animate-expand cursor-pointer"
      onClick={onClose}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-3xl">{getIcon(device.type)}</div>
          <div className="text-lg font-semibold">{device.name}</div>
        </div>

        <div className="text-sm">{device.battery}%</div>
      </div>

      <div className="flex justify-center mt-4">
        <button className="bg-black text-white px-6 py-2 rounded-full">
          {device.power ? "Power Off" : "Power On"}
        </button>
      </div>

      <div className="mt-4">{renderDetailUI(device)}</div>

      <div
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute bottom-4 right-4 text-red-500 text-sm underline"
      >
        삭제
      </div>
    </div>
  );
}

function renderDetailUI(device: Device) {
  switch (device.type) {
    case "manager":
      return (
        <div className="text-sm text-gray-600">
          조명 · 향 · 사운드 전체 제어 가능 (목업)
        </div>
      );
    case "light":
      return <div className="text-sm text-gray-600">밝기/색상 조절 (목업)</div>;
    case "scent":
      return <div className="text-sm text-gray-600">향 분사량 조절 (목업)</div>;
    case "speaker":
      return <div className="text-sm text-gray-600">음량/재생 컨트롤 (목업)</div>;
  }
}

function getIcon(type: Device["type"]) {
  if (type === "manager") return "🌈";
  if (type === "light") return "💡";
  if (type === "scent") return "🧴";
  if (type === "speaker") return "🔊";
  return "🔧";
}
