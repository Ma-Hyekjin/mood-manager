"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [familyName, setFamilyName] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState(""); // yyyy.mm.dd 형식
  const [birthDateError, setBirthDateError] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

  // 이메일 형식 검증
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 비밀번호 강도 계산
  const calculatePasswordStrength = (password: string): "weak" | "medium" | "strong" | null => {
    if (password.length === 0) return null;
    if (password.length < 6) return "weak";
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return "weak";
    if (strength <= 3) return "medium";
    return "strong";
  };

  // 생년월일 포맷팅 함수 (숫자만 입력, 자동으로 . 추가)
  const formatBirthDate = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, "");
    
    // 최대 8자리까지만 허용 (yyyy.mm.dd)
    const limited = numbers.slice(0, 8);
    
    // 자동으로 . 추가
    if (limited.length <= 4) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 4)}.${limited.slice(4)}`;
    } else {
      return `${limited.slice(0, 4)}.${limited.slice(4, 6)}.${limited.slice(6)}`;
    }
  };

  // 생년월일 검증 함수
  const validateBirthDate = (dateStr: string): string => {
    if (!dateStr) return "";
    
    const parts = dateStr.split(".");
    if (parts.length !== 3) return "Please enter date in yyyy.mm.dd format";
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    // 년도 검증 (1913-2013, 만 12세 이상)
    if (isNaN(year) || year < 1913 || year > 2013) {
      return "Year must be between 1913 and 2013";
    }
    
    // 월 검증 (1-12)
    if (isNaN(month) || month < 1 || month > 12) {
      return "Month must be between 1 and 12";
    }
    
    // 일 검증
    if (isNaN(day) || day < 1) {
      return "Day is invalid";
    }
    
    // 해당 월의 최대 일수 확인
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
      return `Day must be between 1 and ${daysInMonth} for this month`;
    }
    
    return "";
  };

  // 폼 유효성 검사
  const isFormValid = () => {
    return (
      familyName.trim() !== "" &&
      name.trim() !== "" &&
      birthDate.trim() !== "" &&
      validateBirthDate(birthDate) === "" &&
      gender !== "" &&
      email.trim() !== "" &&
      validateEmail(email) &&
      password.length >= 6 &&
      passwordStrength !== "weak" &&
      password === confirmPassword &&
      confirmPassword.length > 0
    );
  };
  
  // 생년월일 문자열로 변환 (API 전송용)
  const getBirthDateString = () => {
    if (!birthDate) return "";
    const parts = birthDate.split(".");
    if (parts.length !== 3) return "";
    const year = parts[0];
    const month = parts[1].padStart(2, "0");
    const day = parts[2].padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleRegister = async () => {
    setErrorMsg("");
    setEmailError("");

    // 유효성 검사
    if (!familyName || !name || !birthDate || !gender || !email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    // 생년월일 검증
    const dateError = validateBirthDate(birthDate);
    if (dateError) {
      setBirthDateError(dateError);
      return;
    }

    // 이메일 형식 검증
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (passwordStrength === "weak") {
      setErrorMsg("Password is too weak. Please use a stronger password.");
      return;
    }

    try {
      // [MOCK] 회원가입 - 목업 모드에서 동작
      // TODO: 백엔드 API로 교체 필요
      // API 명세:
      // POST /api/auth/register
      // - 인증: 불필요 (회원가입 요청이므로)
      // - 요청: { familyName: string, name: string, birthDate: string, gender: string, email: string, password: string }
      // - 응답: { success: boolean, user: { id: string, email: string, familyName: string, name: string } }
      // - 설명: 새 사용자 계정 생성 및 DB 저장, 성공 시 홈 페이지로 이동 (설문은 홈에서 팝업으로 표시)
      
      // 목업: 회원가입 API 호출 (목업 응답 반환)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          familyName, 
          name, 
          birthDate: getBirthDateString(), 
          gender, 
          email, 
          password 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrorMsg(error.message || "Registration failed.");
        return;
      }

      const data = await response.json();

      if (!data.success) {
        setErrorMsg(data.message || "Registration failed.");
        return;
      }

      // 회원가입 성공 후 NextAuth 세션 생성
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMsg("Registration successful, but login failed. Please try logging in.");
        return;
      }

      // 회원가입 성공 시 홈 페이지로 이동 (설문은 홈에서 팝업으로 표시)
      router.push("/home");

      // const response = await fetch("/api/auth/register", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   credentials: "include",
      //   body: JSON.stringify({ familyName, name, birthDate: getBirthDateString(), gender, email, password }),
      // });
      //
      // if (!response.ok) {
      //   const error = await response.json();
      //   setErrorMsg(error.message || "Registration failed.");
      //   return;
      // }
      //
      // const data = await response.json();
      //
      // if (!data.success) {
      //   setErrorMsg(data.message || "Registration failed.");
      //   return;
      // }
      //
      // const { signIn } = await import("next-auth/react");
      // const result = await signIn("credentials", {
      //   email,
      //   password,
      //   redirect: false,
      // });
      //
      // if (result?.error) {
      //   setErrorMsg("Registration successful, but login failed. Please try logging in.");
      //   return;
      // }
      //
      // router.push("/home");
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-semibold mb-8">Mood Manager</h1>

      <div className="w-full max-w-sm space-y-5">
        {/* Family Name - 별도 row */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-600">Family Name</label>
          <div className="flex items-center px-3 py-2 border rounded-md">
            <User size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Family name"
              className="w-full outline-none"
              value={familyName}
              onChange={(e) => {
                setFamilyName(e.target.value);
                setErrorMsg("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRegister();
              }}
            />
          </div>
        </div>

        {/* Name - 별도 row */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-600">Name</label>
          <div className="flex items-center px-3 py-2 border rounded-md">
            <User size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Name"
              className="w-full outline-none"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRegister();
              }}
            />
          </div>
        </div>

        {/* Date of Birth & Gender */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-4">
            {/* Date of Birth - 좌측 50% */}
            <div className="flex flex-col flex-1 space-y-2">
              <label className="text-sm text-gray-600">Date of Birth</label>
              <div className={`flex items-center px-3 py-2 border rounded-md ${
                birthDateError ? "border-red-500" : ""
              }`}>
                <input
                  type="text"
                  placeholder="yyyy.mm.dd"
                  className="w-full outline-none"
                  value={birthDate}
                  onChange={(e) => {
                    const formatted = formatBirthDate(e.target.value);
                    setBirthDate(formatted);
                    setErrorMsg("");
                    setBirthDateError("");
                    // 실시간 검증
                    if (formatted) {
                      const error = validateBirthDate(formatted);
                      setBirthDateError(error);
                    }
                  }}
                  onBlur={() => {
                    if (birthDate) {
                      const error = validateBirthDate(birthDate);
                      setBirthDateError(error);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRegister();
                  }}
                  maxLength={10}
                />
              </div>
              {birthDateError && (
                <p className="text-red-500 text-xs">{birthDateError}</p>
              )}
            </div>
            
            {/* Gender - 우측 50% */}
            <div className="flex flex-col flex-1 space-y-2">
              <label className="text-sm text-gray-600">Gender</label>
              <div className="flex border rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setGender("male");
                    setErrorMsg("");
                  }}
                  className={`flex-1 px-4 py-2 text-sm border-r border-gray-300 transition ${
                    gender === "male"
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGender("female");
                    setErrorMsg("");
                  }}
                  className={`flex-1 px-4 py-2 text-sm transition ${
                    gender === "female"
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-600">Email</label>
          <div className={`flex items-center px-3 py-2 border rounded-md ${emailError ? "border-red-500" : ""}`}>
            <Mail size={18} className="text-gray-400 mr-2" />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full outline-none"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg("");
                setEmailError("");
                // 실시간 이메일 형식 검증
                if (e.target.value && !validateEmail(e.target.value)) {
                  setEmailError("Please enter a valid email address.");
                }
              }}
              onBlur={(e) => {
                if (e.target.value && !validateEmail(e.target.value)) {
                  setEmailError("Please enter a valid email address.");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRegister();
              }}
            />
          </div>
          {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
        </div>

        {/* Password */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-600">Password</label>
          <div
            className={`flex items-center px-3 py-2 border rounded-md relative transition-all ${
              passwordsMatch === true ? "border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.1)]" : ""
            }`}
          >
            <Lock
              size={18}
              className={`mr-2 ${
                passwordsMatch === true ? "text-green-500" : "text-gray-400"
              }`}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="password"
              className="w-full outline-none"
              value={password}
              onChange={(e) => {
                const newPassword = e.target.value;
                setPassword(newPassword);
                setErrorMsg("");
                setPasswordStrength(calculatePasswordStrength(newPassword));
                // 비밀번호 확인 실시간 검증
                if (confirmPassword) {
                  setPasswordsMatch(newPassword === confirmPassword);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isFormValid()) handleRegister();
              }}
            />
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
          {/* 비밀번호 강도 표시 */}
          {password && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength === "weak"
                        ? "bg-red-500 w-1/3"
                        : passwordStrength === "medium"
                        ? "bg-yellow-500 w-2/3"
                        : passwordStrength === "strong"
                        ? "bg-green-500 w-full"
                        : ""
                    }`}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {passwordStrength === "weak"
                    ? "Weak"
                    : passwordStrength === "medium"
                    ? "Medium"
                    : passwordStrength === "strong"
                    ? "Strong"
                    : ""}
                </span>
              </div>
              {/* 비밀번호 정책 안내 */}
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li className={password.length >= 6 ? "text-green-600" : ""}>
                    At least 6 characters
                  </li>
                  <li className={password.length >= 8 ? "text-green-600" : ""}>
                    At least 8 characters (recommended)
                  </li>
                  <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                    Include uppercase letter
                  </li>
                  <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>
                    Include number
                  </li>
                  <li className={/[^a-zA-Z0-9]/.test(password) ? "text-green-600" : ""}>
                    Include special character
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-600">Confirm Password</label>
          <div
            className={`flex items-center px-3 py-2 border rounded-md relative transition-all ${
              confirmPassword && passwordsMatch === false
                ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                : passwordsMatch === true
                ? "border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.1)]"
                : ""
            }`}
          >
            <Lock
              size={18}
              className={`mr-2 ${
                confirmPassword && passwordsMatch === false
                  ? "text-red-500"
                  : passwordsMatch === true
                  ? "text-green-500"
                  : "text-gray-400"
              }`}
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="confirm password"
              className="w-full outline-none"
              value={confirmPassword}
              onChange={(e) => {
                const newConfirmPassword = e.target.value;
                setConfirmPassword(newConfirmPassword);
                setErrorMsg("");
                // 비밀번호 확인 실시간 검증
                if (newConfirmPassword) {
                  setPasswordsMatch(password === newConfirmPassword);
                } else {
                  setPasswordsMatch(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isFormValid()) handleRegister();
              }}
            />
            <button
              type="button"
              className="absolute right-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={18} className="text-gray-500" />
              ) : (
                <Eye size={18} className="text-gray-500" />
              )}
            </button>
          </div>
          {confirmPassword && passwordsMatch === false && (
            <p className="text-red-500 text-xs">Passwords do not match.</p>
          )}
        </div>

        {/* Error Message */}
        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

        {/* Sign Up */}
        <button
          onClick={handleRegister}
          disabled={!isFormValid()}
          className={`w-full py-2 rounded-lg font-medium transition ${
            isFormValid()
              ? "bg-black text-white active:bg-gray-700 cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Sign Up
        </button>

        {/* Sign In Link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">Already have an account? </span>
          <Link
            href="/login"
            className="text-sm text-black underline hover:text-gray-700 transition"
          >
            Sign In
          </Link>
        </div>
      </div>

    </div>
  );
}
