# PC 데스크톱 동적 배경화면 아키텍처

## 제안 요약

**핵심 아이디어:**
1. 시계열 + 마르코프 체인으로 무드스트림 예측 → LLM으로 동적 배경 생성
2. 콜드스타트: 0, + 클러스터 기본값 → 사용자 데이터 쌓일수록 선호도 기반 강화
3. PC 동적 배경화면으로 확장 (기본 흰색 배경 위 오버레이)
4. PC에서 음악 재생 가능 (음악 기기 없을 경우)

---

## 🏗️ 전체 아키텍처

### 데이터 처리 파이프라인

```
[생체신호 + 음성 이벤트 + 날씨]
        ↓
[시계열 분석] → 추세 예측
        ↓
[마르코프 체인] → 전환 패턴 학습
        ↓
[30분 무드스트림 생성] → 시간대별 조화로운 세트
        ↓
[콜드스타트 체크]
- 데이터 < 10 → 기본값 (0, + 클러스터)
- 데이터 >= 10 → LLM (선호도 반영)
        ↓
[LLM 동적 배경 생성]
        ↓
[멀티 디바이스 렌더링]
- Mobile: 단순 대시보드
- PC: 동적 배경화면 + 음악 재생
- Watch: 미니 뷰
```

---

## 단계별 상세 설계

### Step 1: 시계열 + 마르코프 체인으로 무드스트림 생성

```typescript
/**
 * 시계열 + 마르코프 체인으로 30분 무드스트림 생성
 * - 합리적인 데이터 처리 근거
 */
interface MoodStream {
  timestamp: number;
  mood: Mood;
  music: Music;
  scent: Scent;
  lighting: Lighting;
  duration: number; // 음악 분절 주기 (3분)
}

class MoodStreamGenerator {
  private timeSeriesAnalyzer: SimpleTimeSeriesAnalyzer;
  private markovChain: MarkovChainModel;
  
  /**
   * 30분 무드스트림 생성
   */
  async generateMoodStream(
    currentBiometric: BiometricData,
    history: MoodHistory[],
    context: Context
  ): Promise<MoodStream[]> {
    // 1. 시계열 분석으로 추세 예측
    const trend = this.timeSeriesAnalyzer.analyzeTrend(
      history.map(h => h.biometric),
      10
    );
    
    // 2. 마르코프 체인으로 전환 패턴 학습
    this.markovChain.train(history);
    
    // 3. 시작 무드 결정
    let startMood = this.determineStartMood(currentBiometric, history, context);
    
    // 4. 추세에 따라 시작 무드 조정
    startMood = this.timeSeriesAnalyzer.adjustMoodByTrend(startMood, trend);
    
    // 5. 30분 스트림 생성 (음악 분절 주기: 3분)
    const stream: MoodStream[] = [];
    let currentMood = startMood;
    const musicSegmentDuration = 3 * 60 * 1000; // 3분
    const totalDuration = 30 * 60 * 1000; // 30분
    
    for (let time = 0; time < totalDuration; time += musicSegmentDuration) {
      // 마르코프 체인으로 다음 무드 예측
      const nextMood = this.markovChain.predictNext(currentMood);
      
      if (nextMood) {
        currentMood = nextMood;
      } else {
        // 전환 패턴이 없으면 기본 전환 규칙 사용
        currentMood = this.getDefaultTransition(currentMood, trend);
      }
      
      // 시간대별 조화로운 세트 생성
      const moodSet = this.createHarmoniousMoodSet(
        currentMood,
        time,
        context,
        history
      );
      
      stream.push({
        timestamp: Date.now() + time,
        mood: moodSet.mood,
        music: moodSet.music,
        scent: moodSet.scent,
        lighting: moodSet.lighting,
        duration: musicSegmentDuration,
      });
    }
    
    return stream;
  }
}
```

**기술적 가치:**
- ✅ 시계열 분석: 추세 예측
- ✅ 마르코프 체인: 전환 패턴 학습
- ✅ 조화로운 세트: 시간대별 일관성
- ✅ 합리적인 데이터 처리 근거

---

### Step 2: 콜드스타트 처리

```typescript
/**
 * 콜드스타트 처리
 * - 프로젝트 목적: 정서적 안정과 긍정적 독려
 * - 0, + 클러스터 무드들을 기본값으로 설정
 * - 등장 확률 균등분배
 */
function handleColdStart(
  currentCluster: EmotionCluster,
  userDataCount: number
): MoodStream[] {
  // 1. 클러스터에 맞는 기본 무드 풀 정의
  const defaultMoods = getDefaultMoodsForCluster(currentCluster);
  
  // 2. 30분 스트림 생성 (균등분배)
  const stream: MoodStream[] = [];
  const musicSegmentDuration = 3 * 60 * 1000; // 3분
  const totalDuration = 30 * 60 * 1000; // 30분
  
  for (let time = 0; time < totalDuration; time += musicSegmentDuration) {
    // 균등분배: 순환 선택
    const moodIndex = Math.floor(time / musicSegmentDuration) % defaultMoods.length;
    const baseMood = defaultMoods[moodIndex];
    
    // 기본 속성 매칭
    const moodSet = {
      mood: baseMood,
      music: getDefaultMusicForMood(baseMood),
      scent: getDefaultScentForMood(baseMood),
      lighting: getDefaultLightingForMood(baseMood),
    };
    
    stream.push({
      timestamp: Date.now() + time,
      ...moodSet,
      duration: musicSegmentDuration,
    });
  }
  
  return stream;
}

/**
 * 클러스터별 기본 무드 풀
 */
function getDefaultMoodsForCluster(
  cluster: EmotionCluster
): Mood[] {
  const positiveMoods = [
    // 0 클러스터 (안정, 평온)
    { id: "calm-1", name: "Calm Breeze", cluster: "0" },
    { id: "calm-2", name: "Calm Breeze", cluster: "0" },
    { id: "focus-1", name: "Deep Focus", cluster: "0" },
    
    // + 클러스터 (기쁨, 즐거움)
    { id: "energy-1", name: "Morning Energy", cluster: "+" },
    { id: "energy-2", name: "Morning Energy", cluster: "+" },
    { id: "relax-1", name: "Evening Relax", cluster: "+" },
  ];
  
  // 클러스터에 따라 필터링
  if (cluster === '-') {
    // 부정 클러스터 → 0 클러스터 무드 우선 (안정 추구)
    return positiveMoods.filter(m => m.cluster === '0');
  } else if (cluster === '0') {
    // 중립 클러스터 → 0, + 클러스터 혼합
    return positiveMoods;
  } else {
    // 긍정 클러스터 → + 클러스터 우선
    return positiveMoods.filter(m => m.cluster === '+');
  }
}
```

**근거:**
- ✅ 프로젝트 목적: 정서적 안정과 긍정적 독려
- ✅ 부정 클러스터(-) → 중립 클러스터(0) 무드로 안정 추구
- ✅ 중립/긍정 클러스터 → 긍정적 무드로 독려
- ✅ 등장 확률 균등분배로 다양성 확보

---

### Step 3: LLM 동적 배경 생성 (사용자 선호도 기반)

```typescript
/**
 * 백엔드 전처리 데이터 구조
 */
interface PreprocessedData {
  // 스트레스 지수
  average_stress_index: number; // 0~100 (그 날의 평균)
  recent_stress_index: number; // 0~100 (최근)
  
  // 수면 정보
  latest_sleep_score: number; // 0~100 (최근 수면 점수)
  latest_sleep_duration: number; // 분 (최근 수면 시간)
  
  // 날씨 정보
  weather: {
    temperature: number; // 기온 (°C)
    humidity: number; // 습도 (%)
    rainType: number; // 강수형태 (0: 없음, 1: 비, 2: 비/눈, 3: 눈)
    sky: number; // 하늘상태 (1: 맑음, 3: 구름 많음, 4: 흐림)
  };
  
  // 감정 이벤트 (raw_events 전처리 결과)
  emotionEvents?: {
    laughter: number[]; // 웃음 타임스탬프 배열
    sigh: number[]; // 한숨 타임스탬프 배열
    anger: number[]; // 분노 타임스탬프 배열
    sadness: number[]; // 슬픔 타임스탬프 배열
    neutral: number[]; // 평온 타임스탬프 배열 (기본값, 콜드스타트)
  };
}

/**
 * LLM 동적 배경 생성
 * - 사용자 데이터 쌓일수록 선호도 기반 강화
 */
interface BackgroundParamsRequest {
  // 필수 입력
  moodName: string; // "DEEP Relax"
  musicGenre: string; // "newage"
  scentType: string; // "citrus"
  
  // 전처리된 데이터 (백엔드에서 제공)
  preprocessed: PreprocessedData;
  
  // 사용자 선호도
  userPreferences: {
    music: Record<string, '+' | '-'>; // { "rnb-soul": "-", "electronic-dance": "-", "else": "+" }
    color: Record<string, '+' | '-'>; // { "black": "-", "green": "-", "else": "+" }
    scent: Record<string, '+' | '-'>; // { "spicy": "-", "green": "-", "honey": "-", "else": "+" }
  };
  
  // 추가 입력 (개선)
  timeOfDay?: number; // 0-23 (시간대)
  currentCluster?: EmotionCluster; // '-', '0', '+'
  userDataCount?: number; // 사용자 데이터 개수 (선호도 가중치 계산용)
  previousMood?: string; // 이전 무드 (전환 자연스러움)
  season?: string; // 계절 (날씨에서 추론 가능하지만 명시적으로 전달)
}

interface BackgroundParamsResponse {
  // 필수 출력
  moodAlias: string; // "겨울비의 평온"
  musicSelection: string; // "Ambient Rain Meditation"
  moodColor: string; // "#6B8E9F" (HEX)
  lighting: {
    rgb: [number, number, number]; // [107, 142, 159]
    brightness: number; // 0-100
    temperature?: number; // 색온도 (선택적)
  };
  backgroundIcon: {
    name: string; // React Icons 이름 (예: "FaCloudRain")
    category: string; // "weather" | "nature" | "abstract"
  };
  backgroundWind: {
    direction: number; // 0-360 (도)
    speed: number; // 0-10 (속도)
  };
  animationSpeed: number; // 0-10 (애니메이션 속도)
  iconOpacity: number; // 0-1 (투명도)
  
  // 추가 출력 (개선)
  iconCount?: number; // 동시에 표시할 아이콘 개수 (기본: 5-10)
  iconSize?: number; // 아이콘 크기 0-100 (기본: 50)
  particleEffect?: boolean; // 파티클 효과 사용 여부
  gradientColors?: string[]; // 그라데이션 색상 (선택적, 2-3개)
  transitionDuration?: number; // 전환 애니메이션 시간 (ms)
}
```

**콜드스타트 처리:**
```typescript
class LLMBackgroundGenerator {
  /**
   * 동적 배경 파라미터 생성
   */
  async generateBackgroundParams(
    request: BackgroundParamsRequest
  ): Promise<BackgroundParamsResponse> {
    const { userDataCount = 0 } = request;
    
    // 사용자 데이터가 적으면 기본값 사용
    if (userDataCount < 10) {
      return this.generateDefaultParams(request);
    }
    
    // 사용자 데이터가 많을수록 선호도 기반 강화
    const preferenceWeight = Math.min(1.0, userDataCount / 100); // 0-1
    
    // LLM 프롬프트 생성 (선호도 가중치 반영)
    const prompt = this.generatePromptWithPreferences(
      request,
      preferenceWeight
    );
    
    // OpenAI API 호출
    const response = await this.callOpenAI(prompt);
    
    return response;
  }
  
  /**
   * 날씨 코드로 아이콘 선택
   */
  private getDefaultIconForWeather(weather: PreprocessedData['weather']): string {
    // 강수형태 우선
    if (weather.rainType === 1) return 'FaCloudRain'; // 비
    if (weather.rainType === 2) return 'FaCloudRain'; // 비/눈
    if (weather.rainType === 3) return 'FaSnowflake'; // 눈
    
    // 하늘상태
    if (weather.sky === 1) return 'FaSun'; // 맑음
    if (weather.sky === 3) return 'FaCloud'; // 구름 많음
    if (weather.sky === 4) return 'FaCloud'; // 흐림
    
    return 'FaLeaf'; // 기본값
  }
  
  /**
   * 날씨 정보를 문자열로 변환
   */
  private getWeatherString(weather: PreprocessedData['weather']): string {
    const rainTypes = ['없음', '비', '비/눈', '눈'];
    const skyTypes = ['', '맑음', '', '구름 많음', '흐림'];
    
    if (weather.rainType > 0) {
      return rainTypes[weather.rainType];
    }
    return skyTypes[weather.sky] || '맑음';
  }
  
  /**
   * 기본 파라미터 생성 (콜드스타트)
   */
  private generateDefaultParams(
    request: BackgroundParamsRequest
  ): BackgroundParamsResponse {
    const { preprocessed, moodName, musicGenre } = request;
    
    // 무드와 날씨에 맞는 기본값
    const defaultIcon = this.getDefaultIconForWeather(preprocessed.weather);
    const defaultColor = this.getDefaultColorForMood(moodName, preprocessed);
    const weatherString = this.getWeatherString(preprocessed.weather);
    
    // 스트레스 지수에 따라 밝기 조정
    const brightness = Math.max(30, Math.min(70, 50 + (50 - preprocessed.recent_stress_index) * 0.3));
    
    return {
      moodAlias: this.generateDefaultAlias(moodName, weatherString),
      musicSelection: `${musicGenre} Ambient`,
      moodColor: defaultColor,
      lighting: {
        rgb: this.hexToRgb(defaultColor),
        brightness: Math.round(brightness),
        temperature: 4000,
      },
      backgroundIcon: {
        name: defaultIcon,
        category: "weather",
      },
      backgroundWind: {
        direction: 180,
        speed: 3,
      },
      animationSpeed: 4,
      iconOpacity: 0.7,
      iconCount: 8,
      iconSize: 50,
      particleEffect: false,
    };
  }
  
  /**
   * 날씨 정보를 문자열로 변환
   */
  private formatWeather(weather: PreprocessedData['weather']): string {
    const rainTypes = ['없음', '비', '비/눈', '눈'];
    const skyTypes = ['', '맑음', '', '구름 많음', '흐림'];
    
    return `${weather.temperature}°C, 습도 ${weather.humidity}%, ${rainTypes[weather.rainType]}, ${skyTypes[weather.sky]}`;
  }
  
  /**
   * 계절 추론 (날짜 기반)
   */
  private inferSeason(month: number): string {
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Autumn';
    return 'Winter';
  }
  
  /**
   * 감정 이벤트 요약
   */
  private formatEmotionEvents(emotionEvents?: PreprocessedData['emotionEvents']): string {
    if (!emotionEvents) {
      return '감정 이벤트 없음 (평온 상태)';
    }
    
    const counts = {
      웃음: emotionEvents.laughter?.length || 0,
      한숨: emotionEvents.sigh?.length || 0,
      분노: emotionEvents.anger?.length || 0,
      슬픔: emotionEvents.sadness?.length || 0,
      평온: emotionEvents.neutral?.length || 0,
    };
    
    const dominant = Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([emotion, count]) => `${emotion}(${count}회)`)
      .join(', ');
    
    return dominant || '평온 상태';
  }
  
  /**
   * 선호도 기반 프롬프트 생성
   */
  private generatePromptWithPreferences(
    request: BackgroundParamsRequest,
    preferenceWeight: number
  ): string {
    const { preprocessed, moodName, musicGenre, scentType, timeOfDay, season } = request;
    const currentMonth = new Date().getMonth() + 1;
    const inferredSeason = season || this.inferSeason(currentMonth);
    
    let prompt = `당신은 감성적인 무드 배경을 설계하는 전문가입니다.

[무드 정보]
- 무드: ${moodName}
- 음악 장르: ${musicGenre}
- 향: ${scentType}
- 시간대: ${timeOfDay || new Date().getHours()}시
- 계절: ${inferredSeason}

[전처리된 생체 데이터]
- 평균 스트레스 지수: ${preprocessed.average_stress_index}/100
- 최근 스트레스 지수: ${preprocessed.recent_stress_index}/100
- 최근 수면 점수: ${preprocessed.latest_sleep_score}/100
- 최근 수면 시간: ${preprocessed.latest_sleep_duration}분

[날씨 정보]
- ${this.formatWeather(preprocessed.weather)}

[감정 이벤트]
- ${this.formatEmotionEvents(preprocessed.emotionEvents)}
`;
    
    // 사용자 데이터가 많을수록 선호도 강조
    if (preferenceWeight > 0.5) {
      prompt += `
[사용자 선호도] (중요도: ${Math.round(preferenceWeight * 100)}%)
- 음악: ${this.formatPreferences(request.userPreferences.music)}
- 색상: ${this.formatPreferences(request.userPreferences.color)}
- 향: ${this.formatPreferences(request.userPreferences.scent)}

사용자 선호도를 반드시 고려하여 배경을 설계하세요.
`;
    } else {
      prompt += `
[사용자 선호도] (참고용)
- 음악: ${this.formatPreferences(request.userPreferences.music)}
- 색상: ${this.formatPreferences(request.userPreferences.color)}
- 향: ${this.formatPreferences(request.userPreferences.scent)}
`;
    }
    
    prompt += `
[요구사항]
1. 무드별명: 무드의 특성을 잘 나타내는 한국어 별명 (2-4단어)
2. 음악 선곡: 장르에 맞는 구체적인 곡명 또는 스타일
3. 무드 컬러: HEX 코드 (사용자 비선호 색상 피하기)
4. 조명: RGB 값과 밝기 (0-100)
5. 배경 아이콘: React Icons 이름 (날씨/계절에 맞게)
6. 배경 풍향: 0-360도
7. 배경 풍속: 0-10 (무드에 맞게)
8. 애니메이션 속도: 0-10
9. 아이콘 투명도: 0-1
10. 아이콘 개수: 5-10 (선택적)
11. 아이콘 크기: 0-100 (선택적)
12. 파티클 효과: true/false (선택적)
13. 그라데이션 색상: 2-3개 HEX 코드 (선택적)

다음 JSON 형식으로 응답하세요:
{
  "moodAlias": "...",
  "musicSelection": "...",
  "moodColor": "#...",
  "lighting": { "rgb": [...], "brightness": ..., "temperature": ... },
  "backgroundIcon": { "name": "...", "category": "..." },
  "backgroundWind": { "direction": ..., "speed": ... },
  "animationSpeed": ...,
  "iconOpacity": ...,
  "iconCount": ...,
  "iconSize": ...,
  "particleEffect": ...,
  "gradientColors": [...]
}`;
    
    return prompt;
  }
}
```

---

### Step 4: PC 데스크톱 앱 구조

```typescript
/**
 * PC 데스크톱 앱 (Electron 기반)
 */
// main.js (Electron 메인 프로세스)
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true, // 전체화면
    frame: false, // 프레임 없음
    transparent: true, // 투명 배경
    alwaysOnTop: false, // 항상 위 (선택적)
    skipTaskbar: true, // 작업 표시줄 숨김
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  
  // 기본 흰색 배경 위에 오버레이
  win.setBackgroundColor('#FFFFFF');
  
  // Next.js 앱 로드 (로컬 또는 원격)
  win.loadURL('http://localhost:3000/desktop-background');
  
  // 마우스 이벤트 처리 (선택적)
  win.setIgnoreMouseEvents(true, { forward: true });
}

app.whenReady().then(createWindow);
```

```typescript
/**
 * PC 배경화면 컴포넌트
 */
// src/app/desktop-background/page.tsx
"use client";

import { useEffect, useState } from "react";
import DynamicBackground from "@/components/background/DynamicBackground";
import MusicPlayer from "@/components/desktop/MusicPlayer";

export default function DesktopBackgroundPage() {
  const [moodStream, setMoodStream] = useState<MoodStream[]>([]);
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);
  const [backgroundParams, setBackgroundParams] = useState<BackgroundParamsResponse | null>(null);
  const [userDataCount, setUserDataCount] = useState(0);
  
  useEffect(() => {
    // 무드스트림 가져오기
    async function fetchMoodStream() {
      const response = await fetch("/api/moods/current");
      const data = await response.json();
      setMoodStream(data.moodStream);
      setCurrentMood(data.currentMood);
      setUserDataCount(data.userDataCount || 0);
    }
    
    fetchMoodStream();
    
    // 주기적 업데이트 (1분마다)
    const interval = setInterval(fetchMoodStream, 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // 배경 파라미터 가져오기
    async function fetchBackgroundParams() {
      if (!currentMood) return;
      
      // 전처리된 데이터 가져오기
      const preprocessedResponse = await fetch("/api/preprocessing");
      let preprocessed: PreprocessedData | null = null;
      
      if (preprocessedResponse.status === 200) {
        preprocessed = await preprocessedResponse.json();
      } else if (preprocessedResponse.status === 204) {
        // 데이터 없음 → 기본값 사용
        preprocessed = {
          average_stress_index: 50,
          recent_stress_index: 50,
          latest_sleep_score: 70,
          latest_sleep_duration: 480,
          weather: {
            temperature: 20,
            humidity: 50,
            rainType: 0,
            sky: 1,
          },
          emotionEvents: {
            laughter: [],
            sigh: [],
            anger: [],
            sadness: [],
            neutral: [Date.now()], // 기본값: 평온
          },
        };
      }
      
      if (!preprocessed) return;
      
      const response = await fetch("/api/ai/background-params", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodName: currentMood.name,
          musicGenre: currentMood.music.genre,
          scentType: currentMood.scent.type,
          preprocessed: preprocessed,
          userPreferences: getUserPreferences(),
          timeOfDay: new Date().getHours(),
          currentCluster: currentMood.cluster,
          userDataCount: userDataCount,
          previousMood: getPreviousMood(),
          season: getSeason(),
        }),
      });
      
      const data = await response.json();
      setBackgroundParams(data);
    }
    
    fetchBackgroundParams();
  }, [currentMood, userDataCount]);
  
  return (
    <div className="fixed inset-0 w-screen h-screen">
      {/* 동적 배경 */}
      {backgroundParams && (
        <DynamicBackground params={backgroundParams} />
      )}
      
      {/* 음악 플레이어 (선택적, 마우스 호버 시 표시) */}
      <MusicPlayer
        mood={currentMood}
        musicUrl={backgroundParams?.musicSelection}
        autoPlay={true}
      />
      
      {/* 컨트롤 패널 (선택적) */}
      <ControlPanel mood={currentMood} />
    </div>
  );
}
```

---

## 📋 백엔드 API 명세

### GET /api/preprocessing

**요청:**
- 인증: NextAuth 세션 필요
- 쿼리 파라미터: 없음 (오늘 날짜 자동)

**응답 (200 OK):**
```json
{
  "average_stress_index": 45,
  "recent_stress_index": 39,
  "latest_sleep_score": 79,
  "latest_sleep_duration": 600,
  "weather": {
    "temperature": 9.6,
    "humidity": 26,
    "rainType": 0,
    "sky": 1
  },
  "emotionEvents": {
    "laughter": [1234567890, 1234567900],
    "sigh": [1234568000],
    "anger": [],
    "sadness": [],
    "neutral": [1234567000, 1234567100]
  }
}
```

**응답 (204 No Content):**
- 오늘 날짜의 데이터가 없는 경우
- 프론트엔드에서 기본값 사용

**요구사항:**
- ✅ `emotionEvents`는 항상 포함 (NULL 아님)
- ✅ 감정 이벤트가 없으면 `neutral: [현재 타임스탬프]` 기본값

---

### GET /api/moods/current

**요청:**
- 인증: NextAuth 세션 필요
- 쿼리 파라미터: 없음

**응답 (200 OK):**
```json
{
  "currentMood": {
    "id": "calm-1",
    "name": "DEEP Relax",
    "cluster": "0",
    "music": {
      "genre": "newage",
      "title": "Calm Breeze"
    },
    "scent": {
      "type": "citrus",
      "name": "Orange"
    },
    "lighting": {
      "color": "#E6F3FF",
      "rgb": [230, 243, 255]
    }
  },
  "moodStream": [...],
  "userDataCount": 45
}
```

**요구사항:**
- ✅ 시계열 + 마르코프 체인으로 생성된 무드스트림
- ✅ `currentMood`는 현재 적용 중인 무드
- ✅ `userDataCount`는 사용자 데이터 개수 (선호도 가중치 계산용)

### Output (BackgroundParamsResponse)

```typescript
interface BackgroundParamsResponse {
  // 필수
  moodAlias: string; // "Calm Winter Rain" (영어 별명)
  musicSelection: string; // "Ambient Rain Meditation" (영어 트랙명)
  moodColor: string; // "#6B8E9F"
  lighting: {
    rgb: [number, number, number];
    brightness: number; // 0-100
    temperature?: number;
  };
  backgroundIcon: {
    name: string; // "FaCloudRain"
    category: string; // "weather"
  };
  backgroundWind: {
    direction: number; // 0-360
    speed: number; // 0-10
  };
  animationSpeed: number; // 0-10
  iconOpacity: number; // 0-1
  
  // 선택적 (개선)
  iconCount?: number; // 5-10
  iconSize?: number; // 0-100
  particleEffect?: boolean;
  gradientColors?: string[]; // 2-3개 HEX
  transitionDuration?: number; // ms
  source?: string; // "openai" | "cache" | "mock-no-key"
}
```

---

## 통합 파이프라인

```
[생체신호 수집]
        ↓
[시계열 분석] → 추세 예측
        ↓
[마르코프 체인] → 전환 패턴 학습
        ↓
[30분 무드스트림 생성] → 조화로운 세트
        ↓
┌─────────────────────────────────────┐
│  [콜드스타트 체크]                  │
│  userDataCount < 10                 │
│  → 기본값 (0, + 클러스터)           │
│  userDataCount >= 10                │
│  → LLM (선호도 반영)                │
└─────────────────────────────────────┘
        ↓
[LLM 동적 배경 생성]
        ↓
[멀티 디바이스 렌더링]
- Mobile: 단순 대시보드
- PC: 동적 배경화면 + 음악 재생
- Watch: 미니 뷰
```

---

## 핵심 개선사항

### 1. Input 개선
- ✅ `timeOfDay` 추가 (시간대 고려)
- ✅ `currentCluster` 추가 (클러스터 정보)
- ✅ `userDataCount` 추가 (선호도 가중치 계산)
- ✅ `previousMood` 추가 (전환 자연스러움)
- ✅ `currentBiometric` 추가 (생체신호, 선택적)

### 2. Output 개선
- ✅ `iconCount` 추가 (동시 표시 아이콘 개수)
- ✅ `iconSize` 추가 (아이콘 크기)
- ✅ `particleEffect` 추가 (파티클 효과)
- ✅ `gradientColors` 추가 (그라데이션)
- ✅ `transitionDuration` 추가 (전환 애니메이션)

### 3. 콜드스타트 처리
- ✅ `userDataCount < 10`: 기본값 사용
- ✅ `userDataCount >= 10`: LLM 사용 (선호도 반영)
- ✅ 선호도 가중치: `Math.min(1.0, userDataCount / 100)`

### 4. PC 배경화면 확장
- ✅ Electron 기반 데스크톱 앱
- ✅ 기본 흰색 배경 위 오버레이
- ✅ 음악 재생 기능
- ✅ 전체화면 모드

---

## 기술적 가치

1. **데이터 처리 근거 강화**
   - 시계열 분석: 추세 예측
   - 마르코프 체인: 전환 패턴 학습
   - 조화로운 세트: 시간대별 일관성

2. **사용자 선호도 점진적 반영**
   - 콜드스타트: 기본값 사용
   - 데이터 쌓일수록: 선호도 강화

3. **멀티 디바이스 통합**
   - Mobile: 단순 대시보드
   - PC: 동적 배경화면 + 음악
   - Watch: 미니 뷰

위 내용은 PC 데스크톱 동적 배경 확장을 위한 참고용 설계 요약이다.
