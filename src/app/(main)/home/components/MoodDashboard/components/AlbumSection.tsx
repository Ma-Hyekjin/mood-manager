// ======================================================
// File: src/app/(main)/home/components/MoodDashboard/components/AlbumSection.tsx
// ======================================================

import type { Mood } from "@/types/mood";

interface AlbumSectionProps {
  mood: Mood;
  onAlbumClick: () => void;
}

export default function AlbumSection({ mood, onAlbumClick }: AlbumSectionProps) {
  return (
    <>
      {/* 앨범 이미지 */}
      <div className="flex justify-center mb-2">
        <button
          onClick={onAlbumClick}
          className="w-20 h-20 rounded-full bg-white shadow-md border flex items-center justify-center text-xs font-medium hover:scale-105 transition cursor-pointer"
        >
          Album Art
        </button>
      </div>

      {/* 노래 제목 (음악) */}
      <p className="text-center text-xs font-medium mb-1.5 text-gray-800">
        {mood.song.title}
      </p>
    </>
  );
}

