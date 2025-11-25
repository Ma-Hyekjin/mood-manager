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

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";

export const authOptions: NextAuthOptions = {
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
    async signIn({ user, account, profile }) {
      // 소셜 로그인 처리 (Google, Kakao, Naver)
      if (account?.provider !== "credentials" && user.email) {
        try {
          // 1. 이메일로 기존 사용자 확인
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // 2. 신규 사용자 - 회원가입 페이지로 리다이렉트
            console.log(
              `[NextAuth] New social login user detected: ${user.email} (${account.provider})`
            );

            // 로그인 거부 - 회원가입 필요
            // 프론트엔드에서 에러를 감지하고 회원가입 페이지로 이동
            return `/register?provider=${account.provider}&email=${encodeURIComponent(
              user.email
            )}&name=${encodeURIComponent(user.name || "")}&image=${encodeURIComponent(
              user.image || ""
            )}`;
          } else {
            // 3. 기존 사용자 - provider 정보 업데이트 (선택)
            if (!existingUser.provider || !existingUser.providerId) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  provider: account.provider,
                  providerId: account.providerAccountId,
                },
              });
            }

            // 4. user.id를 DB의 ID로 설정 (JWT에서 사용)
            user.id = String(existingUser.id);

            console.log(
              `[NextAuth] Existing social login user: ${user.email} (${account.provider})`
            );
          }
        } catch (error) {
          console.error("[NextAuth] Social login error:", error);
          return false; // 로그인 실패
        }
      }

      return true; // 로그인 성공
    },
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
