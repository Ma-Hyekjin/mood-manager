// ======================================================
// File: src/app/(auth)/register/components/RegisterForm.tsx
// ======================================================

/*
  [RegisterForm 역할]
  
  - 회원가입 폼 UI 컴포넌트
  - 모든 입력 필드와 검증 UI 포함
*/

"use client";

import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import type { useRegisterForm } from "../hooks/useRegisterForm";

interface RegisterFormProps {
  form: ReturnType<typeof useRegisterForm>;
}

export default function RegisterForm({ form }: RegisterFormProps) {
  const {
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
    validateEmail,
    calculatePasswordStrength,
    formatBirthDate,
    validateBirthDate,
    isFormValid,
    handleRegister,
  } = form;

  return (
    <div className="w-full max-w-sm space-y-5">
      {/* Family Name */}
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

      {/* Name */}
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
  );
}

