// ======================================================
// File: src/app/(main)/home/components/Device/DeviceTypeSelectModal.tsx
// ======================================================

/*
  [DeviceTypeSelectModal 역할 정리]

  - 새 디바이스 추가 시 어떤 디바이스 타입인지 선택하는 모달
  - Manager / Light / Scent / Speaker 선택 가능
  - 클릭 시 선택한 type을 부모(onSelect)로 전달
  - 배경 클릭 시 닫히지 않음 (명확한 인터랙션 보장)
*/

"use client";

export default function DeviceTypeSelectModal({
  onSelect,
  onClose,
}: {
  onSelect: (type: string) => void;
  onClose: () => void;
}) {
  const types = [
    { id: "manager", label: "Manager", icon: "🌈" },
    { id: "light", label: "Smart Light", icon: "💡" },
    { id: "scent", label: "Scent Diffuser", icon: "🧴" },
    { id: "speaker", label: "Speaker", icon: "🔊" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-[300px] rounded-xl p-5 shadow-lg">
        <div className="text-lg font-semibold mb-4 text-center">
          디바이스 종류 선택
        </div>

        <div className="grid grid-cols-2 gap-3">
          {types.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="p-3 border rounded-xl flex flex-col items-center cursor-pointer hover:bg-gray-50"
            >
              <div className="text-3xl">{t.icon}</div>
              <div className="mt-1 text-sm">{t.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2 rounded-lg bg-gray-200 text-center"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
