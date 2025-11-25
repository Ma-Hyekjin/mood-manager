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

import { MoodDashboardSkeleton } from "@/components/ui/Skeleton";
import type { Mood } from "@/types/mood";
import { useMoodDashboard } from "./hooks/useMoodDashboard";
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
  } = useMoodDashboard({
    mood,
    onMoodChange,
    onScentChange,
    onSongChange,
  });

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
      <MoodHeader
        mood={mood}
        isSaved={isSaved}
        onSaveToggle={() => setIsSaved(!isSaved)}
        onRefresh={handleRefreshClick}
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

      <MoodDuration mood={mood} duration={moodDuration} />
    </div>
  );
}
