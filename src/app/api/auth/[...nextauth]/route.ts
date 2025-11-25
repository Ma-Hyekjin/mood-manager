// src/app/api/auth/[...nextauth]/route.ts
/**
 * [파일 역할]
 * - NextAuth 설정 파일
 * - 인증 프로바이더 설정 (Credentials, Google, Kakao, Naver)
 * - JWT 및 세션 콜백 처리
 *
 * [사용되는 위치]
 * - 모든 인증 관련 요청에서 자동 호출
 * - /api/auth/* 엔드포인트
 *
 * [주의사항]
 * - NEXTAUTH_SECRET 환경 변수 필수
 * - 소셜 로그인은 해당 환경 변수가 있을 때만 활성화
 */

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-change-in-production",
  providers: [
    // 이메일/비밀번호 로그인 (Credentials Provider)
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // 1. DB에서 사용자 조회
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              password: true,
              givenName: true,
              familyName: true,
            },
          });

          console.log("[NextAuth] User lookup:", {
            email: credentials.email,
            found: !!user,
            hasPassword: !!user?.password,
          });

          // 2. 사용자가 없거나 비밀번호가 없으면 실패
          if (!user || !user.password) {
            console.log("[NextAuth] Authentication failed: User not found or no password");
            return null;
          }

          // 3. 비밀번호 검증
          const isPasswordValid = await verifyPassword(
            credentials.password,
            user.password
          );

          console.log("[NextAuth] Password validation:", {
            isValid: isPasswordValid,
          });

          if (!isPasswordValid) {
            console.log("[NextAuth] Authentication failed: Invalid password");
            return null;
          }

          // 4. 인증 성공 - 사용자 정보 반환
          console.log("[NextAuth] Authentication successful:", {
            userId: user.id,
            email: user.email,
          });

          return {
            id: String(user.id),
            email: user.email,
            name: user.givenName
              ? `${user.familyName || ""} ${user.givenName}`.trim()
              : user.email,
          };
        } catch (error) {
          console.error("[NextAuth] Credentials authentication error:", error);
          return null;
        }
      },
    }),

    // 소셜 로그인 프로바이더 (환경 변수가 있을 때만 활성화)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    ...(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET
      ? [
          NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID,
            clientSecret: process.env.NAVER_CLIENT_SECRET,
          }),
        ]
      : []),

    ...(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET
      ? [
          KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
