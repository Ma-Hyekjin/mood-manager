import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 무드 컬러를 흰색에 가깝게 블렌딩하는 함수
 * @param color - HEX 색상 (예: "#FFD700")
 * @param whiteRatio - 흰색 비율 (0~1, 기본값 0.9 = 90% 흰색 + 10% 무드 컬러)
 * @returns RGB 색상 문자열 (예: "rgb(255, 255, 255)")
 */
export function blendWithWhite(color: string, whiteRatio: number = 0.9): string {
  // Hex 색상을 RGB로 변환
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 흰색과 블렌딩 (기본값: 90% 흰색 + 10% 무드 컬러)
  const blendedR = Math.round(255 * whiteRatio + r * (1 - whiteRatio));
  const blendedG = Math.round(255 * whiteRatio + g * (1 - whiteRatio));
  const blendedB = Math.round(255 * whiteRatio + b * (1 - whiteRatio));

  return `rgb(${blendedR}, ${blendedG}, ${blendedB})`;
}

/**
 * HEX 색상을 RGBA 문자열로 변환하는 함수
 * @param hex - HEX 색상 (예: "#FFD700")
 * @param alpha - 알파 값 (0~1)
 * @returns RGBA 색상 문자열 (예: "rgba(255, 215, 0, 0.5)")
 */
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
