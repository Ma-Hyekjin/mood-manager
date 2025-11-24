// ======================================================
// File: src/app/(main)/home/components/Device/hooks/useDeviceHandlers.ts
// ======================================================

import type { Device } from "@/types/device";

interface UseDeviceHandlersProps {
  device: Device;
  setDevices: (fn: (prev: Device[]) => Device[]) => void;
}

/**
 * 디바이스 액션 핸들러 생성 함수
 * 모든 디바이스 관련 액션(삭제, 전원 토글, 이름 변경, 컨트롤 업데이트)을 관리
 * 
 * 주의: 이 함수는 훅이 아니므로 반복문 내부에서도 사용 가능합니다.
 */
export function createDeviceHandlers({ device, setDevices }: UseDeviceHandlersProps) {
  // [MOCK] 디바이스 삭제 (로컬 상태만 업데이트)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // DELETE /api/devices/:deviceId
  // - 인증: NextAuth session (쿠키 기반)
  // - 응답: { success: boolean }
  // - 설명: 디바이스 삭제 및 DB에서 제거
  const handleDelete = () => {
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
  };

  // [MOCK] 디바이스 전원 토글 (로컬 상태만 업데이트)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // PUT /api/devices/:deviceId/power
  // - 인증: NextAuth session (쿠키 기반)
  // - 요청: { power: boolean }
  // - 응답: { device: Device }
  // - 설명: 디바이스 전원 상태 변경 및 DB 업데이트
  // - 백엔드에서 실제 디바이스와 통신하여 전원 상태 변경
  // - 백엔드에서 디바이스의 현재 상태(전원, 배터리 등)를 실시간으로 받아와야 함
  const handleTogglePower = () => {
    setDevices((prev) =>
      prev.map((d) => (d.id === device.id ? { ...d, power: !d.power } : d))
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
  };

  // [MOCK] 디바이스 이름 변경 (로컬 상태만 업데이트)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // PUT /api/devices/:deviceId/name
  // - 인증: NextAuth session (쿠키 기반)
  // - 요청: { name: string }
  // - 응답: { device: Device }
  // - 설명: 디바이스 이름 변경 및 DB 업데이트
  const handleUpdateName = (newName: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === device.id ? { ...d, name: newName } : d))
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
  };

  // [MOCK] 조명 컬러 변경 (로컬 상태만 업데이트)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // PUT /api/devices/:deviceId/color
  // - 인증: NextAuth session (쿠키 기반)
  // - 요청: { color: string } (HEX 색상 코드)
  // - 응답: { device: Device }
  // - 설명: 조명 디바이스의 색상 변경 및 DB 업데이트
  const handleUpdateLightColor = (color: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === device.id
          ? {
              ...d,
              output: { ...d.output, color },
            }
          : d
      )
    );
    // const updateColor = async () => {
    //   try {
    //     const response = await fetch(`/api/devices/${device.id}/color`, {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       credentials: "include",
    //       body: JSON.stringify({ color }),
    //     });
    //     if (!response.ok) throw new Error("Failed to update color");
    //     const data = await response.json();
    //     setDevices((prev) =>
    //       prev.map((d) => (d.id === device.id ? data.device : d))
    //     );
    //   } catch (error) {
    //     console.error("Error updating color:", error);
    //   }
    // };
    // updateColor();
  };

  // [MOCK] 조명 밝기 변경 (로컬 상태만 업데이트)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // PUT /api/devices/:deviceId/brightness
  // - 인증: NextAuth session (쿠키 기반)
  // - 요청: { brightness: number } (0-100)
  // - 응답: { device: Device }
  // - 설명: 조명 디바이스의 밝기 변경 및 DB 업데이트
  const handleUpdateLightBrightness = (brightness: number) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === device.id
          ? {
              ...d,
              output: { ...d.output, brightness },
            }
          : d
      )
    );
    // const updateBrightness = async () => {
    //   try {
    //     const response = await fetch(`/api/devices/${device.id}/brightness`, {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       credentials: "include",
    //       body: JSON.stringify({ brightness }),
    //     });
    //     if (!response.ok) throw new Error("Failed to update brightness");
    //     const data = await response.json();
    //     setDevices((prev) =>
    //       prev.map((d) => (d.id === device.id ? data.device : d))
    //     );
    //   } catch (error) {
    //     console.error("Error updating brightness:", error);
    //   }
    // };
    // updateBrightness();
  };

  // [MOCK] 향 분사량 변경 (로컬 상태만 업데이트)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // PUT /api/devices/:deviceId/scent-level
  // - 인증: NextAuth session (쿠키 기반)
  // - 요청: { scentLevel: number } (1-10)
  // - 응답: { device: Device }
  // - 설명: 향 디바이스의 분사량 레벨 변경 및 DB 업데이트 (레거시 API)
  const handleUpdateScentLevel = (level: number) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === device.id
          ? {
              ...d,
              output: { ...d.output, scentLevel: level },
            }
          : d
      )
    );
    // const updateScentLevel = async () => {
    //   try {
    //     const response = await fetch(`/api/devices/${device.id}/scent-level`, {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       credentials: "include",
    //       body: JSON.stringify({ scentLevel: level }),
    //     });
    //     if (!response.ok) throw new Error("Failed to update scent level");
    //     const data = await response.json();
    //     setDevices((prev) =>
    //       prev.map((d) => (d.id === device.id ? data.device : d))
    //     );
    //   } catch (error) {
    //     console.error("Error updating scent level:", error);
    //   }
    // };
    // updateScentLevel();
  };

  return {
    handleDelete,
    handleTogglePower,
    handleUpdateName,
    handleUpdateLightColor,
    handleUpdateLightBrightness,
    handleUpdateScentLevel,
  };
}

