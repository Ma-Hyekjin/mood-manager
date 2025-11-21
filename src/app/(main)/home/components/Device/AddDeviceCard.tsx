/**
 * File: src/app/(main)/home/components/Device/AddDeviceCard.tsx
 *
 * AddDeviceCard Component (+ 카드)
 *
 * UX:
 *  - 항상 DeviceGrid 내부에서 마지막에 표시됨
 *  - 클릭 시 "디바이스 타입 선택 모달" 호출
 *
 * Props:
 *  - onAddDevice(): void
 */

interface AddDeviceCardProps {
  onAdd: () => void;
}

export default function AddDeviceCard({ onAdd }: AddDeviceCardProps) {
  return (
    <div
      className="w-full h-28 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer"
      onClick={onAdd}
    >
      <span className="text-3xl text-gray-400">+</span>
    </div>
  );
}
