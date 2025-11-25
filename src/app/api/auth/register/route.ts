// src/app/api/auth/register/route.ts
/**
 * [파일 역할]
 * - 회원가입 API 엔드포인트
 * - 이메일/비밀번호 기반 신규 사용자 계정 생성
 * - 입력 검증 및 이메일 중복 체크 수행
 *
 * [사용되는 위치]
 * - 회원가입 페이지에서 호출
 * - POST /api/auth/register
 *
 * [주의사항]
 * - 비밀번호는 해시 처리하여 저장
 * - 이메일 중복 체크 필수
 * - 만 12세 이상만 가입 가능
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import {
  isValidEmail,
  isValidDate,
  isValidGender,
  calculateAge,
  validateRequiredFields,
} from "@/lib/utils/validation";

/**
 * POST /api/auth/register
 *
 * 회원가입 처리
 *
 * 요청 필드:
 * - familyName (required): 사용자 성
 * - name (required): 사용자 이름
 * - birthDate (required): 생년월일 (YYYY-MM-DD)
 * - gender (required): 성별 ("male" | "female")
 * - email (required): 이메일 주소
 * - password (required): 비밀번호 (최소 6자)
 *
 * 응답:
 * - 성공: { success: true, user: { id, email, familyName, name } }
 * - 실패: { error: "ERROR_CODE", message: "에러 메시지" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { familyName, name, birthDate, gender, email, password, provider, profileImageUrl } = body;

    const isSocialSignup = !!provider; // 소셜 가입 여부

    // 1. 필수 필드 검증
    const requiredFields = ["familyName", "name", "birthDate", "gender", "email"];
    if (!isSocialSignup) {
      requiredFields.push("password"); // 일반 가입이면 비밀번호 필수
    }

    const validation = validateRequiredFields(body, requiredFields);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "INVALID_INPUT",
          message: `필수 필드가 누락되었습니다: ${validation.missingFields?.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 2. 이메일 형식 검증
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "INVALID_EMAIL", message: "유효하지 않은 이메일 형식입니다." },
        { status: 400 }
      );
    }

    // 3. 날짜 형식 검증
    if (!isValidDate(birthDate)) {
      return NextResponse.json(
        {
          error: "INVALID_DATE",
          message: "유효하지 않은 날짜 형식입니다. (YYYY-MM-DD)",
        },
        { status: 400 }
      );
    }

    // 4. 만 나이 검증 (최소 12세 이상)
    const age = calculateAge(birthDate);
    if (age < 12) {
      return NextResponse.json(
        {
          error: "AGE_RESTRICTION",
          message: "만 12세 이상만 가입할 수 있습니다.",
        },
        { status: 400 }
      );
    }

    // 5. 성별 검증
    if (!isValidGender(gender)) {
      return NextResponse.json(
        {
          error: "INVALID_GENDER",
          message: "유효하지 않은 성별입니다. (male | female)",
        },
        { status: 400 }
      );
    }

    // 6. 비밀번호 강도 검증 (일반 가입만)
    if (!isSocialSignup) {
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          {
            error: "WEAK_PASSWORD",
            message: passwordValidation.message,
          },
          { status: 400 }
        );
      }
    }

    // 7. 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "EMAIL_ALREADY_EXISTS",
          message: "이미 사용 중인 이메일입니다.",
        },
        { status: 400 }
      );
    }

    // 8. 비밀번호 해싱 (일반 가입만)
    let hashedPassword;
    if (!isSocialSignup) {
      hashedPassword = await hashPassword(password);
    }

    // 9. 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        ...(hashedPassword && { password: hashedPassword }),
        familyName,
        givenName: name,
        birthDate: new Date(birthDate),
        gender: gender.toLowerCase(),
        hasSurvey: false, // 초기값: 설문 미완료
        ...(provider && { provider }),
        ...(profileImageUrl && { profileImageUrl }),
      },
    });

    // 10. 성공 응답 (비밀번호 제외)
    return NextResponse.json({
      success: true,
      user: {
        id: String(user.id),
        email: user.email,
        familyName: user.familyName,
        name: user.givenName,
      },
    });
  } catch (error) {
    console.error("[POST /api/auth/register] 회원가입 실패:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "회원가입 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
