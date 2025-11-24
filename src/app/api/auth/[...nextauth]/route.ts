import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    // [MOCK] 이메일/비밀번호 로그인 (Credentials Provider)
    // TODO: 백엔드 API와 연동 필요
    // API 명세:
    // POST /api/auth/login (내부적으로 호출)
    // - 요청: { email: string, password: string }
    // - 응답: { success: boolean, user: { id: string, email: string, name: string } }
    // - 설명: NextAuth가 자동으로 호출하여 인증 처리
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

        // [MOCK] 로컬 검증
        // TODO: 백엔드 API로 교체 필요
        const MOCK_EMAIL = "test@example.com";
        const MOCK_PASSWORD = "1234";

        if (credentials.email === MOCK_EMAIL && credentials.password === MOCK_PASSWORD) {
          return {
            id: "user-1",
            email: MOCK_EMAIL,
            name: "Test User",
          };
        }

        // [API] 실제 백엔드 인증
        // 백엔드 서버의 로그인 API 엔드포인트 호출
        // try {
        //   const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
        //   const response = await fetch(`${backendUrl}/api/auth/login`, {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       email: credentials.email,
        //       password: credentials.password,
        //     }),
        //   });
        //
        //   if (!response.ok) return null;
        //
        //   const data = await response.json();
        //   if (!data.success || !data.user) return null;
        //
        //   return {
        //     id: data.user.id,
        //     email: data.user.email,
        //     name: data.user.name,
        //   };
        // } catch (error) {
        //   console.error("Auth error:", error);
        //   return null;
        // }

        return null;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
    }),

    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
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
