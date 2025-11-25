# 설치 및 실행 가이드

이 문서는 프로젝트를 처음 다운로드한 팀원들이 프로젝트를 실행할 수 있도록 필요한 모든 정보를 제공합니다.

---

## 필수 요구사항

### 1. Node.js 버전

- **권장 버전**: Node.js 18.x 이상 (현재 개발 환경: v22.21.0)
- **최소 버전**: Node.js 18.0.0

**Node.js 버전 확인**:
```bash
node --version
```

**Node.js 설치**:
- 공식 사이트: https://nodejs.org/
- 또는 nvm 사용 (권장): https://github.com/nvm-sh/nvm

**nvm 사용 시**:
```bash
# 프로젝트 루트에 .nvmrc 파일이 있으면 자동으로 버전 전환
nvm use

# 또는 직접 버전 지정
nvm install 22.21.0
nvm use 22.21.0
```

### 2. npm 버전

- **권장 버전**: npm 10.x 이상 (현재 개발 환경: 10.9.4)
- **최소 버전**: npm 8.0.0

**npm 버전 확인**:
```bash
npm --version
```

**npm 업데이트**:
```bash
npm install -g npm@latest
```

### 3. Git

- Git이 설치되어 있어야 합니다.
- 버전 확인: `git --version`

---

## 설치 방법

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd mood-manager
```

### 2. 의존성 설치

```bash
npm install
```

**주의사항**:
- `package-lock.json`이 있으면 자동으로 동일한 버전 설치
- 설치 중 에러 발생 시:
  ```bash
  # 캐시 정리 후 재설치
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
  ```

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Firebase 설정 (선택사항, 백엔드 연동 전까지는 불필요)
# FIREBASE_API_KEY=your-api-key
# FIREBASE_AUTH_DOMAIN=your-auth-domain
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_STORAGE_BUCKET=your-storage-bucket
# FIREBASE_MESSAGING_SENDER_ID=your-sender-id
# FIREBASE_APP_ID=your-app-id

# OpenAI 설정 (선택사항, 현재 사용 안 함)
# OPENAI_API_KEY=your-openai-key

# 백엔드 URL (백엔드 연동 시)
# BACKEND_URL=http://localhost:8000
# 또는
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**`.env.local` 파일 예시**:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key-change-in-production
```

**주의사항**:
- `.env.local` 파일은 Git에 커밋하지 않습니다 (`.gitignore`에 포함됨)
- 팀원 간 공유가 필요한 설정은 `.env.example` 파일을 참고하세요

---

## 실행 방법

### 개발 서버 실행

```bash
npm run dev
```

서버가 시작되면 브라우저에서 `http://localhost:3000`으로 접속할 수 있습니다.

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

### 린트 실행

```bash
npm run lint
```

---

## 주요 의존성 버전

### 핵심 프레임워크
- **Next.js**: 15.5.6
- **React**: 19.1.0
- **React DOM**: 19.1.0
- **TypeScript**: ^5

### 주요 라이브러리
- **next-auth**: ^4.24.13
- **firebase**: ^12.5.0
- **tailwindcss**: ^4
- **lucide-react**: ^0.546.0
- **react-hot-toast**: ^2.6.0
- **react-icons**: ^5.5.0

전체 의존성 목록은 `package.json`을 참고하세요.

---

## 문제 해결

### 1. `npm install` 실패

**에러**: `ERESOLVE unable to resolve dependency tree`

**해결 방법**:
```bash
# npm 캐시 정리
npm cache clean --force

# node_modules 및 package-lock.json 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 2. `npm run dev` 실행 시 에러

**에러**: `Error: Cannot find module`

**해결 방법**:
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

### 3. 포트 3000이 이미 사용 중

**에러**: `Port 3000 is already in use`

**해결 방법**:
```bash
# 다른 포트 사용
PORT=3001 npm run dev

# 또는 기존 프로세스 종료
# macOS/Linux
lsof -ti:3000 | xargs kill -9
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 4. Turbopack 관련 에러

**에러**: `Turbopack` 관련 에러

**해결 방법**:
```bash
# package.json의 scripts에서 --turbopack 제거 후 실행
# 또는 Next.js 버전 확인
npm list next
```

### 5. TypeScript 타입 에러

**에러**: TypeScript 컴파일 에러

**해결 방법**:
```bash
# TypeScript 재설치
npm install --save-dev typescript@latest

# 타입 정의 재설치
npm install --save-dev @types/node @types/react @types/react-dom
```

### 6. 모듈을 찾을 수 없음

**에러**: `Module not found: Can't resolve`

**해결 방법**:
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json .next
npm install
```

---

## 프로젝트 구조 확인

프로젝트가 올바르게 설치되었는지 확인:

```bash
# 주요 디렉토리 확인
ls -la src/
ls -la src/app/
ls -la src/components/

# package.json 확인
cat package.json
```

---

## 추가 설정 (선택사항)

### 1. VS Code 확장 프로그램 (권장)

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### 2. Git 설정

```bash
# .gitignore 확인
cat .gitignore

# 환경 변수 파일이 커밋되지 않았는지 확인
git status
```

---

## 다음 단계

설치가 완료되면 다음 문서를 참고하세요:

1. **프로젝트 구조**: `docs/PROJECT_STRUCTURE.md`
2. **API 명세**: `docs/API_SPEC.md`
3. **페이지 역할**: `docs/PAGE_ROLES.md`
4. **TODO**: `docs/TODO.md`

---

## 질문이나 문제가 있나요?

프로젝트 실행 중 문제가 발생하면:

1. 이 문서의 "문제 해결" 섹션 확인
2. `docs/README.md`의 문서 목록 확인
3. 팀원에게 문의

