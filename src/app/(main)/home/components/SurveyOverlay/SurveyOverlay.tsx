/**
 * File: src/app/(main)/home/components/SurveyOverlay/SurveyOverlay.tsx
 *
 * SurveyOverlay Component
 *
 * 역할:
 *  - 홈 화면 전체를 덮는 반투명 오버레이 (opacity 0.4)
 *  - 설문 시작 / Skip 버튼 제공
 *  - hasSurvey = false일 때만 표시
 *  - 선호하는 향, 음악 장르, 밝기, 조명 색감 등을 선택
 *
 * Props:
 *  - onComplete(): 설문 완료 시 호출
 *  - onSkip(): 설문 건너뛰기 시 호출
 */

"use client";

interface SurveyOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function SurveyOverlay({ onComplete, onSkip }: SurveyOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 반투명 배경 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 설문 모달 */}
      <div className="relative bg-white rounded-lg p-6 w-[90%] max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">Welcome to Mood Manager</h2>
        <p className="text-gray-600 mb-6">
          Let&apos;s set up your preferences to personalize your mood experience.
        </p>

        {/* TODO: 설문 폼 구현 */}
        {/* - 선호하는 향 선택 */}
        {/* - 음악 장르 선택 */}
        {/* - 밝기 슬라이더 */}
        {/* - 조명 색감 선택 */}

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Skip
          </button>
          <button
            onClick={onComplete}
            className="flex-1 py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Start Survey
          </button>
        </div>
      </div>
    </div>
  );
}
