// ======================================================
// File: src/app/(main)/home/components/MoodDashboard/components/ScentControl.tsx
// ======================================================

import { TbSpray } from "react-icons/tb";
import type { Mood } from "@/types/mood";
import { getScentIconColor } from "../utils/moodUtils";

interface ScentControlProps {
  mood: Mood;
  onScentClick: () => void;
}

export default function ScentControl({ mood, onScentClick }: ScentControlProps) {
  return (
    <div className="flex items-center justify-end gap-1.5 mb-2">
      <span className="text-sm text-gray-700">{mood.scent.name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onScentClick();
        }}
        className="w-7 h-7 rounded-full shadow flex items-center justify-center hover:scale-105 transition cursor-pointer"
        style={{ backgroundColor: mood.scent.color }}
        title="Change scent"
      >
        <TbSpray
          size={16}
          style={{ color: getScentIconColor(mood.scent.type, mood.scent.color) }}
        />
      </button>
    </div>
  );
}

