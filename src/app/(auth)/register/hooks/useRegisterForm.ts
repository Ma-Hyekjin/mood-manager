import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/**
 * 회원가입 폼 관리 커스텀 훅
 * 
 * [MOCK] 목업 모드로 동작
 * TODO: 백엔드 API로 교체 필요
 */
export function useRegisterForm() {
  const router = useRouter();
  const [familyName, setFamilyName] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
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

  // 생년월일 포맷팅 함수
  const formatBirthDate = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, "");
    const limited = numbers.slice(0, 8);
    
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
    
    if (isNaN(year) || year < 1913 || year > 2013) {
      return "Year must be between 1913 and 2013";
    }
    
    if (isNaN(month) || month < 1 || month > 12) {
      return "Month must be between 1 and 12";
    }
    
    if (isNaN(day) || day < 1) {
      return "Day is invalid";
    }
    
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

    if (!familyName || !name || !birthDate || !gender || !email || !password || !confirmPassword) {
      const message = "Please fill in all fields.";
      setErrorMsg(message);
      toast.error(message);
      return;
    }

    const dateError = validateBirthDate(birthDate);
    if (dateError) {
      setBirthDateError(dateError);
      toast.error(dateError);
      return;
    }

    if (!validateEmail(email)) {
      const message = "Please enter a valid email address.";
      setEmailError(message);
      toast.error(message);
      return;
    }

    if (password !== confirmPassword) {
      const message = "Passwords do not match.";
      setErrorMsg(message);
      toast.error(message);
      return;
    }

    if (password.length < 6) {
      const message = "Password must be at least 6 characters.";
      setErrorMsg(message);
      toast.error(message);
      return;
    }

    if (passwordStrength === "weak") {
      const message = "Password is too weak. Please use a stronger password.";
      setErrorMsg(message);
      toast.error(message);
      return;
    }

    try {
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
        const message = error.message || "Registration failed.";
        setErrorMsg(message);
        toast.error(message);
        return;
      }

      const data = await response.json();

      if (!data.success) {
        const message = data.message || "Registration failed.";
        setErrorMsg(message);
        toast.error(message);
        return;
      }

      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const message = "Registration successful, but login failed. Please try logging in.";
        setErrorMsg(message);
        toast.error(message);
        return;
      }

      toast.success("Registration successful! Welcome to Mood Manager.");
      router.push("/home");
    } catch (err) {
      console.error(err);
      const message = "An unexpected error occurred. Please try again.";
      setErrorMsg(message);
      toast.error(message);
    }
  };

  return {
    // State
    familyName,
    name,
    birthDate,
    birthDateError,
    gender,
    email,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    errorMsg,
    emailError,
    passwordStrength,
    passwordsMatch,
    // Setters
    setFamilyName,
    setName,
    setBirthDate,
    setBirthDateError,
    setGender,
    setEmail,
    setPassword,
    setConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    setErrorMsg,
    setEmailError,
    setPasswordStrength,
    setPasswordsMatch,
    // Helpers
    validateEmail,
    calculatePasswordStrength,
    formatBirthDate,
    validateBirthDate,
    isFormValid,
    handleRegister,
  };
}

