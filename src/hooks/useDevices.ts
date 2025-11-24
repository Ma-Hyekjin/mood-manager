import { useState, useEffect } from "react";
import type { Device } from "@/types/device";
import type { Mood } from "@/types/mood";

// 정렬 우선순위 정의
const PRIORITY: Record<Device["type"], number> = {
  manager: 1,
  light: 2,
  speaker: 3,
  scent: 4,
};

// 타입별 기본 output 설정
function getDefaultOutput(type: Device["type"]): Device["output"] {
  switch (type) {
    case "manager":
      return {
        brightness: 80,
        color: "#ffffff",
        scentType: "Lavender",
        scentLevel: 5,
        volume: 50,
        nowPlaying: "Calm Breeze",
      };
    case "light":
      return {
        brightness: 70,
        color: "#FFD966",
      };
    case "scent":
      return {
        scentType: "Rose",
        scentLevel: 5,
      };
    case "speaker":
      return {
        volume: 60,
        nowPlaying: "Ocean Waves",
      };
    default:
      return {};
  }
}

/**
 * 디바이스 관리 커스텀 훅
 * 
 * [MOCK] 목업 모드로 동작
 * TODO: 백엔드 API로 교체 필요
 */
export function useDevices(initialDevices: Device[], currentMood: Mood) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);

  // [MOCK] 무드 변경 시 디바이스 업데이트 (로컬 상태만 업데이트)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // PUT /api/moods/current
  // - 인증: NextAuth session (쿠키 기반)
  // - 요청: { moodId: string }
  // - 응답: { mood: Mood, updatedDevices: Device[] }
  // - 설명: 무드를 변경하고 관련 디바이스 상태를 업데이트합니다 (색상, 음악, 향 모두 변경)
  useEffect(() => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.type === "manager") {
          return {
            ...d,
            output: {
              ...d.output,
              color: currentMood.color,
              scentType: currentMood.scent.name,
              nowPlaying: currentMood.song.title,
            },
          };
        }
        if (d.type === "light") {
          return {
            ...d,
            output: {
              ...d.output,
              color: currentMood.color,
            },
          };
        }
        return d;
      })
    );

    // const updateMood = async () => {
    //   try {
    //     const response = await fetch("/api/moods/current", {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       credentials: "include",
    //       body: JSON.stringify({ moodId: currentMood.id }),
    //     });
    //     if (!response.ok) throw new Error("Failed to update mood");
    //     const data = await response.json();
    //     setDevices(data.updatedDevices);
    //   } catch (error) {
    //     console.error("Error updating mood:", error);
    //   }
    // };
    // updateMood();
  }, [currentMood]);

  // [MOCK] 디바이스 추가 (로컬 상태만 업데이트)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // POST /api/devices
  // - 인증: NextAuth session (쿠키 기반)
  // - 요청: { type: DeviceType, name?: string }
  // - 응답: { device: Device }
  // - 설명: 새 디바이스 생성 및 DB 저장
  const addDevice = async (type: Device["type"], name?: string) => {
    const countOfType = devices.filter((d) => d.type === type).length;
    const defaultName =
      name?.trim() !== "" ? name : `${type.charAt(0).toUpperCase() + type.slice(1)} ${countOfType + 1}`;

    const newDevice: Device = {
      id: `${type}-${Date.now()}`,
      type,
      name: defaultName || `${type.charAt(0).toUpperCase() + type.slice(1)} ${countOfType + 1}`,
      battery: 100,
      power: true,
      output: getDefaultOutput(type),
    };

    // 우선순위 + 시간순 정렬
    const sorted = [...devices, newDevice].sort((a, b) => {
      if (PRIORITY[a.type] !== PRIORITY[b.type])
        return PRIORITY[a.type] - PRIORITY[b.type];

      return Number(a.id.split("-")[1]) - Number(b.id.split("-")[1]);
    });

    setDevices(sorted);

    // try {
    //   const response = await fetch("/api/devices", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     credentials: "include",
    //     body: JSON.stringify({
    //       type,
    //       name: defaultName,
    //     }),
    //   });
    //   if (!response.ok) {
    //     const error = await response.json();
    //     throw new Error(error.message || "Failed to create device");
    //   }
    //   const data = await response.json();
    //   // 새로 생성된 디바이스를 목록에 추가
    //   setDevices((prev) => {
    //     const updated = [...prev, data.device];
    //     return updated.sort((a, b) => {
    //       if (PRIORITY[a.type] !== PRIORITY[b.type])
    //         return PRIORITY[a.type] - PRIORITY[b.type];
    //       return a.id.localeCompare(b.id);
    //     });
    //   });
    // } catch (error) {
    //   console.error("Error creating device:", error);
    //   // 에러 발생 시 사용자에게 알림 (토스트 메시지 등)
    //   alert("디바이스 생성에 실패했습니다. 다시 시도해주세요.");
    // }
  };

  return {
    devices,
    setDevices,
    addDevice,
  };
}

