/**
 * File: src/app/(main)/home/components/Device/DeviceTypeSelectModal.tsx
 *
 * DeviceTypeSelectModal Component
 *
 * 구성 요소:
 *  - "어떤 종류의 디바이스를 추가하시겠습니까?"
 *  - 4가지 타입 선택 (manager / light / scent / speaker)
 *
 * Props:
 *  - isOpen: boolean
 *  - onSelect(type: DeviceType)
 *  - onCancel()
 */

import { DeviceType } from "../../types/device";

interface DeviceTypeSelectModalProps {
  isOpen: boolean;
  onSelect: (type: DeviceType) => void;
  onCancel: () => void;
}

export default function DeviceTypeSelectModal({
  isOpen,
  onSelect,
  onCancel,
}: DeviceTypeSelectModalProps) {
  if (!isOpen) return null;

  const types: DeviceType[] = ["manager", "light", "scent", "speaker"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-80 p-6 rounded-xl shadow space-y-5">
        <p className="text-lg font-semibold text-center">
          어떤 디바이스를 추가하시겠습니까?
        </p>

        <div className="grid grid-cols-2 gap-3">
          {types.map((t) => (
            <button
              key={t}
              className="p-3 w-full bg-gray-100 rounded-lg hover:bg-gray-200 capitalize"
              onClick={() => onSelect(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <button className="w-full py-2 rounded bg-gray-300" onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  );
}
