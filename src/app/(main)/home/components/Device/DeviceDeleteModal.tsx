/**
 * File: src/app/(main)/home/components/Device/DeviceDeleteModal.tsx
 *
 * DeviceDeleteModal Component
 *
 * 메시지:
 *  - "디바이스를 삭제하시겠습니까?"
 *
 * 구성 요소:
 *  - 예 → onConfirm()
 *  - 아니오 → onCancel()
 */

interface DeviceDeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeviceDeleteModal({
  isOpen,
  onConfirm,
  onCancel,
}: DeviceDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-72 text-center space-y-4 shadow-lg">
        <p className="text-lg font-semibold">디바이스를 삭제하시겠습니까?</p>

        <div className="flex justify-between space-x-3">
          <button
            className="flex-1 py-2 rounded-lg bg-gray-200"
            onClick={onCancel}
          >
            아니오
          </button>
          <button
            className="flex-1 py-2 rounded-lg bg-red-500 text-white"
            onClick={onConfirm}
          >
            예
          </button>
        </div>
      </div>
    </div>
  );
}
