// ======================================================
// File: src/app/(main)/home/page.tsx
// ======================================================

/*
  [Home Page 역할 정리]

  - TopNav, MoodDashboard, DeviceGrid, BottomNav 포함 전체 홈 화면
  - expandedId: 현재 확장된 카드 1개를 관리
  - devices: 현재 등록된 디바이스들 목록
  - + 버튼 → DeviceAddModal 오픈
  - 디바이스 추가 시 타입 + 이름 설정 후 자동 정렬 규칙에 따라 삽입
      정렬 규칙:
        1) Manager → Light → Speaker → Scent 순
        2) 같은 타입끼리는 오래된 순
  - 레이아웃은 app/layout.tsx에서 375px 중앙정렬이 적용됨
*/

"use client";

import { useState, useEffect } from "react";
import TopNav from "@/components/navigation/TopNav";
import BottomNav from "@/components/navigation/BottomNav";

import MoodDashboard from "./components/MoodDashboard/MoodDashboard";
import DeviceGrid from "./components/Device/DeviceGrid";

import DeviceAddModal from "./components/Device/DeviceAddModal";
import SurveyOverlay from "./components/SurveyOverlay/SurveyOverlay";
import type { Device } from "@/types/device";
import { MOODS, type Mood } from "@/types/mood";

// 정렬 우선순위 정의
const PRIORITY: Record<string, number> = {
  manager: 1,
  light: 2,
  speaker: 3,
  scent: 4,
};

export default function HomePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);

  // 초기 무드 설정
  const initialMood = MOODS[0];
  const [currentMood, setCurrentMood] = useState<Mood>(initialMood);

  // [API] 설문 조사 완료 여부 확인 (초기 로드 시 1회)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // GET /api/auth/survey-status
  // - 인증: NextAuth session (쿠키 기반)
  // - 응답: { hasSurvey: boolean }
  // - 설명: 설문 조사를 한 적이 있으면 true, 없으면 false
  useEffect(() => {
    const checkSurveyStatus = async () => {
      try {
        const response = await fetch("/api/auth/survey-status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          // 에러 발생 시 설문 표시하지 않음
          return;
        }
        const data = await response.json();
        // hasSurvey가 false면 설문 오버레이 표시
        if (data.hasSurvey === false) {
          setShowSurvey(true);
        }
      } catch (error) {
        console.error("Error checking survey status:", error);
        // 에러 발생 시 설문 표시하지 않음
      }
    };
    checkSurveyStatus();
  }, []);

  // 설문 완료 핸들러
  const handleSurveyComplete = async () => {
    setShowSurvey(false);
    // try {
    //   const response = await fetch("/api/auth/survey", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     credentials: "include",
    //     body: JSON.stringify({
    //       preferences: {
    //         scent: "...",
    //         music: "...",
    //         brightness: 80,
    //         color: "#FFD700",
    //       },
    //     }),
    //   });
    //   if (!response.ok) throw new Error("Failed to submit survey");
    //   setShowSurvey(false);
    // } catch (error) {
    //   console.error("Error submitting survey:", error);
    // }
  };

  // 설문 건너뛰기 핸들러
  const handleSurveySkip = async () => {
    setShowSurvey(false);
    // try {
    //   const response = await fetch("/api/auth/survey-skip", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     credentials: "include",
    //   });
    //   if (!response.ok) throw new Error("Failed to skip survey");
    //   setShowSurvey(false);
    // } catch (error) {
    //   console.error("Error skipping survey:", error);
    // }
  };

  // [MOCK] 샘플 초기 디바이스 데이터
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // GET /api/devices
  // - 인증: NextAuth session (쿠키 기반)
  // - 응답: { devices: Device[] }
  // - 설명: 현재 사용자의 모든 디바이스 목록 조회
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "manager-1",
      type: "manager",
      name: "Mood Manager",
      battery: 100,
      power: true,
      output: {
        brightness: 85,
        color: initialMood.color,
        scentType: initialMood.scent.name,
        scentLevel: 7,
        volume: 65,
        nowPlaying: initialMood.song.title,
      },
    },
    {
      id: "light-1",
      type: "light",
      name: "Smart Light 1",
      battery: 100,
      power: true,
      output: {
        brightness: 75,
        color: initialMood.color,
      },
    },
  ]);

  // [API] 디바이스 목록 조회 (초기 로드)
  // useEffect(() => {
  //   const fetchDevices = async () => {
  //     try {
  //       const response = await fetch("/api/devices", {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         credentials: "include",
  //       });
  //       if (!response.ok) {
  //         if (response.status === 401) {
  //           // 인증 실패 시 로그인 페이지로 리다이렉트
  //           router.push("/login");
  //           return;
  //         }
  //         throw new Error("Failed to fetch devices");
  //       }
  //       const data = await response.json();
  //       setDevices(data.devices || []);
  //     } catch (error) {
  //       console.error("Error fetching devices:", error);
  //       // 에러 발생 시 빈 배열로 설정하거나 에러 메시지 표시
  //     }
  //   };
  //   fetchDevices();
  // }, [router]);

  // [MOCK] 무드 변경 시 디바이스 업데이트 (로컬 상태만 업데이트)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // PUT /api/moods/current
  // - 인증: Bearer token (NextAuth session)
  // - 요청: { moodId: string }
  // - 응답: { mood: Mood, updatedDevices: Device[] }
  // - 설명: 현재 무드 변경 및 관련 디바이스 상태 업데이트
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
  // - 인증: Bearer token (NextAuth session)
  // - 요청: { type: DeviceType, name?: string }
  // - 응답: { device: Device }
  // - 설명: 새 디바이스 생성 및 DB 저장
  const addDevice = async (type: Device["type"], name?: string) => {
    const countOfType = devices.filter((d) => d.type === type).length;
    const defaultName =
      name?.trim() !== "" ? name : `${type.charAt(0).toUpperCase() + type.slice(1)} ${countOfType + 1}`;

    // 타입별 기본 output 설정
    const getDefaultOutput = (): Device["output"] => {
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
    };

    const newDevice: Device = {
      id: `${type}-${Date.now()}`,
      type,
      name: defaultName || `${type.charAt(0).toUpperCase() + type.slice(1)} ${countOfType + 1}`,
      battery: 100,
      power: true,
      output: getDefaultOutput(),
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

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav />

      <div className="pt-2 px-3 flex flex-col flex-1 overflow-hidden">
        {/* 무드 대시보드 - 고정 */}
        <div className="flex-shrink-0">
          <MoodDashboard
            mood={currentMood}
            onMoodChange={setCurrentMood}
            onScentChange={(newMood) => {
              // [MOCK] 센트 변경 (로컬 상태만 업데이트)
              // TODO: 백엔드 API로 교체 필요
              // API 명세:
              // PUT /api/moods/current/scent
              // - 인증: Bearer token (NextAuth session)
              // - 요청: { moodId: string }
              // - 응답: { mood: Mood, updatedDevices: Device[] }
              // - 설명: 센트 변경으로 인한 무드 업데이트
              setCurrentMood(newMood);
              setDevices((prev) =>
                prev.map((d) =>
                  d.type === "manager"
                    ? {
                        ...d,
                        output: {
                          ...d.output,
                          color: newMood.color,
                          scentType: newMood.scent.name,
                          nowPlaying: newMood.song.title,
                        },
                      }
                    : d
                )
              );
              // const updateScent = async () => {
              //   try {
              //     const response = await fetch("/api/moods/current/scent", {
              //       method: "PUT",
              //       headers: {
              //         "Content-Type": "application/json",
              //       },
              //       credentials: "include",
              //       body: JSON.stringify({ moodId: newMood.id }),
              //     });
              //     if (!response.ok) throw new Error("Failed to update scent");
              //     const data = await response.json();
              //     setCurrentMood(data.mood);
              //     setDevices(data.updatedDevices);
              //   } catch (error) {
              //     console.error("Error updating scent:", error);
              //   }
              // };
              // updateScent();
            }}
            onSongChange={(newMood) => {
              // [MOCK] 노래 변경 (로컬 상태만 업데이트)
              // TODO: 백엔드 API로 교체 필요
              // API 명세:
              // PUT /api/moods/current/song
              // - 인증: Bearer token (NextAuth session)
              // - 요청: { moodId: string }
              // - 응답: { mood: Mood, updatedDevices: Device[] }
              // - 설명: 노래 변경으로 인한 무드 업데이트
              setCurrentMood(newMood);
              setDevices((prev) =>
                prev.map((d) =>
                  d.type === "manager"
                    ? {
                        ...d,
                        output: {
                          ...d.output,
                          color: newMood.color,
                          scentType: newMood.scent.name,
                          nowPlaying: newMood.song.title,
                        },
                      }
                    : d
                )
              );
              // const updateSong = async () => {
              //   try {
              //     const response = await fetch("/api/moods/current/song", {
              //       method: "PUT",
              //       headers: {
              //         "Content-Type": "application/json",
              //       },
              //       credentials: "include",
              //       body: JSON.stringify({ moodId: newMood.id }),
              //     });
              //     if (!response.ok) throw new Error("Failed to update song");
              //     const data = await response.json();
              //     setCurrentMood(data.mood);
              //     setDevices(data.updatedDevices);
              //   } catch (error) {
              //     console.error("Error updating song:", error);
              //   }
              // };
              // updateSong();
            }}
          />
        </div>

        {/* 디바이스 그리드 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto mt-4 pb-20">
          <DeviceGrid
            devices={devices}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            setDevices={setDevices}
            openAddModal={() => setShowAddModal(true)}
          />
        </div>
      </div>

      <BottomNav />

      {showAddModal && (
        <DeviceAddModal
          onClose={() => setShowAddModal(false)}
          onConfirm={(type: Device["type"], name?: string) => {
            addDevice(type, name);
            setShowAddModal(false);
          }}
        />
      )}

      {/* 설문 조사 오버레이 - 한 번도 설문을 한 적이 없는 사용자에게만 표시 */}
      {showSurvey && (
        <SurveyOverlay
          onComplete={handleSurveyComplete}
          onSkip={handleSurveySkip}
        />
      )}
    </div>
  );
}
