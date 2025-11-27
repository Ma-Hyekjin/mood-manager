// ======================================================
// File: src/app/(main)/mood/page.tsx
// ======================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/navigation/TopNav";
import BottomNav from "@/components/navigation/BottomNav";
import type { Mood } from "@/types/mood";

interface SavedMood {
  id: string;
  moodId: string;
  moodName: string;
  moodColor: string;
  music: {
    genre: string;
    title: string;
  };
  scent: {
    type: string;
    name: string;
  };
  preferenceCount: number;
  savedAt: number;
}

export default function MoodSetPage() {
  const router = useRouter();
  const [savedMoods, setSavedMoods] = useState<SavedMood[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 저장된 무드 목록 조회
  useEffect(() => {
    const fetchSavedMoods = async () => {
      try {
        const response = await fetch("/api/moods/saved");
        if (response.ok) {
          const data = await response.json();
          setSavedMoods(data.savedMoods || []);
        }
      } catch (error) {
        console.error("Error fetching saved moods:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSavedMoods();
  }, []);

  // 무드 삭제
  const handleDelete = async (savedMoodId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 무드를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/moods/saved/${savedMoodId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSavedMoods((prev) => prev.filter((m) => m.id !== savedMoodId));
      }
    } catch (error) {
      console.error("Error deleting saved mood:", error);
    }
  };

  // 무드 적용 (홈으로 이동)
  const handleApply = async (savedMood: SavedMood) => {
    try {
      const response = await fetch(`/api/moods/saved/${savedMood.id}/apply`, {
        method: "POST",
      });
      if (response.ok) {
        router.push("/home");
      }
    } catch (error) {
      console.error("Error applying saved mood:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <TopNav />
      
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4">
        <div className="max-w-[375px] mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">내 무드셋</h1>

        {savedMoods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <p className="text-gray-600 mb-2">저장된 무드가 없습니다</p>
            <p className="text-sm text-gray-500">
              무드 대시보드에서 별 버튼을 눌러 무드를 저장해보세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedMoods.map((savedMood) => (
              <div
                key={savedMood.id}
                className="relative rounded-xl p-4 cursor-pointer transition-transform hover:scale-105 shadow-sm"
                style={{
                  backgroundColor: `${savedMood.moodColor}40`,
                  border: `1px solid ${savedMood.moodColor}80`,
                }}
                onClick={() => handleApply(savedMood)}
              >
                {/* 삭제 버튼 */}
                <button
                  onClick={(e) => handleDelete(savedMood.id, e)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-600 hover:text-red-500 transition text-xs"
                  title="삭제"
                >
                  ×
                </button>

                {/* 무드 정보 */}
                <div className="mt-2">
                  <h3 className="text-base font-semibold text-gray-800 mb-1">
                    {savedMood.moodName}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">
                    🎵 {savedMood.music.title}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    🌸 {savedMood.scent.name}
                  </p>
                  {savedMood.preferenceCount > 0 && (
                    <div className="text-xs text-yellow-600">
                      ⭐ {savedMood.preferenceCount}/3
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}

