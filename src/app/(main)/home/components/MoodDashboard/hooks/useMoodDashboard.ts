// ======================================================
// File: src/app/(main)/home/components/MoodDashboard/hooks/useMoodDashboard.ts
// ======================================================

import { useState, useEffect } from "react";
import type { Mood } from "@/types/mood";
import { MOODS } from "@/types/mood";

interface UseMoodDashboardProps {
  mood: Mood;
  onMoodChange: (mood: Mood) => void;
  onScentChange: (mood: Mood) => void;
  onSongChange: (mood: Mood) => void;
}

/**
 * 무드 대시보드 상태 및 핸들러 관리 훅
 */
export function useMoodDashboard({
  mood,
  onMoodChange,
  onScentChange,
  onSongChange,
}: UseMoodDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [progress] = useState(20);
  const [isSaved, setIsSaved] = useState(false);
  const [moodDuration] = useState(30);

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

  // [MOCK] 향 변경 (스프레이 아이콘 클릭)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // PUT /api/moods/current/scent
  // - 인증: NextAuth session (쿠키 기반)
  // - 요청: { moodId: string } (같은 무드명의 다른 센트 버전)
  // - 응답: { mood: Mood, updatedDevices: Device[] }
  // - 설명: 센트 변경으로 인한 무드 업데이트 및 관련 디바이스 상태 업데이트
  // - 동작: 향을 변경하면서 무드 듀레이션 내에서의 변경 (지속 시간 유지)
  const handleScentClick = () => {
    const sameNameMoods = getMoodsWithSameName(mood.name);
    
    // 같은 이름의 무드가 없거나 1개만 있으면 다른 무드로 변경하지 않음
    if (sameNameMoods.length <= 1) {
      console.warn("No alternative moods with same name found");
      return;
    }
    
    const currentIndex = sameNameMoods.findIndex((m) => m.id === mood.id);
    
    // 현재 무드를 찾지 못한 경우 첫 번째 무드 선택
    if (currentIndex === -1) {
      const nextMood = sameNameMoods[0];
      onScentChange(nextMood);
      return;
    }
    
    // 다음 인덱스 계산 (순환)
    const nextIndex = (currentIndex + 1) % sameNameMoods.length;
    const nextMood = sameNameMoods[nextIndex];
    
    // 다음 무드가 현재 무드와 다른 향을 가지고 있는지 확인
    if (nextMood.scent.name !== mood.scent.name || nextMood.scent.type !== mood.scent.type) {
      onScentChange(nextMood);
    } else {
      // 같은 향이면 그 다음 무드로 건너뛰기
      const skipIndex = (nextIndex + 1) % sameNameMoods.length;
      const skipMood = sameNameMoods[skipIndex];
      if (skipMood.scent.name !== mood.scent.name || skipMood.scent.type !== mood.scent.type) {
        onScentChange(skipMood);
      }
    }
  };

  // [MOCK] 음악 변경 (이전/다음 버튼)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // PUT /api/moods/current/song
  // - 인증: NextAuth session (쿠키 기반)
  // - 요청: { moodId: string } (같은 무드명의 다른 노래 버전)
  // - 응답: { mood: Mood, updatedDevices: Device[] }
  // - 설명: 노래 변경으로 인한 무드 업데이트 및 관련 디바이스 상태 업데이트
  // - 동작: 음악이 변경하면서 무드 듀레이션 내에서의 변경 (지속 시간 유지)
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

  // [MOCK] 무드 새로고침 (새로고침 버튼)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // PUT /api/moods/current/refresh
  // - 인증: NextAuth session (쿠키 기반)
  // - 요청: { direction?: "prev" | "next" } (선택적: 이전/다음 무드 패턴으로 이동)
  // - 응답: { mood: Mood, updatedDevices: Device[], duration: number }
  // - 설명: 무드 듀레이션을 포함한 전체 변경. 무드 패턴 이동 (동일 클러스터 또는 이전/다음 패턴)
  // - 동작: 같은 무드 패턴 내에서 다른 조합(음악/향/조명) 선택 또는 무드 패턴 이동 (-1이면 0으로, 0이면 +1로)
  const handleRefreshClick = () => {
    // [MOCK] 목업 모드: 같은 이름의 무드 중 랜덤 선택 (무드 클러스터 내에서 변경)
    const sameNameMoods = getMoodsWithSameName(mood.name);
    if (sameNameMoods.length > 1) {
      // 같은 이름의 무드가 여러 개 있으면 그 중 랜덤 선택
      const filteredMoods = sameNameMoods.filter((m) => m.id !== mood.id);
      const randomMood = filteredMoods[Math.floor(Math.random() * filteredMoods.length)];
      onMoodChange(randomMood);
    } else {
      // 같은 이름의 무드가 1개만 있으면 전체 무드 중 랜덤 선택
      const allMoods = MOODS;
      const randomMood = allMoods[Math.floor(Math.random() * allMoods.length)];
      onMoodChange(randomMood);
    }
    
    // const refreshMood = async () => {
    //   try {
    //     const response = await fetch("/api/moods/current/refresh", {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       credentials: "include",
    //       body: JSON.stringify({ extendDuration: false }), // false: 무드 변경, true: 지속 시간만 연장
    //     });
    //     if (!response.ok) throw new Error("Failed to refresh mood");
    //     const data = await response.json();
    //     onMoodChange(data.mood);
    //     if (data.duration) {
    //       setMoodDuration(data.duration); // 백엔드에서 계산된 지속 시간 업데이트
    //     }
    //   } catch (error) {
    //     console.error("Error refreshing mood:", error);
    //   }
    // };
    // refreshMood();
  };

  // [MOCK] 앨범 클릭 시 다른 무드로 변경
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // PUT /api/moods/current
  // - 인증: NextAuth session (쿠키 기반)
  // - 요청: { moodId: string }
  // - 응답: { mood: Mood, updatedDevices: Device[] }
  // - 설명: 무드를 변경하고 관련 디바이스 상태를 업데이트합니다 (색상, 음악, 향 모두 변경)
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

  return {
    isLoading,
    playing,
    setPlaying,
    progress,
    isSaved,
    setIsSaved,
    moodDuration,
    handleScentClick,
    handlePreviousSong,
    handleNextSong,
    handleRefreshClick,
    handleAlbumClick,
  };
}

