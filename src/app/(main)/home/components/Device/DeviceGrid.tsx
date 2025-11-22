// ======================================================
// File: src/app/(main)/home/components/Device/DeviceGrid.tsx
// ======================================================

/*
  [DeviceGrid 역할 정리]

  - 2×N 카드 그리드
  - expandedId가 있으면 그 카드만 col-span-2로 확장
  - 확장 중인 카드가 가장 상단에 오도록 정렬
  - 나머지 small card들은 자동 재배치
  - + 버튼은 항상 맨 마지막에 위치
  - openAddModal() 호출 시 DeviceAddModal 오픈
*/

"use client";

import DeviceCardSmall from "./DeviceCardSmall";
import DeviceCardExpanded from "./DeviceCardExpanded";
import AddDeviceCard from "./AddDeviceCard";
import { Device } from "@/types/device";

export default function DeviceGrid({
  devices,
  expandedId,
  setExpandedId,
  setDevices,
  openAddModal,
}: {
  devices: Device[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  setDevices: (fn: (prev: Device[]) => Device[]) => void;
  openAddModal: () => void;
}) {
  // 확장 카드가 있으면 그 카드를 먼저 앞으로 정렬
  const sortedDevices =
    expandedId === null
      ? devices
      : [
          ...devices.filter((d) => d.id === expandedId),
          ...devices.filter((d) => d.id !== expandedId),
        ];

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {sortedDevices.map((device) => {
        const isExpanded = expandedId === device.id;

        if (isExpanded)
          return (
            <div key={device.id} className="col-span-2 animate-grow">
              <DeviceCardExpanded
                device={device}
                onClose={() => setExpandedId(null)}
                onDelete={() => {
                  // [MOCK] 디바이스 삭제 (로컬 상태만 업데이트)
                  // TODO: 백엔드 API로 교체 필요
                  // API 명세:
                  // DELETE /api/devices/:deviceId
                  // - 인증: Bearer token (NextAuth session)
                  // - 응답: { success: boolean }
                  // - 설명: 디바이스 삭제 및 DB에서 제거
                  setDevices((prev) => prev.filter((d) => d.id !== device.id));
                  // const deleteDevice = async () => {
                  //   try {
                  //     const response = await fetch(`/api/devices/${device.id}`, {
                  //       method: "DELETE",
                  //       headers: {
                  //         "Content-Type": "application/json",
                  //       },
                  //       credentials: "include",
                  //     });
                  //     if (!response.ok) throw new Error("Failed to delete device");
                  //     setDevices((prev) => prev.filter((d) => d.id !== device.id));
                  //   } catch (error) {
                  //     console.error("Error deleting device:", error);
                  //   }
                  // };
                  // deleteDevice();
                }}
                onTogglePower={() => {
                  // [MOCK] 디바이스 전원 토글 (로컬 상태만 업데이트)
                  // TODO: 백엔드 API로 교체 필요
                  // API 명세:
                  // PUT /api/devices/:deviceId/power
                  // - 인증: Bearer token (NextAuth session)
                  // - 요청: { power: boolean }
                  // - 응답: { device: Device }
                  // - 설명: 디바이스 전원 상태 변경 및 DB 업데이트
                  setDevices((prev) =>
                    prev.map((d) =>
                      d.id === device.id ? { ...d, power: !d.power } : d
                    )
                  );
                  // const togglePower = async () => {
                  //   try {
                  //     const response = await fetch(`/api/devices/${device.id}/power`, {
                  //       method: "PUT",
                  //       headers: {
                  //         "Content-Type": "application/json",
                  //       },
                  //       credentials: "include",
                  //       body: JSON.stringify({ power: !device.power }),
                  //     });
                  //     if (!response.ok) throw new Error("Failed to toggle power");
                  //     const data = await response.json();
                  //     setDevices((prev) =>
                  //       prev.map((d) => (d.id === device.id ? data.device : d))
                  //     );
                  //   } catch (error) {
                  //     console.error("Error toggling power:", error);
                  //     // 에러 발생 시 롤백 (선택사항)
                  //     setDevices((prev) =>
                  //       prev.map((d) =>
                  //         d.id === device.id ? { ...d, power: device.power } : d
                  //       )
                  //     );
                  //   }
                  // };
                  // togglePower();
                }}
              />
            </div>
          );

        return (
          <DeviceCardSmall
            key={device.id}
            device={device}
            onClick={() => {
              if (expandedId === device.id) setExpandedId(null);
              else setExpandedId(device.id);
            }}
          />
        );
      })}

      {/* + 버튼 */}
      <AddDeviceCard onAdd={openAddModal} />
    </div>
  );
}
