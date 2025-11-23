// ======================================================
// File: src/app/(main)/home/components/MoodDashboard/MoodDashboard.tsx
// ======================================================

/*
  [MoodDashboard 역할]

  - 화면 좌측 상단에 현재 무드명 표시
  - 중앙에는 원형 앨범 아트 + 음악 플레이 UI
  - 우측 상단에는 '새로고침(곡 재추천)' 버튼
  - 음악 progress bar + 컨트롤(뒤로가기/재생/멈춤/앞으로)
  - 아래에는 향 아이콘 + 향 분사량(1~10) 슬라이더
  - 대시보드 전체 배경색은 moodColor에 opacity 50% 반영
*/

"use client";

import { useState, useEffect } from "react";
import { MoodDashboardSkeleton } from "@/components/ui/Skeleton";
import { RefreshCcw, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { FaLeaf } from "react-icons/fa";
import { TbSpray } from "react-icons/tb";
import type { Mood, ScentType } from "@/types/mood";
import { MOODS, SCENT_DEFINITIONS } from "@/types/mood";

// 배경색의 밝기 계산 함수
function getBrightness(color: string): number {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

// 센트 타입별 아이콘 색상 결정 함수
// 배경이 밝으면 어두운 색, 어두우면 밝은 색 사용
function getScentIconColor(scentType: ScentType, backgroundColor: string): string {
  const brightness = getBrightness(backgroundColor);
  
  // 센트 타입별 기본 색상 매핑
  const typeColors: Record<ScentType, { light: string; dark: string }> = {
    Musk: { light: "#8B7355", dark: "#F5F5DC" }, // 베이지/크림 계열
    Aromatic: { light: "#5A7A4A", dark: "#E8D5FF" }, // 그린/퍼플 계열
    Woody: { light: "#4A2C1A", dark: "#D4A574" }, // 브라운 계열
    Citrus: { light: "#CC8800", dark: "#FFF8DC" }, // 옐로우/오렌지 계열
    Honey: { light: "#B8860B", dark: "#FFFACD" }, // 골드 계열
    Green: { light: "#2D5016", dark: "#FFFFFF" }, // 그린 계열 - 밝은 배경에서는 진한 녹색, 어두운 배경에서는 흰색
    Dry: { light: "#8B6F47", dark: "#F5DEB3" }, // 어스톤 계열
    Leathery: { light: "#3D2817", dark: "#D2B48C" }, // 다크 브라운 계열
    Marine: { light: "#4682B4", dark: "#E0F6FF" }, // 블루 계열
    Spicy: { light: "#8B4513", dark: "#FFE4B5" }, // 레드/오렌지 계열
    Floral: { light: "#C71585", dark: "#FFE4E1" }, // 핑크/퍼플 계열
    Powdery: { light: "#BC8F8F", dark: "#FFF0F5" }, // 파스텔 계열
  };
  
  // 밝기가 180 이상이면 밝은 배경으로 간주, 어두운 색 사용
  // 밝기가 180 미만이면 어두운 배경으로 간주, 밝은 색 사용
  return brightness >= 180 ? typeColors[scentType].light : typeColors[scentType].dark;
}

interface MoodDashboardProps {
  mood: Mood;
  onMoodChange: (mood: Mood) => void;
  onScentChange: (mood: Mood) => void;
  onSongChange: (mood: Mood) => void;
}

export default function MoodDashboard({
  mood,
  onMoodChange,
  onScentChange,
  onSongChange,
}: MoodDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(20);
  const [scentInterval, setScentInterval] = useState(30); // 분사 주기 (분 단위, 기본값 30분)

  // 초기 로딩 시뮬레이션 (실제로는 API 호출 시 사용)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 현재 무드의 같은 이름을 가진 다른 무드들 찾기
  const getMoodsWithSameName = (moodName: string) => {
    return MOODS.filter((m) => m.name === moodName);
  };

  // 현재 센트와 다른 센트로 무드 변경
  const handleScentClick = () => {
    const sameNameMoods = getMoodsWithSameName(mood.name);
    const currentIndex = sameNameMoods.findIndex((m) => m.id === mood.id);
    const nextIndex = (currentIndex + 1) % sameNameMoods.length;
    const nextMood = sameNameMoods[nextIndex];
    onScentChange(nextMood);
  };

  // 현재 노래와 다른 노래로 무드 변경
  const handlePreviousSong = () => {
    const sameNameMoods = getMoodsWithSameName(mood.name);
    const currentIndex = sameNameMoods.findIndex((m) => m.id === mood.id);
    const prevIndex = currentIndex === 0 ? sameNameMoods.length - 1 : currentIndex - 1;
    const prevMood = sameNameMoods[prevIndex];
    onSongChange(prevMood);
  };

  const handleNextSong = () => {
    const sameNameMoods = getMoodsWithSameName(mood.name);
    const currentIndex = sameNameMoods.findIndex((m) => m.id === mood.id);
    const nextIndex = (currentIndex + 1) % sameNameMoods.length;
    const nextMood = sameNameMoods[nextIndex];
    onSongChange(nextMood);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // [MOCK] 조명 컬러 변경 (새로고침 버튼)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // PUT /api/moods/current/color
  // - 인증: Bearer token (NextAuth session)
  // - 요청: { moodId: string }
  // - 응답: { mood: Mood, updatedDevices: Device[] }
  // - 설명: 조명 컬러 변경으로 인한 무드 업데이트
  const handleRefreshClick = () => {
    // [MOCK] 목업 모드: 랜덤 무드 선택
    const allMoods = MOODS;
    const randomMood = allMoods[Math.floor(Math.random() * allMoods.length)];
    onMoodChange(randomMood);
    
    // const updateColor = async () => {
    //   try {
    //     const response = await fetch("/api/moods/current/color", {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       credentials: "include",
    //       body: JSON.stringify({ moodId: randomMood.id }),
    //     });
    //     if (!response.ok) throw new Error("Failed to update color");
    //     const data = await response.json();
    //     onMoodChange(data.mood);
    //   } catch (error) {
    //     console.error("Error updating color:", error);
    //   }
    // };
    // updateColor();
  };

  // [MOCK] 앨범 클릭 시 다른 무드로 변경
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // PUT /api/moods/current
  // - 인증: Bearer token (NextAuth session)
  // - 요청: { moodId: string }
  // - 응답: { mood: Mood, updatedDevices: Device[] }
  // - 설명: 무드 전체 변경 (색상, 음악, 향 모두 변경)
  const handleAlbumClick = () => {
    // [MOCK] 목업 모드: 랜덤 무드 선택
    const allMoods = MOODS;
    const randomMood = allMoods[Math.floor(Math.random() * allMoods.length)];
    onMoodChange(randomMood);
    
    // const updateMood = async () => {
    //   try {
    //     const response = await fetch("/api/moods/current", {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       credentials: "include",
    //       body: JSON.stringify({ moodId: randomMood.id }),
    //     });
    //     if (!response.ok) throw new Error("Failed to update mood");
    //     const data = await response.json();
    //     onMoodChange(data.mood);
    //   } catch (error) {
    //     console.error("Error updating mood:", error);
    //   }
    // };
    // updateMood();
  };

  // 로딩 중 스켈레톤 표시
  if (isLoading) {
    return <MoodDashboardSkeleton />;
  }

  return (
    <div
      className="rounded-xl px-3 mb-1 w-full bg-white/80 backdrop-blur-sm border border-gray-200"
      style={{
        background: `${mood.color}55`, // 50% opacity
        paddingTop: "11px", // 상단 패딩: 16px의 1/3 감소 (16 - 16/3 = 약 11px)
        paddingBottom: "8px", // 하단 패딩: 16px의 절반 (pb-4 = 16px → 8px)
      }}
    >
      {/* 무드명과 새로고침 버튼 - 같은 로우 */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-base font-semibold text-gray-800">
          {mood.name}
        </div>
        <button
          onClick={handleRefreshClick}
          className="p-1.5 rounded-full bg-white/40 backdrop-blur hover:bg-white/60 transition text-gray-800"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      {/* 앨범 이미지 */}
      <div className="flex justify-center mb-2">
        <button
          onClick={handleAlbumClick}
          className="w-20 h-20 rounded-full bg-white shadow-md border flex items-center justify-center text-xs font-medium hover:scale-105 transition cursor-pointer"
        >
          Album Art
        </button>
      </div>

      {/* 노래 제목 */}
      <p className="text-center text-xs font-medium mb-1.5 text-gray-800">
        {mood.song.title}
      </p>

      {/* Progress Bar */}
      <div className="w-full flex items-center mb-2">
        <span className="text-xs mr-2 text-gray-800">
          {formatTime(progress)}
        </span>
        <div className="flex-1 h-1 bg-white/50 rounded">
          <div
            className="h-1 bg-black rounded"
            style={{ width: `${(progress / mood.song.duration) * 100}%` }}
          />
        </div>
        <span className="text-xs ml-2 text-gray-800">
          {formatTime(mood.song.duration)}
        </span>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex justify-center gap-4 mb-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePreviousSong();
          }}
          className="p-1.5 text-gray-800"
        >
          <SkipBack size={18} />
        </button>

        <button
          className="p-2 bg-white rounded-full shadow text-gray-800"
          onClick={(e) => {
            e.stopPropagation();
            setPlaying(!playing);
          }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNextSong();
          }}
          className="p-1.5 text-gray-800"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* 향기 컨트롤 */}
      <div className="mb-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-800">
            {mood.scent.name}
          </span>
          <span className="text-xs text-gray-800">
            {scentInterval} min
          </span>
        </div>

        <div className="flex items-center gap-2 mb-1">
          {/* 향 아이콘 (클릭 가능) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleScentClick();
            }}
            className="w-7 h-7 rounded-full shadow flex items-center justify-center hover:scale-105 transition cursor-pointer"
            style={{ backgroundColor: mood.scent.color }}
          >
            <TbSpray
              size={16}
              style={{ color: getScentIconColor(mood.scent.type, mood.scent.color) }}
            />
          </button>

          {/* 향 분사 주기 슬라이더 */}
          {/* [MOCK] 센트 분사 주기 변경 (로컬 상태만 업데이트) */}
          {/* TODO: 백엔드 API로 교체 필요 */}
          {/* API 명세: */}
          {/* PUT /api/devices/:deviceId/scent-interval */}
          {/* - 인증: Bearer token (NextAuth session) */}
          {/* - 요청: { interval: number (5, 10, 15, 20, 25, 30) } */}
          {/* - 응답: { device: Device } */}
          {/* - 설명: 센트 디바이스의 분사 주기 변경 (분 단위) */}
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={scentInterval}
            onChange={(e) => {
              // [MOCK] 목업 모드: 로컬 상태만 업데이트
              const newInterval = Number(e.target.value);
              setScentInterval(newInterval);
              
              // try {
              //   // Manager 디바이스 ID 찾기 (또는 props로 전달받기)
              //   // 실제로는 props로 devices를 전달받거나, context를 사용해야 함
              //   const response = await fetch("/api/devices/manager/scent-interval", {
              //     method: "PUT",
              //     headers: {
              //       "Content-Type": "application/json",
              //     },
              //     credentials: "include",
              //     body: JSON.stringify({ interval: newInterval }),
              //   });
              //   if (!response.ok) {
              //     const error = await response.json();
              //     throw new Error(error.message || "Failed to update scent interval");
              //   }
              //   const data = await response.json();
              //   // 디바이스 상태 업데이트는 부모 컴포넌트에서 처리하거나
              //   // 전역 상태 관리 필요
              // } catch (error) {
              //   console.error("Error updating scent interval:", error);
              //   // 에러 발생 시 이전 값으로 롤백
              //   setScentInterval(scentInterval);
              // }
            }}
            className="flex-1"
            style={{
              accentColor: mood.color,
              marginBottom: "0",
            }}
          />
        </div>
      </div>
    </div>
  );
}
