"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { SiKakao, SiNaver } from "react-icons/si";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // 로그인된 상태에서는 login 페이지 접근 금지 → 즉시 home으로 이동
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/home"); // 뒤로가기 방지
    }
  }, [status, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState<Date | null>(null);

  // Rate limiting 체크
  useEffect(() => {
    if (lockUntil) {
      const now = new Date();
      if (now >= lockUntil) {
        setIsLocked(false);
        setLockUntil(null);
        setLoginAttempts(0);
      } else {
        setIsLocked(true);
      }
    }
  }, [lockUntil]);

  const handleLogin = async () => {
    setErrorMsg("");

    // Rate limiting 체크
    if (isLocked && lockUntil) {
      const minutesLeft = Math.ceil((lockUntil.getTime() - new Date().getTime()) / 60000);
      const message = `Too many login attempts. Please try again in ${minutesLeft} minute(s).`;
      setErrorMsg(message);
      toast.error(message);
      return;
    }

    if (!email || !password) {
      const message = "Please enter your email and password.";
      setErrorMsg(message);
      toast.error(message);
      return;
    }

    setIsLoading(true);

    try {
      // [MOCK] 이메일/비밀번호 로그인 (NextAuth Credentials Provider 사용)
      // TODO: 백엔드 API로 교체 필요
      // API 명세:
      // NextAuth Credentials Provider가 자동으로 인증 처리
      // - authorize 함수에서 백엔드 API를 호출하여 인증
      // - 성공 시 세션 생성, 실패 시 null 반환
      const MOCK_EMAIL = "test@example.com";
      const MOCK_PASSWORD = "1234";

      if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          const message = "Invalid email or password.";
          setErrorMsg(message);
          toast.error(message);
          return;
        }

        // [MOCK] 설문을 하지 않은 상태라고 가정
        setLoginAttempts(0); // 성공 시 시도 횟수 리셋
        setIsLoading(false);
        toast.success("Login successful!");
        router.push("/home");
        return;
      }

      // Rate limiting: 실패 시 시도 횟수 증가
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      // 5회 실패 시 15분 잠금
      if (newAttempts >= 5) {
        const lockTime = new Date();
        lockTime.setMinutes(lockTime.getMinutes() + 15);
        setLockUntil(lockTime);
        setIsLocked(true);
        const message = "Too many failed login attempts. Your account is locked for 15 minutes.";
        setErrorMsg(message);
        toast.error(message);
        setIsLoading(false);
        return;
      }

      const message = `Invalid email or password. (${newAttempts}/5 attempts)`;
      setErrorMsg(message);
      toast.error("Invalid email or password.");
      setIsLoading(false);

      // const result = await signIn("credentials", {
      //   email,
      //   password,
      //   redirect: false,
      // });
      //
      // if (result?.error) {
      //   setErrorMsg("Invalid email or password.");
      //   return;
      // }
      //
      // try {
      //   const surveyResponse = await fetch("/api/auth/survey-status", {
      //     method: "GET",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     credentials: "include",
      //   });
      //
      //   if (surveyResponse.ok) {
      //     const surveyData = await surveyResponse.json();
      //     if (!surveyData.hasSurvey) {
      //       router.push("/survey");
      //     } else {
      //       router.push("/home");
      //     }
      //   } else {
      //     router.push("/home");
      //   }
      // } catch (error) {
      //   console.error("Error checking survey status:", error);
      //   router.push("/home");
      // }
    } catch (err) {
      console.error(err);
      const message = "An unexpected error occurred. Please try again.";
      setErrorMsg(message);
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-semibold mb-8">Mood Manager</h1>

      <div className="w-full max-w-sm space-y-3">

        {/* Email */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-600">Email</label>
          <div className="flex items-center px-3 py-2 border rounded-md">
            <Mail size={18} className="text-gray-400 mr-2" />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full outline-none"
              autoComplete="email"
              onChange={(e) => {
              setEmail(e.target.value);
              setErrorMsg("");
              }}
              onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading && !isLocked) handleLogin();
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-600">Password</label>
          <div className="flex items-center px-3 py-2 border rounded-md relative">
            <Lock size={18} className="text-gray-400 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="password"
              className="w-full outline-none"
              autoComplete="current-password"
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg("");
              }}
              onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading && !isLocked) handleLogin();
              }}
            />
            
            {/* 비밀번호 보기 토글 */}
            <button
              type="button"
              className="absolute right-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={18} className="text-gray-500" />
              ) : (
                <Eye size={18} className="text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <p className="text-red-500 text-sm">{errorMsg}</p>
        )}

        {/* Sign In */}
        <button
          onClick={handleLogin}
          disabled={isLoading || isLocked}
          className="w-full bg-black text-white h-12 rounded-lg font-medium active:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {isLoading ? "Signing in..." : isLocked ? "Account Locked" : "Sign In"}
        </button>

        {/* Sign Up */}
        <button
          onClick={() => router.push("/register")}
          className="w-full bg-white text-black h-12 rounded-lg font-medium border active:bg-gray-200 transition"
        >
          Sign Up
        </button>

        {/* Forgot Password */}
        <Link href="/forgot-password" className="text-sm text-gray-500 text-center block mt-1 hover:text-gray-700 transition underline">
          Forgot password?
        </Link>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">Social Sign In</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Social Login */}
        <div className="flex justify-center space-x-6 mt-4">

          {/* Google */}
          <button
            onClick={() => signIn("google")}
            className="w-12 h-12 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
          >
            <FcGoogle size={24} />
          </button>

          {/* Kakao */}
          <button
            onClick={() => signIn("kakao")}
            className="w-12 h-12 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
          >
            <SiKakao size={22} color="#FEE500" />
          </button>

          {/* Naver */}
          <button
            onClick={() => signIn("naver")}
            className="w-12 h-12 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
          >
            <SiNaver size={22} color="#03C75A" />
          </button>

        </div>
      </div>
    </div>
  );
}
