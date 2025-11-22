// ======================================================
// File: src/app/(main)/home/components/Device/AddDeviceCard.tsx
// ======================================================

/*
  [AddDeviceCard 역할]

  - 항상 마지막 줄에 나타나는 + 카드
  - 클릭 시 onAdd() 호출
*/

"use client";

export default function AddDeviceCard({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <div
      className="h-[100px] flex items-center justify-center border border-dashed rounded-xl cursor-pointer text-3xl text-gray-500 hover:bg-gray-50 transition"
      onClick={onAdd}
    >
      +
    </div>
  );
}
