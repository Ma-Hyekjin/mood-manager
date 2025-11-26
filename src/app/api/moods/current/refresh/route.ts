// src/app/api/moods/current/refresh/route.ts
/**
 * PUT /api/moods/current/refresh
 * 
 * 무드스트림 재생성 API
 * 
 * 새로고침 버튼 클릭 시 호출
 * - 시계열 + 마르코프 체인으로 새로운 30분 무드스트림 생성
 * - OpenAI 호출 필요 (30분 스트림 전체에 대한 배경 파라미터)
 */

import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
import { MOODS } from "@/types/mood";

/**
 * [MOCK] 목업 모드
 * TODO: 시계열 + 마르코프 체인으로 실제 예측 구현
 */
export async function PUT(_request: NextRequest) {
  // TODO: 세션 확인
  // const session = await getServerSession();
  // if (!session) {
  //   return NextResponse.json(
  //     { error: "UNAUTHORIZED", message: "Authentication required" },
  //     { status: 401 }
  //   );
  // }

  // TODO: 시계열 + 마르코프 체인으로 새로운 무드스트림 생성
  // const userId = session.user.id;
  // const newMoodStream = await generateNewMoodStream(userId);

  // [MOCK] 목업 데이터 - 새로운 무드스트림 생성
  const currentMood = MOODS[Math.floor(Math.random() * MOODS.length)];
  
  // 30분 스트림 생성 (음악 분절 주기: 3분)
  const moodStream = [];
  const musicSegmentDuration = 3 * 60 * 1000; // 3분
  const totalDuration = 30 * 60 * 1000; // 30분
  
  for (let i = 0; i < 10; i++) {
    // 마르코프 체인 시뮬레이션: 같은 클러스터 내에서 무드 선택
    const clusterMoods = MOODS.filter(m => {
      // 간단한 클러스터 분류 (실제로는 시계열 분석 결과 사용)
      if (m.name.includes("Calm") || m.name.includes("Focus")) return true;
      return false;
    });
    
    const selectedMood = clusterMoods[Math.floor(Math.random() * clusterMoods.length)];
    
    moodStream.push({
      timestamp: Date.now() + i * musicSegmentDuration,
      mood: selectedMood,
      music: {
        genre: "newage", // TODO: 실제 장르 매핑
        title: selectedMood.song.title,
      },
      scent: {
        type: selectedMood.scent.type,
        name: selectedMood.scent.name,
      },
      lighting: {
        color: selectedMood.color,
        rgb: hexToRgb(selectedMood.color),
      },
      duration: musicSegmentDuration,
    });
  }

  return NextResponse.json({
    currentMood: {
      id: currentMood.id,
      name: currentMood.name,
      cluster: "0", // '-', '0', '+'
      music: {
        genre: "newage",
        title: currentMood.song.title,
      },
      scent: {
        type: currentMood.scent.type,
        name: currentMood.scent.name,
      },
      lighting: {
        color: currentMood.color,
        rgb: hexToRgb(currentMood.color),
      },
    },
    moodStream,
    userDataCount: 45, // TODO: 실제 사용자 데이터 개수
    streamId: `stream-${Date.now()}`, // 새로운 스트림 ID
  });
}

/**
 * HEX 색상을 RGB로 변환
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [230, 243, 255]; // 기본값
}

