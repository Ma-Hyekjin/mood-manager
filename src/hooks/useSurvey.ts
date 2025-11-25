import { useState, useEffect } from "react";

/**
 * 설문 조사 관리 커스텀 훅
 * 
 * [MOCK] 목업 모드로 동작
 * TODO: 백엔드 API로 교체 필요
 */
export function useSurvey() {
  const [showSurvey, setShowSurvey] = useState(false);

  // [MOCK] 설문 조사 완료 여부 확인 (초기 로드 시 1회)
  // TODO: 백엔드 API로 교체 필요
  // API 명세:
  // GET /api/auth/survey-status
  // - 인증: NextAuth session (쿠키 기반)
  // - 응답: { hasSurvey: boolean }
  // - 설명: 설문 조사를 한 적이 있으면 true, 없으면 false
  useEffect(() => {
    // [MOCK] 목업 모드: 설문 미완료로 설정
    setShowSurvey(false);
    
    // const checkSurveyStatus = async () => {
    //   try {
    //     const response = await fetch("/api/auth/survey-status", {
    //       method: "GET",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       credentials: "include",
    //     });
    //     if (!response.ok) {
    //       // 에러 발생 시 설문 표시하지 않음
    //       return;
    //     }
    //     const data = await response.json();
    //     // hasSurvey가 false면 설문 오버레이 표시
    //     if (data.hasSurvey === false) {
    //       setShowSurvey(true);
    //     }
    //   } catch (error) {
    //     console.error("Error checking survey status:", error);
    //     // 에러 발생 시 설문 표시하지 않음
    //   }
    // };
    // checkSurveyStatus();
  }, []);

  // 설문 완료 핸들러
  const handleSurveyComplete = async () => {
    setShowSurvey(false);
    // try {
    //   const response = await fetch("/api/auth/survey", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     credentials: "include",
    //     body: JSON.stringify({
    //       preferences: {
    //         scent: "...",
    //         music: "...",
    //         brightness: 80,
    //         color: "#FFD700",
    //       },
    //     }),
    //   });
    //   if (!response.ok) throw new Error("Failed to submit survey");
    //   setShowSurvey(false);
    // } catch (error) {
    //   console.error("Error submitting survey:", error);
    // }
  };

  // 설문 건너뛰기 핸들러
  const handleSurveySkip = async () => {
    setShowSurvey(false);
    // try {
    //   const response = await fetch("/api/auth/survey-skip", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     credentials: "include",
    //   });
    //   if (!response.ok) throw new Error("Failed to skip survey");
    //   setShowSurvey(false);
    // } catch (error) {
    //   console.error("Error skipping survey:", error);
    // }
  };

  return {
    showSurvey,
    handleSurveyComplete,
    handleSurveySkip,
  };
}

