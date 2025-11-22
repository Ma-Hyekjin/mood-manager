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
import { RefreshCcw, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { FaLeaf } from "react-icons/fa";
import { TbSpray } from "react-icons/tb";
import type { Mood } from "@/types/mood";
import { MOODS, SCENT_DEFINITIONS } from "@/types/mood";

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
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(20);
  const [scentLevel, setScentLevel] = useState(5);

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

  return (
    <div
      className="rounded-xl p-3 mb-3 w-full"
      style={{
        background: `${mood.color}55`, // 50% opacity
      }}
    >
      {/* 무드명 */}
      <div className="text-base font-semibold mb-2">{mood.name}</div>

      {/* 새로고침 버튼 */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleRefreshClick}
          className="p-1.5 rounded-full bg-white/40 backdrop-blur hover:bg-white/60 transition"
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
      <p className="text-center text-xs font-medium mb-1.5">{mood.song.title}</p>

      {/* Progress Bar */}
      <div className="w-full flex items-center mb-2">
        <span className="text-xs mr-2">{formatTime(progress)}</span>
        <div className="flex-1 h-1 bg-white/50 rounded">
          <div
            className="h-1 bg-black rounded"
            style={{ width: `${(progress / mood.song.duration) * 100}%` }}
          />
        </div>
        <span className="text-xs ml-2">{formatTime(mood.song.duration)}</span>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex justify-center gap-4 mb-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePreviousSong();
          }}
          className="p-1.5"
        >
          <SkipBack size={18} />
        </button>

        <button
          className="p-2 bg-white rounded-full shadow"
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
          className="p-1.5"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* 향기 컨트롤 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs">Scent</span>
          <span className="text-xs">{scentLevel}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* 향 아이콘 (클릭 가능) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleScentClick();
            }}
            className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:scale-105 transition cursor-pointer"
            style={{ backgroundColor: mood.scent.color }}
          >
            <TbSpray className="text-white text-ms" />
          </button>

          {/* 향 분사량 슬라이더 */}
          {/* [MOCK] 센트 레벨 변경 (로컬 상태만 업데이트) */}
          {/* TODO: 백엔드 API로 교체 필요 */}
          {/* API 명세: */}
          {/* PUT /api/devices/:deviceId/scent-level */}
          {/* - 인증: Bearer token (NextAuth session) */}
          {/* - 요청: { level: number (1-10) } */}
          {/* - 응답: { device: Device } */}
          {/* - 설명: 센트 디바이스의 분사량 레벨 변경 */}
          <input
            type="range"
            min={1}
            max={10}
            value={scentLevel}
            onChange={async (e) => {
              const newLevel = Number(e.target.value);
              setScentLevel(newLevel);
              // try {
              //   // Manager 디바이스 ID 찾기 (또는 props로 전달받기)
              //   // 실제로는 props로 devices를 전달받거나, context를 사용해야 함
              //   const response = await fetch("/api/devices/manager/scent-level", {
              //     method: "PUT",
              //     headers: {
              //       "Content-Type": "application/json",
              //     },
              //     credentials: "include",
              //     body: JSON.stringify({ level: newLevel }),
              //   });
              //   if (!response.ok) {
              //     const error = await response.json();
              //     throw new Error(error.message || "Failed to update scent level");
              //   }
              //   const data = await response.json();
              //   // 디바이스 상태 업데이트는 부모 컴포넌트에서 처리하거나
              //   // 전역 상태 관리 필요
              // } catch (error) {
              //   console.error("Error updating scent level:", error);
              //   // 에러 발생 시 이전 값으로 롤백
              //   setScentLevel(scentLevel);
              // }
            }}
            className="flex-1"
            style={{
              accentColor: mood.color,
            }}
          />
        </div>
      </div>
    </div>
  );
}
