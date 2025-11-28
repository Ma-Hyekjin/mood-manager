# 데이터베이스 설정 가이드

## 현재 DATABASE_URL 설정

```
DATABASE_URL="mysql://root:1234@localhost:3306/mood_manager_db"
```

## 개발 단계별 접근 방법

### 1단계: 로컬 개발 (현재)

**로컬 MySQL 사용**
- 로컬에 MySQL 서버 설치 및 실행
- `localhost:3306`에 데이터베이스 생성
- 마이그레이션 실행하여 스키마 생성

```bash
# 1. MySQL 서버 실행 확인
mysql -u root -p1234 -e "SHOW DATABASES;"

# 2. 데이터베이스 생성
mysql -u root -p1234 -e "CREATE DATABASE IF NOT EXISTS mood_manager_db;"

# 3. Prisma 마이그레이션 실행
export DATABASE_URL="mysql://root:1234@localhost:3306/mood_manager_db"
npx prisma migrate dev --name init

# 4. Prisma Client 재생성
npx prisma generate
```

### 2단계: AWS RDS MySQL 설정 (프로덕션)

**AWS RDS MySQL 사용 권장**
- 로컬에서 마이그레이션 확인 후 AWS RDS에 동일한 스키마 적용
- DATABASE_URL만 변경하면 됨

#### AWS RDS MySQL 생성 방법

1. **AWS RDS 콘솔 접속**
   - AWS Console → RDS → Create database
   - Engine: MySQL
   - Template: Free tier (개발용) 또는 Production (프로덕션)

2. **설정**
   - DB instance identifier: `mood-manager-db`
   - Master username: `admin` (root 대신)
   - Master password: 강력한 비밀번호 설정
   - DB instance class: `db.t3.micro` (프리티어) 또는 `db.t3.small`
   - Storage: 20GB (프리티어) 또는 필요에 따라
   - Public access: Yes (초기 개발용, 프로덕션에서는 VPC 설정 권장)

3. **보안 그룹 설정**
   - 인바운드 규칙 추가: MySQL/Aurora (포트 3306)
   - Source: My IP 또는 0.0.0.0/0 (개발용, 프로덕션에서는 제한)

4. **엔드포인트 확인**
   - RDS 인스턴스 생성 후 엔드포인트 확인
   - 예: `mood-manager-db.xxxxx.ap-northeast-2.rds.amazonaws.com:3306`

#### DATABASE_URL 변경

`.env.production` 또는 배포 환경 변수:
```bash
DATABASE_URL="mysql://admin:your-password@mood-manager-db.xxxxx.ap-northeast-2.rds.amazonaws.com:3306/mood_manager_db"
```

#### 마이그레이션 적용

```bash
# AWS RDS에 마이그레이션 적용
export DATABASE_URL="mysql://admin:your-password@mood-manager-db.xxxxx.ap-northeast-2.rds.amazonaws.com:3306/mood_manager_db"
npx prisma migrate deploy
npx prisma generate
```

## 문제점 및 해결

### 1. 로컬 전용 설정
- **문제**: `localhost`와 `root` 사용자로 설정되어 있어 로컬 환경에서만 작동
- **해결**: AWS RDS 사용 시 엔드포인트와 사용자 정보로 변경

### 2. 접근 권한 문제

로컬 MySQL "Access denied" 에러:
```bash
# MySQL root 비밀번호 확인
mysql -u root -p

# 데이터베이스 생성 및 권한 부여
CREATE DATABASE IF NOT EXISTS mood_manager_db;
GRANT ALL PRIVILEGES ON mood_manager_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

AWS RDS 접근 문제:
- 보안 그룹에서 IP 주소 허용 확인
- VPC 설정 확인 (Public access가 Yes인지)

## 목업 모드 (DB 연결 실패 시)

DB 연결이 실패하거나 테스트 사용자일 경우 자동으로 목업 데이터를 반환합니다:
- `/api/devices`: 목업 디바이스 목록 반환
- `/api/moods/current`: 목업 무드스트림 반환
- `/api/preprocessing`: 목업 전처리 데이터 반환

이를 통해 DB 없이도 UI FLOW를 확인할 수 있습니다.

## 참고사항

1. **로컬 → AWS 전환**: 로컬에서 마이그레이션 확인 후 AWS RDS에 동일한 스키마 적용
2. **환경 변수 관리**: `.env.local` (로컬), `.env.production` (프로덕션) 분리
3. **보안**: 프로덕션에서는 별도의 데이터베이스 사용자 계정 생성 권장
4. **비용**: AWS RDS 프리티어는 12개월 무료 (750시간/월, 20GB 스토리지)

