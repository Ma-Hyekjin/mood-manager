// ======================================================
// File: src/app/api/auth/profile/route.ts
// ======================================================

/*
  [Profile API 역할]

  GET /api/auth/profile - 프로필 정보 조회
  PUT /api/auth/profile - 프로필 정보 업데이트 (이름, 성, 프로필 사진)
*/

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

/**
 * GET /api/auth/profile
 *
 * 사용자 프로필 정보 조회 API
 *
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 *
 * 구현 내용:
 * 1. NextAuth 세션 확인 (인증 필수)
 * 2. 세션에서 사용자 ID 또는 이메일 추출
 * 3. 백엔드 서버로 GET 요청 전달
 *    - URL: ${BACKEND_URL}/api/auth/profile
 *    - Headers: 세션 정보 포함
 * 4. 백엔드 응답을 그대로 반환
 *    - 응답: { profile: UserProfile }
 *    - UserProfile: { email, name, familyName, birthDate, gender, createdAt, profileImageUrl? }
 *
 * 참고:
 * - 인증이 필요한 엔드포인트
 * - 본인의 프로필 정보만 조회 가능
 */
export async function GET(request: NextRequest) {
  // [MOCK] 목업 모드: 목업 프로필 반환
  // TODO: 백엔드 API 연동 시 아래 주석 해제하고 목업 코드 제거
  //
  // const session = await getServerSession();
  //
  // if (!session) {
  //   return NextResponse.json(
  //     { error: "UNAUTHORIZED", message: "Authentication required" },
  //     { status: 401 }
  //   );
  // }
  //
  // const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // const response = await fetch(`${backendUrl}/api/auth/profile`, {
  //   method: "GET",
  //   headers: {
  //     "Cookie": request.headers.get("cookie") || "",
  //   },
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json();
  //   return NextResponse.json(error, { status: response.status });
  // }
  //
  // const data = await response.json();
  // return NextResponse.json(data);

  // 목업 응답: test@example.com 기준 프로필 반환
  return NextResponse.json({
    profile: {
      email: "test@example.com",
      name: "John",
      familyName: "Doe",
      birthDate: "1990-01-15",
      gender: "Male",
      createdAt: "2024-01-01",
      profileImageUrl: null,
    },
  });
}

/**
 * PUT /api/auth/profile
 *
 * 사용자 프로필 정보 업데이트 API
 *
 * TODO: 백엔드 서버로 요청을 프록시하거나 직접 호출하도록 구현
 *
 * 구현 내용:
 * 1. NextAuth 세션 확인 (인증 필수)
 * 2. 요청 본문에서 name, familyName, profileImage 추출 (FormData)
 * 3. 프로필 사진이 있는 경우:
 *    - 이미지 파일 검증 (타입, 크기)
 *    - 이미지 파일을 클라우드 스토리지에 업로드 (AWS S3, Cloudinary 등)
 *    - 업로드된 이미지 URL 저장
 * 4. 백엔드 서버로 PUT 요청 전달
 *    - URL: ${BACKEND_URL}/api/auth/profile
 *    - Body: { name: string, familyName: string, profileImageUrl?: string }
 *    - Headers: 세션 정보 포함
 * 5. 백엔드 응답을 그대로 반환
 *    - 응답: { profile: UserProfile }
 *
 * 참고:
 * - 인증이 필요한 엔드포인트
 * - 본인의 프로필 정보만 수정 가능
 * - 프로필 사진은 최대 5MB, 이미지 파일만 허용
 * - 프로필 사진은 클라우드 스토리지에 저장하고 URL만 DB에 저장
 */
export async function PUT(request: NextRequest) {
  // [MOCK] 목업 모드: 목업 프로필 반환
  // TODO: 백엔드 API 연동 시 아래 주석 해제하고 목업 코드 제거
  //
  // const session = await getServerSession();
  //
  // if (!session) {
  //   return NextResponse.json(
  //     { error: "UNAUTHORIZED", message: "Authentication required" },
  //     { status: 401 }
  //   );
  // }
  //
  // const formData = await request.formData();
  // const name = formData.get("name") as string;
  // const familyName = formData.get("familyName") as string;
  // const profileImage = formData.get("profileImage") as File | null;
  //
  // if (!name || !familyName) {
  //   return NextResponse.json(
  //     { error: "INVALID_INPUT", message: "Name and Family Name are required" },
  //     { status: 400 }
  //   );
  //
  // // 프로필 사진 업로드 처리
  // let profileImageUrl: string | null = null;
  // if (profileImage && profileImage.size > 0) {
  //   // 이미지 파일 검증
  //   if (!profileImage.type.startsWith("image/")) {
  //     return NextResponse.json(
  //       { error: "INVALID_INPUT", message: "Profile image must be an image file" },
  //       { status: 400 }
  //     );
  //   }
  //   if (profileImage.size > 5 * 1024 * 1024) {
  //     return NextResponse.json(
  //       { error: "INVALID_INPUT", message: "Profile image size must be less than 5MB" },
  //       { status: 400 }
  //     );
  //   }
  //
  //   // 클라우드 스토리지에 업로드 (예: AWS S3, Cloudinary)
  //   // const uploadResult = await uploadToCloudStorage(profileImage, session.user.id);
  //   // profileImageUrl = uploadResult.url;
  // }
  //
  // const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // const response = await fetch(`${backendUrl}/api/auth/profile`, {
  //   method: "PUT",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Cookie": request.headers.get("cookie") || "",
  //   },
  //   body: JSON.stringify({
  //     name: name.trim(),
  //     familyName: familyName.trim(),
  //     profileImageUrl,
  //   }),
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json();
  //   return NextResponse.json(error, { status: response.status });
  // }
  //
  // const data = await response.json();
  // return NextResponse.json(data);

  // 목업 응답: 업데이트된 프로필 반환
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const familyName = formData.get("familyName") as string;
  const profileImage = formData.get("profileImage") as File | null;

  if (!name || !familyName) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "Name and Family Name are required" },
      { status: 400 }
    );
  }

  // 프로필 사진 처리 (목업: Base64로 변환하여 반환)
  let profileImageUrl: string | null = null;
  if (profileImage && profileImage.size > 0) {
    // 이미지 파일 검증
    if (!profileImage.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Profile image must be an image file" },
        { status: 400 }
      );
    }
    if (profileImage.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: "Profile image size must be less than 5MB" },
        { status: 400 }
      );
    }

    // 목업: Base64로 변환 (실제로는 클라우드 스토리지에 업로드)
    const arrayBuffer = await profileImage.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    profileImageUrl = `data:${profileImage.type};base64,${base64}`;
  }

  return NextResponse.json({
    profile: {
      email: "test@example.com",
      name: name.trim(),
      familyName: familyName.trim(),
      birthDate: "1990-01-15",
      gender: "Male",
      createdAt: "2024-01-01",
      profileImageUrl,
    },
  });
}
