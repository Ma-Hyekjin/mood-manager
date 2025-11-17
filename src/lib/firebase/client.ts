// src/lib/firebase/client.ts
/**
 * [파일 역할]
 * - Next.js 클라이언트 환경(브라우저) 또는 Route Handler에서
 *   Firebase Client SDK를 초기화하는 파일입니다.
 *
 * [사용되는 위치]
 * - Firestore 실시간 구독(onSnapshot) 사용 시
 *   backend/listener/periodicListener.ts 에서 import
 *
 * [주의사항]
 * - Firebase Client SDK는 브라우저 전용 API를 포함하므로
 *   반드시 서버에서 쓰지 않아야 하는 경우 주의 필요
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 환경 변수 검증
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// 환경 변수 기반 Firebase 설정
const firebaseConfig = {
  apiKey: getRequiredEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getRequiredEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getRequiredEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: getRequiredEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// firebase 앱 중복 실행 방지
export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// 클라이언트 Firestore 인스턴스
// 참고: gRPC 연결 문제는 주로 네트워크 환경이나 서버리스 환경에서 발생합니다.
// 리스너에서 자동 재연결 로직으로 처리합니다.
export const db = getFirestore(app);
