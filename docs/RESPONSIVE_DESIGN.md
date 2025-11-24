# 디자인 시스템 가이드

**작성일**: 2025년

---

## 레이아웃

### 루트 레이아웃
- **최대 너비**: 375px 고정
- **중앙 정렬**: `flex justify-center` (body에 적용)
- **전체 화면**: `min-h-screen`
- **배경색**: `bg-white`

```tsx
// src/app/layout.tsx
<div className="w-full max-w-[375px] bg-white min-h-screen">
```

---

## 간격 (Spacing)

### 패딩 (Padding)
- **작은 패딩**: `px-3`, `py-2`, `py-3`
- **중간 패딩**: `px-4`, `py-4`, `py-6`
- **큰 패딩**: `px-6`

### 간격 (Gap/Space)
- **작은 간격**: `gap-2`, `space-y-2`
- **중간 간격**: `gap-3`, `gap-4`, `space-y-3`, `space-y-4`
- **큰 간격**: `space-y-5`

### 사용 예시
```tsx
// 페이지 레벨
<div className="px-4 py-6">

// 컴포넌트 간격
<div className="space-y-4">
<div className="gap-3">
```

---

## 둥근 모서리 (Border Radius)

- **작은**: `rounded` (기본값: 0.625rem)
- **중간**: `rounded-lg`
- **큰**: `rounded-xl`
- **원형**: `rounded-full`

### 사용 예시
```tsx
// 카드
<div className="rounded-xl">

// 버튼/아이콘
<div className="rounded-full">

// 입력 필드
<input className="rounded-md">
```

---

## 색상

### 배경색
- **기본**: `bg-white`
- **반투명**: `bg-white/80`, `bg-white/40`, `bg-white/50`
- **회색**: `bg-gray-200`, `bg-gray-800`
- **검정**: `bg-black`

### 텍스트 색상
- **기본**: `text-gray-800` (검은색)
- **보조**: `text-gray-600`, `text-gray-500`
- **비활성**: `text-gray-400`
- **흰색**: `text-white`

### 테두리 색상
- **기본**: `border-gray-200`
- **입력 필드**: `border-gray-300`

### 사용 예시
```tsx
// 카드 배경
<div className="bg-white border border-gray-200">

// 텍스트
<p className="text-gray-800">
<span className="text-gray-600">
```

---

## 그림자 (Shadow)

- **작은**: `shadow-sm`
- **중간**: `shadow-md`
- **큰**: `shadow-lg`

### 사용 예시
```tsx
<div className="shadow-sm">
<div className="shadow-md">
```

---

## 애니메이션 및 전환

### Transition
- **기본**: `transition`
- **전체**: `transition-all`
- **색상**: `transition-colors`

### 호버 효과
- **확대**: `hover:scale-105`
- **배경색 변경**: `hover:bg-white/60`, `hover:bg-gray-300`
- **텍스트 색상 변경**: `hover:text-gray-800`

### 사용 예시
```tsx
<button className="transition hover:scale-105">
<div className="transition-colors hover:bg-white/60">
```

---

## 블러 효과

- **배경 블러**: `backdrop-blur-sm`

### 사용 예시
```tsx
<div className="bg-white/80 backdrop-blur-sm">
```

---

## 타이포그래피

### 폰트 크기
- **작은**: `text-xs` (12px)
- **기본**: `text-sm` (14px)
- **중간**: `text-base` (16px)
- **큰**: `text-lg` (18px)

### 폰트 굵기
- **기본**: `font-medium`
- **강조**: `font-semibold`
- **굵게**: `font-bold`

### 사용 예시
```tsx
<h2 className="text-lg font-semibold">
<p className="text-sm text-gray-600">
<span className="text-xs font-medium">
```

---

## 모달 및 오버레이

### 모달 크기
- **작은**: `w-[300px]`
- **중간**: `w-[330px]`
- **큰**: `w-[350px]` (최대)

### 모달 스타일
- **배경**: `bg-white`
- **둥근 모서리**: `rounded-xl`
- **그림자**: `shadow-md`
- **중앙 정렬**: `flex items-center justify-center`

### 사용 예시
```tsx
<div className="w-[330px] bg-white rounded-xl shadow-md">
```

---

## 그리드 레이아웃

### 2열 그리드
- **기본**: `grid grid-cols-2 gap-3`

### 사용 예시
```tsx
<div className="grid grid-cols-2 gap-3">
```

---

## 버튼 스타일

### 기본 버튼
```tsx
// 검정 버튼
<button className="px-3 py-1 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition">

// 회색 버튼
<button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
```

### 아이콘 버튼
```tsx
<button className="p-1.5 rounded-full bg-white/40 backdrop-blur hover:bg-white/60 transition">
```

---

## 카드 스타일

### 기본 카드
```tsx
<div className="p-3 rounded-xl shadow-sm border bg-white">
```

### 반투명 카드
```tsx
<div className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200">
```

---

## CSS 변수 (Design Tokens)

### 색상 변수
- `--background`: 배경색
- `--foreground`: 텍스트 색상
- `--primary`: 주요 색상
- `--secondary`: 보조 색상
- `--muted`: 비활성 색상
- `--border`: 테두리 색상
- `--destructive`: 경고/삭제 색상

### 반경 변수
- `--radius`: 기본 반경 (0.625rem)
- `--radius-sm`: 작은 반경
- `--radius-md`: 중간 반경
- `--radius-lg`: 큰 반경
- `--radius-xl`: 매우 큰 반경

### 사용 방법
```tsx
// CSS 변수는 Tailwind에서 자동으로 매핑됨
<div className="bg-background text-foreground">
<div className="rounded-lg"> // --radius-lg 사용
```

---

## 체크리스트

- [x] 루트 레이아웃에 `max-w-[375px]` 적용
- [x] 모든 페이지가 375px 내에서 동작
- [x] 모달 크기가 375px 내에서 적절함
- [x] 패딩과 간격이 일관성 있게 사용됨
- [x] 중앙 정렬이 올바르게 적용됨
- [x] 공통 색상 시스템 적용
- [x] 공통 간격 시스템 적용
- [x] 공통 둥근 모서리 적용
- [x] 공통 그림자 적용
- [x] 공통 애니메이션 적용


## 향 아이콘
```tsx
//1.Musk - 몽글한 구름
import { CiCloudOn } from "react-icons/ci";

<CiCloudOn size={32} color="#FFBF00" /> //기본
<CiCloudOn className="w-8 h-8" color="#FFBF00" /> //Tailwind CSS

//2.Aromatic - 허브
import { GiHerbsBundle } from "react-icons/gi";

<GiHerbsBundle size={32} color="93A188" /> //기본
<GiHerbsBundle className="w-8 h-8" color="#93A188" /> //Tailwind CSS
```

