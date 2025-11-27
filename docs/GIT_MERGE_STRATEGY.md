# Git 병합 전략 가이드

## 현재 상황 분석

### 브랜치 상태
- **feature/hyeokjin** (현재): 프론트엔드 리팩토링 + LLM 연동 (3개 커밋)
- **origin/HJ**: 백엔드 API 완전 구현 + Prisma 스키마 (10개 이상 커밋)
- **dev**: 기준 브랜치

### Prisma 위치 문제
- **HJ**: `prisma/schema.prisma` (최상위, 완전한 스키마 194줄)
- **당신**: `src/prisma/schema.prisma` (src 내부, 빈 파일 2줄)

### 충돌 예상 파일
1. `src/app/(main)/home/page.tsx` - 양쪽 모두 수정
2. `src/app/(main)/home/components/Device/hooks/useDeviceHandlers.ts` - 양쪽 모두 수정
3. `src/app/(main)/mypage/` - HJ만 수정 (충돌 없음)
4. `src/app/api/auth/` - HJ만 수정 (충돌 없음)

---

## 권장 병합 전략: feature/hyeokjin에서 HJ 먼저 merge

### 이유
1. **당신이 모든 충돌을 한 번에 해결** 가능
2. **Prisma 위치 통일**을 당신이 직접 처리
3. **리팩토링된 구조 유지**하면서 HJ의 API 연동 통합
4. **dev 브랜치는 안정적** 상태 유지

---

## 구체적 실행 단계

### Step 1: 현재 작업 커밋 및 푸시 (이미 완료된 것으로 보임)
```bash
git checkout feature/hyeokjin
git status  # 변경사항 확인
git add .
git commit -m "refactor: home 컴포넌트 리팩토링 완료 (1-8)"
git push origin feature/hyeokjin
```

### Step 2: HJ 브랜치를 feature/hyeokjin에 merge
```bash
git merge origin/HJ
# 충돌 발생 예상
```

### Step 3: 충돌 해결 원칙

#### 3.1 Prisma 위치 통일
```bash
# src/prisma/schema.prisma 삭제
rm src/prisma/schema.prisma

# prisma/schema.prisma 사용 (HJ의 완전한 스키마)
# 이미 merge로 가져옴
```

#### 3.2 src/lib/prisma.ts 수정
HJ의 Prisma 클라이언트 사용:
```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
```

#### 3.3 충돌 파일별 해결 전략

**`src/app/(main)/home/page.tsx`**
- **당신의 변경**: 리팩토링된 구조 (props 그룹화)
- **HJ의 변경**: 백엔드 API 연동
- **해결**: 당신의 리팩토링 구조 유지 + HJ의 API 호출 로직 통합

**`src/app/(main)/home/components/Device/hooks/useDeviceHandlers.ts`**
- **당신의 변경**: 목업 로직 (주석 처리된 API 호출)
- **HJ의 변경**: 실제 API 호출 구현
- **해결**: HJ의 실제 API 호출 사용, 목업 제거

**기타 파일들**
- HJ만 수정한 파일: HJ의 버전 사용
- 당신만 수정한 파일: 당신의 버전 유지

### Step 4: Prisma Client 재생성
```bash
npx prisma generate
```

### Step 5: 테스트 및 커밋
```bash
# 충돌 해결 후
git add .
git commit -m "merge: HJ 브랜치 병합 및 충돌 해결

- Prisma 위치 통일 (최상위로)
- 리팩토링된 구조 유지하면서 HJ의 API 연동 통합
- useDeviceHandlers에서 실제 API 호출 사용"
git push origin feature/hyeokjin
```

### Step 6: dev에 병합
```bash
git checkout dev
git pull origin dev
git merge feature/hyeokjin
# 최종 충돌 해결 (있다면)
git push origin dev
```

---

## 대안 전략: HJ 먼저 dev에 병합 (선택적)

만약 HJ가 직접 dev에 병합하는 것이 더 나다면:

### Step 1: HJ 브랜치를 dev에 병합 (HJ 또는 당신이)
```bash
git checkout dev
git pull origin dev
git merge origin/HJ
# 충돌 해결
git push origin dev
```

### Step 2: feature/hyeokjin을 dev에 맞춰 업데이트
```bash
git checkout feature/hyeokjin
git pull origin dev  # 또는 git merge dev
# 충돌 해결
```

### Step 3: Prisma 위치 통일
- `src/prisma/schema.prisma` 삭제
- `prisma/schema.prisma` 사용

### Step 4: feature/hyeokjin을 dev에 병합
```bash
git checkout dev
git merge feature/hyeokjin
git push origin dev
```

---

## 충돌 해결 가이드

### 충돌 마커 이해
```
<<<<<<< HEAD (feature/hyeokjin)
당신의 코드
=======
HJ의 코드
>>>>>>> origin/HJ
```

### 해결 방법
1. **둘 다 필요**: 두 코드 모두 유지 (통합)
2. **당신의 코드 우선**: 당신의 코드만 유지
3. **HJ의 코드 우선**: HJ의 코드만 유지
4. **새로운 코드**: 완전히 새로 작성

### 예시: useDeviceHandlers.ts 충돌 해결

**충돌 전 (당신의 버전)**:
```typescript
// [MOCK] 디바이스 삭제 (로컬 상태만 업데이트)
// TODO: 백엔드 API로 교체 필요
const handleDelete = () => {
  setDevices((prev) => prev.filter((d) => d.id !== device.id));
};
```

**충돌 후 (HJ의 버전)**:
```typescript
const handleDelete = async () => {
  try {
    const response = await fetch(`/api/devices/${device.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setDevices((prev) => prev.filter((d) => d.id !== device.id));
    }
  } catch (error) {
    console.error("Error deleting device:", error);
  }
};
```

**해결**: HJ의 실제 API 호출 사용

---

## 주의사항

1. **Prisma Client 재생성 필수**
   ```bash
   npx prisma generate
   ```

2. **환경 변수 확인**
   - `.env.local`에 `DATABASE_URL` 설정 확인
   - HJ의 환경 변수와 일치하는지 확인

3. **의존성 확인**
   ```bash
   npm install
   # Prisma 관련 의존성 확인
   ```

4. **테스트 필수**
   - 병합 후 빌드 테스트: `npm run build`
   - 기능 테스트: 각 페이지 동작 확인

---

## 빠른 참조: Git 명령어

```bash
# 현재 상태 확인
git status
git log --oneline --graph --all -10

# 충돌 파일 확인
git diff --name-only --diff-filter=U

# 충돌 해결 후
git add <해결된_파일>
git commit -m "resolve: 충돌 해결"

# 병합 취소 (필요시)
git merge --abort

# 특정 파일만 HJ 버전 사용
git checkout --theirs <파일경로>
git add <파일경로>

# 특정 파일만 당신 버전 사용
git checkout --ours <파일경로>
git add <파일경로>
```

---

## 권장 순서 요약

1. ✅ **현재 작업 커밋** (이미 완료된 것으로 보임)
2. 🔄 **feature/hyeokjin에서 HJ merge** (충돌 해결)
3. 🔄 **Prisma 위치 통일** (최상위로)
4. 🔄 **Prisma Client 재생성**
5. ✅ **테스트 및 커밋**
6. 🔄 **dev에 병합**
