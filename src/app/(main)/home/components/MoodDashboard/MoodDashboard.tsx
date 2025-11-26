// ======================================================
// File: src/app/(main)/home/components/MoodDashboard/MoodDashboard.tsx
// ======================================================

/*
  [MoodDashboard 역할]

  - 화면 좌측 상단에 현재 무드명 표시
  - 중앙에는 원형 앨범 아트 + 음악 플레이 UI
  - 우측 상단에는 '새로고침(곡 재추천)' 버튼
  - 음악 progress bar + 컨트롤(뒤로가기/재생/멈춤/앞으로)
  - 아래에는 스프레이 아이콘 (향 변경)
  - 무드 지속 시간 표시 (간트 차트 스타일 진행 바)
  - 우측 상단에 하트 아이콘 (무드셋 저장)
  - 대시보드 전체 배경색은 moodColor에 opacity 50% 반영
*/

"use client";

import { useState } from "react";
import { MoodDashboardSkeleton } from "@/components/ui/Skeleton";
import type { Mood } from "@/types/mood";
import { useMoodDashboard } from "./hooks/useMoodDashboard";
import { useMoodStream } from "@/hooks/useMoodStream";
import { useBackgroundParams } from "@/hooks/useBackgroundParams";
import MoodHeader from "./components/MoodHeader";
import ScentControl from "./components/ScentControl";
import AlbumSection from "./components/AlbumSection";
import MusicControls from "./components/MusicControls";
import MoodDuration from "./components/MoodDuration";

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
  // 무드스트림 관리
  const {
    moodStream,
    currentSegment,
    currentSegmentIndex,
    isLoading: isLoadingStream,
    refreshMoodStream,
    setCurrentSegmentIndex,
  } = useMoodStream();
  
  // 새로고침 버튼 클릭 여부 추적
  const [shouldFetchLLM, setShouldFetchLLM] = useState(false);
  
  const {
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
    handlePreferenceClick,
    preferenceCount,
    maxReached,
  } = useMoodDashboard({
    mood,
    onMoodChange,
    onScentChange,
    onSongChange,
    currentSegment,
  });

  // 새로고침 버튼 핸들러 래핑
  const handleRefreshWithStream = () => {
    setShouldFetchLLM(true); // OpenAI 호출 플래그 설정
    refreshMoodStream(); // 무드스트림 재생성
    handleRefreshClick(); // 기존 로직 실행
  };

  // LLM 배경 파라미터 가져오기 (새로고침 버튼 클릭 시에만)
  const { backgroundParams, isLoading: isLoadingParams } = useBackgroundParams(
    moodStream,
    shouldFetchLLM
  );
  
  // OpenAI 호출 완료 후 플래그 리셋
  if (shouldFetchLLM && !isLoadingParams && backgroundParams) {
    setShouldFetchLLM(false);
  }

  // 로딩 중 스켈레톤 표시
  if (isLoading || isLoadingStream) {
    return <MoodDashboardSkeleton />;
  }

  // LLM 배경 파라미터가 있으면 사용, 없으면 기본값
  // (스프레이/앨범 버튼 클릭 시에는 기존 파라미터 유지)
  const displayColor = backgroundParams?.moodColor || mood.color;
  const displayAlias = backgroundParams?.moodAlias || mood.name;
  const llmSource = backgroundParams?.source;

  // 세그먼트 선택 시: 해당 세그먼트로 바로 점프
  const handleSegmentSelect = (index: number) => {
    if (!moodStream) return;

    const clampedIndex =
      index >= 0 && index < moodStream.segments.length
        ? index
        : moodStream.segments.length - 1;
    setCurrentSegmentIndex(clampedIndex);
    const target = moodStream.segments[clampedIndex];
    if (target?.mood) {
      onMoodChange({
        ...mood,
        ...target.mood,
      });
    }
  };

  return (
    <div
      className="rounded-xl px-3 mb-1 w-full bg-white/80 backdrop-blur-sm border border-gray-200"
      style={{
        background: `${displayColor}55`, // 50% opacity (LLM 추천 색상 사용)
        paddingTop: "11px", // 상단 패딩: 16px의 1/3 감소 (16 - 16/3 = 약 11px)
        paddingBottom: "8px", // 하단 패딩: 16px의 절반 (pb-4 = 16px → 8px)
      }}
    >
      <MoodHeader
        mood={{
          ...mood,
          name: displayAlias, // LLM 추천 별명 사용
        }}
        isSaved={isSaved}
        onSaveToggle={() => setIsSaved(!isSaved)}
        onRefresh={handleRefreshWithStream} // 무드스트림 재생성 포함
        llmSource={llmSource}
        onPreferenceClick={handlePreferenceClick}
        preferenceCount={preferenceCount}
        maxReached={maxReached}
      />

      <ScentControl mood={mood} onScentClick={handleScentClick} />

      <AlbumSection mood={mood} onAlbumClick={handleAlbumClick} />

      <MusicControls
        mood={mood}
        progress={progress}
        playing={playing}
        onPlayToggle={() => setPlaying(!playing)}
        onPrevious={handlePreviousSong}
        onNext={handleNextSong}
      />

      <MoodDuration
        mood={mood}
        duration={moodDuration}
        currentIndex={currentSegmentIndex}
        totalSegments={moodStream?.segments.length || 10}
        onSegmentSelect={handleSegmentSelect}
      />
    </div>
  );
}
