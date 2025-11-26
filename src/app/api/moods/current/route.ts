// src/app/api/moods/current/route.ts
/**
 * GET /api/moods/current
 * 
 * 시계열 + 마르코프 체인으로 생성된 무드스트림 조회
 * 
 * [응답 구조]
 * - currentMood: 현재 적용 중인 무드
 * - moodStream: 30분 무드스트림 (시계열 + 마르코프 체인 예측)
 * - userDataCount: 사용자 데이터 개수 (선호도 가중치 계산용)
 */

import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
import { MOODS } from "@/types/mood";

/**
 * [MOCK] 목업 모드
 * TODO: 시계열 + 마르코프 체인으로 실제 예측 구현
 */
export async function GET(_request: NextRequest) {
  // TODO: 세션 확인
  // const session = await getServerSession();
  // if (!session) {
  //   return NextResponse.json(
  //     { error: "UNAUTHORIZED", message: "Authentication required" },
  //     { status: 401 }
  //   );
  // }

  // TODO: 시계열 + 마르코프 체인으로 무드스트림 생성
  // const userId = session.user.id;
  // const moodStream = await generateMoodStream(userId);

  // [MOCK] 목업 데이터
  // TODO: 실제로는 백엔드에서 1분 단위 예측값(VP, VPP, VPPP 등)을 받아옴
  
  // 1분 단위 예측값 시뮬레이션 (30개, 30분치)
  const oneMinutePredictions: Array<{ timestamp: number; prediction: string }> = [];
  const oneMinuteDuration = 60 * 1000; // 1분
  
  for (let i = 0; i < 30; i++) {
    // VP, VPP, VPPP 시뮬레이션
    const predictions = ["VP", "VPP", "VPPP"];
    const prediction = predictions[Math.floor(Math.random() * predictions.length)];
    
    oneMinutePredictions.push({
      timestamp: Date.now() + i * oneMinuteDuration,
      prediction,
    });
  }
  
  // 3분 단위로 분절 (VP^3n 단위)
  const moodStream = [];
  const segmentDuration = 3 * 60 * 1000; // 3분
  
  for (let i = 0; i < oneMinutePredictions.length; i += 3) {
    const threeMinutePredictions = oneMinutePredictions.slice(i, i + 3);
    
    // 3분 동안의 예측값 중 가장 많이 나온 것 선택
    const predictionCounts = threeMinutePredictions.reduce((acc, p) => {
      acc[p.prediction] = (acc[p.prediction] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantPrediction = Object.entries(predictionCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    // 예측값을 무드/장르/향으로 매핑 (TODO: 실제 매핑 로직)
    const moodName = mapPredictionToMood(dominantPrediction);
    const musicGenre = mapPredictionToGenre(dominantPrediction);
    const scentType = mapPredictionToScent(dominantPrediction);
    
    // 기본 무드 선택 (같은 이름의 무드 중 하나)
    const baseMood = MOODS.find(m => m.name === moodName) || MOODS[0];
    
    moodStream.push({
      timestamp: threeMinutePredictions[0].timestamp,
      duration: segmentDuration,
      moodName,
      musicGenre,
      scentType,
      // 기본 정보 (LLM이 나머지 정보 추가)
      mood: baseMood,
      music: {
        genre: musicGenre,
        title: baseMood.song.title, // 임시, LLM이 실제 선곡 생성
      },
      scent: {
        type: scentType,
        name: baseMood.scent.name, // 임시
      },
      lighting: {
        color: baseMood.color, // 임시, LLM이 실제 컬러 생성
        rgb: hexToRgb(baseMood.color),
      },
    });
  }
  
  // 현재 무드는 첫 번째 세그먼트
  const currentSegment = moodStream[0];

  return NextResponse.json({
    currentMood: {
      id: currentSegment.mood.id,
      name: currentSegment.moodName,
      cluster: "0", // '-', '0', '+'
      music: {
        genre: currentSegment.musicGenre,
        title: currentSegment.music.title,
      },
      scent: {
        type: currentSegment.scentType,
        name: currentSegment.scent.name,
      },
      lighting: {
        color: currentSegment.lighting.color,
        rgb: currentSegment.lighting.rgb,
      },
    },
    moodStream,
    userDataCount: 45, // TODO: 실제 사용자 데이터 개수
  });
}

/**
 * 예측값을 무드로 매핑
 */
function mapPredictionToMood(prediction: string): string {
  // TODO: 실제 매핑 로직
  const moodMap: Record<string, string> = {
    "VP": "Deep Relax",
    "VPP": "Focus Mode",
    "VPPP": "Bright Morning",
  };
  return moodMap[prediction] || "Deep Relax";
}

/**
 * 예측값을 음악 장르로 매핑
 */
function mapPredictionToGenre(prediction: string): string {
  // TODO: 실제 매핑 로직
  const genreMap: Record<string, string> = {
    "VP": "newage",
    "VPP": "classical",
    "VPPP": "pop",
  };
  return genreMap[prediction] || "newage";
}

/**
 * 예측값을 향으로 매핑
 */
function mapPredictionToScent(prediction: string): string {
  // TODO: 실제 매핑 로직
  const scentMap: Record<string, string> = {
    "VP": "citrus",
    "VPP": "woody",
    "VPPP": "floral",
  };
  return scentMap[prediction] || "citrus";
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

/**
 * PUT /api/moods/current
 * 
 * 무드 전체 변경 API
 */
export async function PUT(request: NextRequest) {
  // [MOCK] 목업 모드
  const body = await request.json();
  const moodId = body.moodId || "calm-1";
  
  const selectedMood = MOODS.find(m => m.id === moodId) || MOODS[0];
  
  return NextResponse.json({
    mood: {
      id: selectedMood.id,
      name: selectedMood.name,
      color: selectedMood.color,
      song: { title: selectedMood.song.title, duration: selectedMood.song.duration },
      scent: selectedMood.scent,
    },
    updatedDevices: [],
  });
}
