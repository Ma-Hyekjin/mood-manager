# Branch Management Guide

브랜치별 역할과 관리 방법을 정리한다.

---

## 브랜치 구조

### 1. `main`
- **역할**: 프로덕션 안정 버전
- **용도**: 최종 배포 준비된 코드
- **특징**: 
  - 모든 테스트 완료
  - 배포 가능한 상태 유지
  - `vercel.json` 없음 (Vercel 배포는 `mock-vercel` 사용)

### 2. `dev`
- **역할**: 개발 통합 브랜치
- **용도**: 모든 개발 작업 통합
- **특징**:
  - 최신 개발 코드
  - 팀원 간 협업 브랜치
  - `vercel.json` 없음

### 3. `feature/hyeokjin`
- **역할**: 개인 기능 개발 브랜치
- **용도**: 개인 작업 및 실험
- **특징**:
  - `dev`와 동기화 유지
  - `vercel.json` 없음

### 4. `mock-vercel`
- **역할**: Vercel 배포 전용 브랜치
- **용도**: Vercel 프로덕션 배포
- **특징**:
  - `Web/vercel.json` 포함 (Vercel 설정)
  - `dev` 또는 `main`과 동기화
  - Vercel 자동 배포 연결

---

## 브랜치 관리 규칙

### `mock-vercel` 브랜치 관리

#### 1. 업데이트 방법
```bash
# dev의 최신 변경사항을 mock-vercel에 반영
git checkout mock-vercel
git merge dev --no-edit
git push origin mock-vercel
```

#### 2. vercel.json 관리
- `Web/vercel.json`은 `mock-vercel` 브랜치에만 존재
- 다른 브랜치에는 `vercel.json` 없음
- `vercel.json` 내용:
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "installCommand": "npm install",
    "framework": "nextjs"
  }
  ```

#### 3. Vercel 설정
- Vercel 대시보드에서 Root Directory: `Web` 설정
- 또는 `vercel --prod --cwd Web` 명령어 사용

#### 4. 배포 프로세스
1. `dev` 브랜치에서 작업 완료
2. `mock-vercel` 브랜치로 전환
3. `dev` 브랜치 merge
4. `mock-vercel` 브랜치 push
5. Vercel 자동 배포 트리거

---

## 브랜치 동기화

### dev → mock-vercel
```bash
git checkout mock-vercel
git merge dev --no-edit
git push origin mock-vercel
```

### dev → main
```bash
git checkout main
git merge dev --no-edit
git push origin main
```

### dev → feature/hyeokjin
```bash
git checkout feature/hyeokjin
git merge dev --no-edit
git push origin feature/hyeokjin
```

---

## 주의사항

### vercel.json 관리
- ✅ `mock-vercel` 브랜치에만 `Web/vercel.json` 존재
- ❌ 다른 브랜치에는 `vercel.json` 없음
- ❌ `vercel.json`에 `rootDirectory` 속성 사용 금지

### 브랜치별 파일 차이
- `mock-vercel`: `Web/vercel.json` 포함
- `dev`, `main`, `feature/hyeokjin`: `vercel.json` 없음

---

## 배포 체크리스트

### mock-vercel 배포 전
- [ ] `dev` 브랜치 최신 상태 확인
- [ ] `mock-vercel`에 `dev` merge 완료
- [ ] `Web/vercel.json` 존재 확인
- [ ] Vercel 환경 변수 설정 확인
- [ ] 빌드 테스트 완료

---

## 문제 해결

### vercel.json 에러
- **에러**: `Invalid vercel.json - should NOT have additional property 'rootDirectory'`
- **해결**: `rootDirectory` 속성 제거

### vercel.json 위치 에러
- **에러**: `The vercel.json file should be inside of the provided root directory`
- **해결**: `vercel.json`을 `Web/vercel.json`으로 이동

### 404 에러
- **원인**: Root Directory 설정 문제
- **해결**: Vercel 대시보드에서 Root Directory를 `Web`으로 설정

