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

import { useState } from "react";
import { RefreshCcw, Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface MoodDashboardProps {
  moodName?: string;
  moodColor?: string; // ex: "#FFCC88"
}

const sampleSongs = [
  { title: "Calm Breeze", duration: 182 },
  { title: "Deep Focus", duration: 210 },
  { title: "Soft Morning", duration: 195 },
];

export default function MoodDashboard({
  moodName = "Calm Breeze",
  moodColor = "#FFD966",
}: MoodDashboardProps) {
  const [song, setSong] = useState(sampleSongs[0]);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(20);
  const [scentLevel, setScentLevel] = useState(5);

  const nextRandomSong = () => {
    const next = sampleSongs[Math.floor(Math.random() * sampleSongs.length)];
    setSong(next);
    setProgress(0);
  };

  return (
    <div
      className="rounded-xl p-4 mb-4 w-full"
      style={{
        background: `${moodColor}55`, // 50% opacity
      }}
    >
      {/* 무드명 */}
      <div className="text-lg font-semibold mb-3">{moodName}</div>

      {/* 새로고침 버튼 */}
      <div className="flex justify-end mb-2">
        <button
          onClick={nextRandomSong}
          className="p-2 rounded-full bg-white/40 backdrop-blur hover:bg-white/60 transition"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      {/* 앨범 이미지 */}
      <div className="flex justify-center mb-3">
        <div className="w-28 h-28 rounded-full bg-white shadow-md border flex items-center justify-center text-sm font-medium">
          Album Art
        </div>
      </div>

      {/* 노래 제목 */}
      <p className="text-center text-sm font-medium mb-2">{song.title}</p>

      {/* Progress Bar */}
      <div className="w-full flex items-center mb-3">
        <span className="text-xs mr-2">{Math.floor(progress)}s</span>
        <div className="flex-1 h-1 bg-white/50 rounded">
          <div
            className="h-1 bg-black rounded"
            style={{ width: `${(progress / song.duration) * 100}%` }}
          />
        </div>
        <span className="text-xs ml-2">{song.duration}s</span>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex justify-center gap-6 mb-4">
        <button className="p-2">
          <SkipBack size={22} />
        </button>

        <button
          className="p-3 bg-white rounded-full shadow"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button className="p-2">
          <SkipForward size={22} />
        </button>
      </div>

      {/* 향기 컨트롤 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm">Scent</span>
          <span className="text-sm">{scentLevel}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* 향 아이콘 (placeholder) */}
          <div className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-xs">
            🌿
          </div>

          {/* 향 분사량 슬라이더 */}
          <input
            type="range"
            min={1}
            max={10}
            value={scentLevel}
            onChange={(e) => setScentLevel(Number(e.target.value))}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
