# MakeEat - Smart Recipe Generation System

## 프로젝트 소개 | Project Introduction
MakeEat은 영수증 이미지 분석과 AI를 활용하여 사용자의 구매 식재료를 기반으로 맞춤형 레시피를 생성하는 스마트 레시피 생성 시스템입니다.

MakeEat is a smart recipe generation system that creates personalized recipes based on users' purchased ingredients through receipt image analysis and AI technology.

### 차별화 요소 | Key Features

1. **하이브리드 OCR 시스템 | Hybrid OCR System**
   - EasyOCR과 Tesseract의 장점을 결합한 고정밀 텍스트 인식
   - GPT-4 기반 식재료 정보 정규화 및 분류
   - 다양한 영수증 포맷 지원
   
   - High-precision text recognition combining EasyOCR and Tesseract
   - GPT-4 based ingredient information normalization and classification
   - Support for various receipt formats

2. **맞춤형 레시피 생성 | Personalized Recipe Generation**
   - GPT-4 기반 상황별 레시피 최적화
   - FatSecret API 연동으로 정확한 영양 정보 제공
   - 식이 제한, 알레르기 등 개인별 요구사항 반영
   
   - GPT-4 based recipe optimization for different situations
   - Accurate nutritional information through FatSecret API integration
   - Consideration of individual requirements (dietary restrictions, allergies)

3. **확장 가능한 시스템 구조 | Scalable System Architecture**
   - Express + FastAPI 하이브리드 서버 구조
   - PostgreSQL + Prisma 기반 확장 가능한 데이터 모델
   - Swagger UI 기반 API 문서화
   
   - Hybrid server structure with Express + FastAPI
   - Scalable data model based on PostgreSQL + Prisma
   - API documentation with Swagger UI

4. **사용자 중심 기능 | User-Centric Features**
   - 기본적인 식단 계획 시스템
   - 식사 유형별 레시피 분류 (아침, 점심, 저녁)
   - 요리 종류별 분류 (한식, 양식 등)
   
   - Basic meal planning system
   - Recipe classification by meal type (breakfast, lunch, dinner)
   - Classification by cuisine type (Korean, Western, etc.)
## 주요 기능 | Core Features

### 1. 레시피 생성 시스템 | Recipe Generation System
#### 1.1 3단계 프롬프트 엔지니어링 | 3-Stage Prompt Engineering
1. **초기 레시피 생성 | Initial Recipe Generation**
   - GPT-4 기반 레시피 구조화
     - 제목 및 설명 생성
     - 필요한 재료 및 수량 명시
     - 5단계 이내의 조리 과정 설명
     - 조리 시간 및 난이도 산정
   - 사용자 요구사항 반영
     - 선택된 식사 유형(아침, 점심, 저녁)
     - 선호하는 요리 종류(한식, 양식 등)
     - 식이 제한 사항(채식, 무글루텐 등)
     - 알레르기 정보

   - GPT-4 Based Recipe Structuring
     - Title and description generation
     - Specification of required ingredients and quantities
     - 5-step cooking process description
     - Cooking time and difficulty estimation
   - User Requirements Integration
     - Selected meal type (breakfast, lunch, dinner)
     - Preferred cuisine type (Korean, Western, etc.)
     - Dietary restrictions (vegetarian, gluten-free, etc.)
     - Allergy information

2. **영양 정보 분석 | Nutritional Information Analysis**
   - FatSecret API 연동
     - 재료별 영양 정보 검색
     - 100g 기준 표준화된 데이터 추출
   - 레시피 영양 정보 계산
     - 재료별 실제 사용량 기준 환산
     - 1인분 기준 영양소 계산
     - 전체 칼로리 및 주요 영양소 산출

   - FatSecret API Integration
     - Ingredient-specific nutritional information search
     - Standardized data extraction per 100g
   - Recipe Nutrition Calculation
     - Conversion based on actual ingredient usage
     - Per-serving nutrient calculation
     - Total calorie and main nutrient computation

3. **데이터베이스 저장 | Database Storage**
   - 레시피 메타데이터 저장
     - 기본 정보(제목, 설명, 재료, 조리법)
     - 분류 정보(식사 유형, 요리 종류)
     - 제한 사항(식이 제한, 알레르기)
   - 영양 정보 저장
     - 표준화된 영양 성분표
     - 1인분 기준 정보
   - 시스템 연동
     - 식단 계획 시스템 연계
     - 사용자 피드백 시스템 구축

   - Recipe Metadata Storage
     - Basic information (title, description, ingredients, instructions)
     - Classification data (meal type, cuisine type)
     - Restrictions (dietary restrictions, allergies)
   - Nutritional Information Storage
     - Standardized nutrition facts table
     - Per-serving information
   - System Integration
     - Meal planning system linkage
     - User feedback system implementation

### 2. 영수증 분석 시스템 | Receipt Analysis System
#### 2.1 고급 OCR 시스템 | Advanced OCR System
- **EasyOCR + Tesseract 하이브리드 방식 | EasyOCR + Tesseract Hybrid Approach**
  - FastAPI 서버에서 PyTorch 기반 EasyOCR로 텍스트 영역 정밀 감지
  - 감지된 개별 영역을 Tesseract로 분석
  - 이미지 전처리 및 후처리 최적화
  - GPT-4를 활용한 식재료 정보 추출

  - Precise text area detection using PyTorch-based EasyOCR on FastAPI server
  - Analysis of detected areas using Tesseract
  - Image pre-processing and post-processing optimization
  - Ingredient information extraction using GPT-4

#### 2.2 레거시 OCR (구버전) | Legacy OCR (Old Version)
- Tesseract.js 기반의 기본 OCR 시스템
- 단순 작업에 활용 가능
- 정확도가 낮지만 빠른 처리 속도

- Basic OCR system based on Tesseract.js
- Suitable for simple tasks
- Lower accuracy but faster processing speed

### 3. API 시스템 | API System
- **RESTful API 구조 | RESTful API Structure**
  - 표준 HTTP 메서드 활용
    - GET: 레시피/식단 조회
    - POST: 영수증 분석, 레시피 생성
    - PUT: 식단 수정
    - DELETE: 레시피/식단 삭제
  - 리소스 중심 엔드포인트 설계
    - /receipt: 영수증 분석 관련 기능
    - /recipe: 레시피 관리 기능
    - /meal-plan: 식단 관리 기능
  - 상태 코드 기반 응답 처리
    - 200: 성공
    - 400: 잘못된 요청
    - 500: 서버 오류

  - Standard HTTP Methods
    - GET: Recipe/meal plan retrieval
    - POST: Receipt analysis, recipe generation
    - PUT: Meal plan modification
    - DELETE: Recipe/meal plan deletion
  - Resource-Centric Endpoint Design
    - /receipt: Receipt analysis functions
    - /recipe: Recipe management functions
    - /meal-plan: Meal plan management functions
  - Status Code Based Response Handling
    - 200: Success
    - 400: Bad Request
    - 500: Server Error

- **Swagger UI 자동 문서화 | Swagger UI Auto Documentation**
  - 엔드포인트별 상세 설명
  - 요청/응답 예시 포함
  - API 버전 관리

  - Detailed endpoint descriptions
  - Request/response examples included
  - API version management

## 기술 스택 | Tech Stack
- **백엔드 | Backend**
  - Node.js & Express
  - FastAPI (Python)
  - PostgreSQL & Prisma
  - Firebase Admin

- **AI & ML**
  - OpenAI GPT-4
  - PyTorch (EasyOCR)
  - Tesseract.js

- **외부 API | External APIs**
  - FatSecret Nutrition API
  - Firebase Storage

## 시스템 아키텍처 | System Architecture
1. **멀티 서버 구조 | Multi-Server Structure**
   - Express Server (8010): Main API Server
   - FastAPI Server (5001): OCR Processing Server

2. **데이터 흐름 | Data Flow**
   ```
   1. Receipt Analysis:
   Client → Express Server → FastAPI Server (EasyOCR)
                         → Tesseract (Text Recognition)
                         → GPT-4 (Ingredient Extraction)
                         → PostgreSQL (Storage)

   2. Recipe Generation:
   Client → Express Server → GPT-4 (Initial Recipe Generation)
                         → FatSecret API (Nutrition Info)
                         → GPT-4 (Recipe Optimization)
                         → PostgreSQL (Storage)
   ```

## 설치 및 실행 방법 | Installation and Setup

### 사전 요구사항 | Prerequisites
- Node.js 18.0.0 or higher
- Python 3.8 or higher (for OCR server)
- PostgreSQL 14.0 or higher

### 1. 프로젝트 클론 | Clone Project
```bash
git clone https://github.com/nampaca123/makeEat_backend.git
cd makeEat_backend
```

### 2. 환경 변수 설정 | Environment Setup
```bash
cp .env.example .env
```

`.env` 파일에 다음 정보를 입력 | Configure the following in `.env` file:
```
PORT=8010
DATABASE_URL="postgresql://username:password@localhost:5432/makeeat"
OPENAI_API_KEY="your-api-key"
FATSECRET_CLIENT_ID="your-client-id"
FATSECRET_CLIENT_SECRET="your-client-secret"
FIREBASE_CONFIG="your-firebase-config"
```

### 3. 의존성 설치 | Install Dependencies
```bash
# Node.js dependencies
npm install

# Python dependencies (OCR server)
cd src/ocr
pip install -r requirements.txt
```

### 4. 데이터베이스 설정 | Database Setup
```bash
# Prisma migration
npx prisma migrate dev
```

### 5. 서버 실행 | Run Servers
```bash
# Run main server (Express)
npm run dev

# Run OCR server (in new terminal)
cd src/ocr
python app.py
```

### 6. 서버 확인 | Server Verification
- Main Server: http://localhost:8010
- API Documentation: http://localhost:8010/api-docs
- OCR Server: http://localhost:5001

## 현재 개발 상태 | Current Development Status

### 임시 인증 시스템 | Temporary Authentication System
현재 개발 단계에서는 사용자 인증이 임시적으로 처리되어 있습니다:
The authentication system is temporarily implemented in the current development phase:

- 고정된 테스트 사용자 ID 사용 (`test_user_123`)
  Using fixed test user ID (`test_user_123`)
- Firebase Auth 설정은 되어있으나 미들웨어는 비활성화 상태
  Firebase Auth is configured but middleware is disabled