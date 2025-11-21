/**
 * File: src/components/navigation/BottomNav.tsx
 *
 * Bottom Navigation Bar
 * - Home / MoodSet / MyPage 이동
 * - 현재 페이지는 강조
 */

"use client";

import { usePathname, useRouter } from "next/navigation";
import { FiHome, FiUser, FiGrid } from "react-icons/fi";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Home", path: "/home", icon: FiHome },
    { label: "MoodSet", path: "/moodset", icon: FiGrid },
    { label: "MyPage", path: "/mypage", icon: FiUser },
  ];

  return (
    <div className="w-full h-16 bg-white shadow-inner fixed bottom-0 left-0 z-40 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className="flex flex-col items-center justify-center"
          >
            <Icon
              size={22}
              className={isActive ? "text-black" : "text-gray-400"}
            />
            <span
              className={`text-xs mt-1 ${
                isActive ? "text-black font-medium" : "text-gray-400"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
