// ======================================================
// File: src/app/(main)/home/components/Device/AddDeviceCard.tsx
// ======================================================

/*
  [AddDeviceCard 역할 정리]

  - 디바이스를 추가하는 용도의 카드
  - 항상 그리드 마지막에 존재
  - 2×N 구조에서 한 칸을 차지 (col-span-1)
  - 클릭 시 onAdd() 호출 → 추후 모달로 디바이스 유형 선택 예정
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
