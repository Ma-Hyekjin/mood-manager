/**
 * File: src/app/(main)/home/components/MoodDashboard/MoodDashboard.tsx
 *
 * MoodDashboard Component
 *
 * 구성 요소:
 *  - Mood Title (무드 이름)
 *  - Round Album Image
 *  - Music Player UI (재생/정지/이전/다음)
 *  - Progress Bar
 *  - Scent Icon + Spray Level
 *  - Mood Color Background (50% opacity)
 *
 * Props:
 *  - moodName: string
 *  - moodColor: string
 *  - scent: { name: string; level: number; icon: string; }
 *  - nowPlaying: { title: string; albumImg: string; }
 *
 * 역할:
 *  - UI 렌더링 중심. 실제 음악 제어 기능 없음.
 */

import Image from "next/image";

interface MoodDashboardProps {
  moodName: string;
  moodColor: string;
  scent: { name: string; level: number; icon: string };
  nowPlaying: { title: string; albumImg: string };
}

export default function MoodDashboard({
  moodName,
  moodColor,
  scent,
  nowPlaying,
}: MoodDashboardProps) {
  return (
    <div
      className="w-full rounded-2xl p-6 flex flex-col items-center shadow-md"
      style={{
        backgroundColor: `${moodColor}80`, // 50% opacity
      }}
    >
      {/* 무드 이름 */}
      <h2 className="text-xl font-bold mb-4">{moodName}</h2>

      {/* 앨범 이미지 (원형) */}
      <div className="w-32 h-32 mb-4">
        <Image
          src={nowPlaying.albumImg}
          alt="album"
          width={128}
          height={128}
          className="rounded-full object-cover"
        />
      </div>

      {/* 노래 이름 */}
      <p className="text-sm font-medium mb-2">{nowPlaying.title}</p>

      {/* Progress Bar (Mock) */}
      <div className="w-full h-2 bg-gray-300 rounded-full mb-4">
        <div className="h-2 bg-black rounded-full w-1/3"></div>
      </div>

      {/* Player Controls */}
      <div className="flex space-x-6 mb-6">
        <button>⏮️</button>
        <button>⏯️</button>
        <button>⏭️</button>
      </div>

      {/* 향 아이콘 + 레벨 */}
      <div className="flex items-center space-x-3">
        <Image src={scent.icon} alt={scent.name} width={32} height={32} />

        <div className="w-32 h-2 bg-white/60 rounded-full">
          <div
            className="h-2 bg-white rounded-full"
            style={{ width: `${scent.level * 10}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
