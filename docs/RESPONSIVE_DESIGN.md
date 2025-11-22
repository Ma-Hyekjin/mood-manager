# 반응형 디자인 가이드 (375px 기준)

## 현재 설정

### 루트 레이아웃 (`src/app/layout.tsx`)

```tsx
<div className="w-full max-w-[375px] bg-white min-h-screen">
```

- **최대 너비**: 375px
- **중앙 정렬**: `flex justify-center` (body에 적용)
- **전체 화면**: `min-h-screen`

## 반응형 디자인 원칙

### 1. 고정 너비 (375px)
- 모든 페이지는 **375px 너비**로 고정
- 모바일 우선 설계
- 데스크톱에서는 중앙에 배치

### 2. 내부 요소 레이아웃
- **패딩**: `px-3`, `px-4`, `px-6` 등 일관성 유지
- **간격**: `space-y-4`, `space-y-5` 등 일관성 유지
- **너비**: `w-full` 사용 (부모의 375px 내에서)

### 3. 모달 및 오버레이
- 모달 너비: `w-[300px]`, `w-[330px]` 등 (375px 내에서)
- 중앙 정렬: `flex items-center justify-center`

## 현재 상태 체크

### ✅ 올바르게 설정된 부분

1. **루트 레이아웃**: `max-w-[375px]` 적용됨
2. **로그인/회원가입 페이지**: `max-w-sm` (384px) 사용 → 375px 내에서 동작
3. **홈 페이지**: 루트 레이아웃 상속

### ⚠️ 확인 필요

1. **모달 컴포넌트들**:
   - `DeviceAddModal`: `w-[330px]` ✅
   - `DeviceTypeSelectModal`: `w-[300px]` ✅
   - `DeviceNameInputModal`: `w-[300px]` ✅

2. **내부 요소 너비**:
   - 모든 내부 요소는 `w-full` 또는 고정 너비 사용
   - 375px를 넘지 않도록 주의

## 권장 사항

### 1. 일관된 패딩 사용

```tsx
// 페이지 레벨
<div className="px-3">  // 작은 패딩
<div className="px-4">  // 중간 패딩
<div className="px-6">  // 큰 패딩
```

### 2. 간격 통일

```tsx
// 세로 간격
<div className="space-y-4">  // 표준
<div className="space-y-5">  // 넓은 간격
```

### 3. 모달 크기

```tsx
// 모달은 375px 내에서 여유 있게
<div className="w-[300px]">   // 작은 모달
<div className="w-[330px]">   // 중간 모달
<div className="w-[350px]">   // 큰 모달 (최대)
```

### 4. 반응형 유틸리티 클래스

```tsx
// 필요 시 사용 (현재는 고정 너비이므로 거의 사용 안 함)
<div className="w-full sm:w-[375px]">  // 데스크톱에서만 고정
```

## 체크리스트

- [x] 루트 레이아웃에 `max-w-[375px]` 적용
- [x] 모든 페이지가 375px 내에서 동작
- [x] 모달 크기가 375px 내에서 적절함
- [x] 패딩과 간격이 일관성 있게 사용됨
- [x] 중앙 정렬이 올바르게 적용됨

## 결론

현재 프로젝트는 **375px 고정 너비**로 잘 설정되어 있습니다. 모든 페이지와 컴포넌트가 이 기준을 따르고 있으며, 추가 수정이 필요하지 않습니다.

