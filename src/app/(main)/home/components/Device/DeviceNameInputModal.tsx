/**
 * File: src/app/(main)/home/components/Device/DeviceNameInputModal.tsx
 *
 * DeviceNameInputModal Component
 *
 * 구성 요소:
 *  - 이름 입력 input
 *  - 확인 / 취소
 *
 * Props:
 *  - isOpen: boolean
 *  - onSubmit(name: string)
 *  - onCancel()
 */

import { useState } from "react";

interface DeviceNameInputModalProps {
  isOpen: boolean;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export default function DeviceNameInputModal({
  isOpen,
  onSubmit,
  onCancel,
}: DeviceNameInputModalProps) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-80 p-6 rounded-xl shadow space-y-4">
        <p className="text-lg font-semibold">디바이스 이름을 입력하세요</p>

        <input
          className="w-full border px-3 py-2 rounded-lg"
          placeholder="기기 이름 입력"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex justify-between space-x-3">
          <button className="flex-1 py-2 bg-gray-200 rounded-lg" onClick={onCancel}>
            취소
          </button>

          <button
            className="flex-1 py-2 bg-black text-white rounded-lg"
            onClick={() => {
              if (!name) return;
              onSubmit(name);
              setName("");
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
