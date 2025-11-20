"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { SiKakao, SiNaver } from "react-icons/si";

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

  const handleLogin = async () => {
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    try {
      // -------------------------------------------------------
      // MOCK LOGIN (Backend 연결 전 임시 검증)
      // -------------------------------------------------------
      const MOCK_EMAIL = "test@example.com";
      const MOCK_PASSWORD = "1234";

      if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
        // 일단 설문을 하지 않은 상태라고 가정
        router.push("/survey");
        return;
      }

      setErrorMsg("Invalid email or password.");

      // -------------------------------------------------------
      // 실제 API 연동 시 아래 fetch 코드 활성화
      // -------------------------------------------------------
      /*
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg("Invalid email or password.");
        return;
      }

      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!data.hasSurvey) {
        router.push("/survey");
      } else {
        router.push("/home");
      }
      */
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-semibold mb-8">Mood Manager</h1>

      <div className="w-full max-w-sm space-y-5">

        {/* Email */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-600">Email</label>
          <div className="flex items-center px-3 py-2 border rounded-md">
            <Mail size={18} className="text-gray-400 mr-2" />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full outline-none"
              onChange={(e) => {
              setEmail(e.target.value);
              setErrorMsg("");
              }}
              onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
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
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg("");
              }}
              onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
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
          className="w-full bg-black text-white py-2 rounded-lg font-medium active:bg-gray-700 transition"
        >
          Sign In
        </button>

        {/* Sign Up */}
        <button
          onClick={() => router.push("/register")}
          className="w-full bg-white text-black py-2 rounded-lg font-medium border active:bg-gray-200 transition"
        >
          Sign Up
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">Social Sign In</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Social Login */}
        <div className="flex justify-center space-x-6">

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
