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

import { useState, useEffect } from "react";
import DeviceCardSmall from "./DeviceCardSmall";
import DeviceCardExpanded from "./DeviceCardExpanded";
import AddDeviceCard from "./AddDeviceCard";
import { DeviceCardSkeleton, DeviceCardExpandedSkeleton } from "@/components/ui/Skeleton";
import { Device } from "@/types/device";
import { type Mood } from "@/types/mood";

export default function DeviceGrid({
  devices,
  expandedId,
  setExpandedId,
  setDevices,
  openAddModal,
  currentMood,
}: {
  devices: Device[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  setDevices: (fn: (prev: Device[]) => Device[]) => void;
  openAddModal: () => void;
  currentMood?: Mood; // 현재 무드 (AddDeviceCard에 전달)
}) {
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로딩 시뮬레이션 (실제로는 API 호출 시 사용)
  useEffect(() => {
    // 목업: 초기 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 확장 카드가 있으면 그 카드를 먼저 앞으로 정렬
  const sortedDevices =
    expandedId === null
      ? devices
      : [
          ...devices.filter((d) => d.id === expandedId),
          ...devices.filter((d) => d.id !== expandedId),
        ];

  // 로딩 중 스켈레톤 표시
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 mt-4">
        {[1, 2].map((i) => (
          <DeviceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {sortedDevices.map((device) => {
        const isExpanded = expandedId === device.id;

        if (isExpanded)
          return (
            <div key={device.id} className="col-span-2 animate-grow">
              <DeviceCardExpanded
                device={device}
                currentMood={currentMood}
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
                  // - 백엔드에서 실제 디바이스와 통신하여 전원 상태 변경
                  // - 백엔드에서 디바이스의 현재 상태(전원, 배터리 등)를 실시간으로 받아와야 함
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
                  //     // 백엔드에서 실제 디바이스 상태를 받아와서 업데이트
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
                onUpdateName={(newName) => {
                  // [MOCK] 디바이스 이름 변경 (로컬 상태만 업데이트)
                  // TODO: 백엔드 API로 교체 필요
                  // API 명세:
                  // PUT /api/devices/:deviceId/name
                  // - 인증: Bearer token (NextAuth session)
                  // - 요청: { name: string }
                  // - 응답: { device: Device }
                  // - 설명: 디바이스 이름 변경 및 DB 업데이트
                  setDevices((prev) =>
                    prev.map((d) =>
                      d.id === device.id ? { ...d, name: newName } : d
                    )
                  );
                  // const updateName = async () => {
                  //   try {
                  //     const response = await fetch(`/api/devices/${device.id}/name`, {
                  //       method: "PUT",
                  //       headers: {
                  //         "Content-Type": "application/json",
                  //       },
                  //       credentials: "include",
                  //       body: JSON.stringify({ name: newName }),
                  //     });
                  //     if (!response.ok) throw new Error("Failed to update device name");
                  //     const data = await response.json();
                  //     setDevices((prev) =>
                  //       prev.map((d) => (d.id === device.id ? data.device : d))
                  //     );
                  //   } catch (error) {
                  //     console.error("Error updating device name:", error);
                  //     // 에러 발생 시 롤백 (선택사항)
                  //     setDevices((prev) =>
                  //       prev.map((d) =>
                  //         d.id === device.id ? { ...d, name: device.name } : d
                  //       )
                  //     );
                  //   }
                  // };
                  // updateName();
                }}
              />
            </div>
          );

        return (
          <DeviceCardSmall
            key={device.id}
            device={device}
            currentMood={currentMood}
            onClick={() => {
              if (expandedId === device.id) setExpandedId(null);
              else setExpandedId(device.id);
            }}
          />
        );
      })}

      {/* + 버튼 */}
      <AddDeviceCard onAdd={openAddModal} currentMood={currentMood} />
    </div>
  );
}
