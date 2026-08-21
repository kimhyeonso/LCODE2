# L:CODE

> 계획이 틀어져도, 여행은 계속된다.  
> 미리 구성된 여행 일정에 사용자의 선택과 AI 리믹스를 더하는 **여행 일정 큐레이션 플랫폼**

L:CODE(로코드)는 사용자가 여행 일정을 처음부터 모두 검색하고 조합하지 않아도,  
미리 구성된 **여행상품과 기본 일정**을 선택한 뒤 직접 수정하거나 **OpenAI 기반 일정 수정 추천**을 활용해 자신만의 여행으로 완성할 수 있도록 돕는 반응형 웹 서비스입니다.

여행 전에는 빠르게 계획을 시작하고, 여행 중에는 날씨·휴무·교통·체력 등 예상하지 못한 상황에 맞춰 남은 일정을 다시 구성할 수 있도록  
**PLAN → CUSTOM → REMIX** 흐름을 핵심 경험으로 설계합니다.

---

## 1. Project Overview

- **프로젝트명**: L:CODE (로코드 / lo:code)
- **프로젝트 유형**: AI 기반 여행 일정 큐레이션 및 여행 커머스 플랫폼
- **프로젝트 목표**: 여행 상품을 소개하고 AI 기반 여행 추천을 제공하는 웹 애플리케이션
- **핵심 콘셉트**: 기본 일정 선택 + 사용자 직접 커스텀 + AI 일정 수정 + 여행 중 AI Remix
- **디자인 콘셉트**: Editorial Magazine / Travel Magazine
- **대응 환경**: Mobile / Tablet / Desktop 반응형 웹
- **주요 여행 지역**: 대한민국 / 일본 / 중국
- **핵심 키워드**: AI Remix, Travel Curation, Human in the Loop, Zero-Click, Ready-core, Feelconomy
- **배포 환경**: Vercel

### Team

| Role | Name |
|---|---|
| 팀장 | 김현수 |
| 부팀장 | 최정은 |
| 팀원 | 전승근 |
| 팀원 | 전소희 |
| 팀원 | 유지영 |

---

## 2. Project Background

여행 서비스는 관광지 검색, 지도, 추천, AI 일정 생성 등 여행 전 계획을 돕는 다양한 기능을 제공하고 있습니다.

하지만 실제 여행이 시작되면 다음과 같은 변수가 발생할 수 있습니다.

- 날씨 변화
- 관광지 휴무
- 예약 취소
- 교통 지연
- 일정 지체
- 체력 저하 및 컨디션 변화

이때 사용자는 다시 **대체 장소 검색 → 지도 확인 → 이동시간 계산 → 기존 일정 확인 → 남은 일정 재배치** 과정을 반복해야 합니다.

L:CODE는 단순히 “여행 일정을 만들어주는 서비스”가 아니라,  
**변화하는 여행에 맞춰 일정을 계속 조정할 수 있는 서비스**를 목표로 합니다.

---

## 3. Core Concept

### PLAN

미리 제작된 여행상품과 기본 일정 중 원하는 여행을 선택합니다.

- 국가 / 도시별 패키지 탐색
- 추천 여행상품 확인
- 기본 일정 샘플 확인
- 여행 기간, 동행 유형, 관심사, 여행 속도에 맞는 추천

### CUSTOM

선택한 기본 일정을 사용자가 직접 자신의 여행으로 수정합니다.

- 장소 추가
- 장소 삭제
- 방문 순서 변경
- 일정 제목 수정
- 메모 작성
- 찜한 장소 추가
- 지도에서 장소 검색
- 이동 경로 및 이동시간 확인
- 필요할 경우 OpenAI 일정 수정 추천 요청

### REMIX

여행 중 계획이 달라졌을 때 현재 일정과 남은 시간을 기준으로 이후 일정을 다시 구성합니다.

- 관광지 휴무
- 예약 취소
- 날씨 변화
- 교통 지연
- 일정 지체
- “피곤해요”
- “천천히 다니고 싶어요”
- “오늘은 조금 쉬고 싶어요”

AI가 변경안을 제안하되 자동으로 확정하지 않고,  
**사용자가 기존 일정과 변경안을 비교한 뒤 최종 적용 여부를 결정합니다.**

---

## 4. Target Audience

L:CODE의 주요 사용자는 다음과 같습니다.

- 여행 계획을 처음부터 직접 작성하는 것이 부담스러운 사용자
- 짧은 여행 기간 안에서 효율적으로 일정을 구성하고 싶은 사용자
- 패키지의 편리함은 원하지만 일정은 자유롭게 수정하고 싶은 사용자
- 여행 중 예상하지 못한 상황에 빠르게 대응하고 싶은 사용자
- 여러 사이트를 반복 검색하기보다 필요한 결과를 빠르게 확인하고 싶은 사용자
- AI 추천을 활용하되 최종 결정은 직접 하고 싶은 사용자

---

## 5. Brand & Design Concept

### Editorial Travel Magazine

L:CODE는 일반적인 여행 앱보다 **여행 잡지의 편집 디자인**을 연상시키는 화면을 지향합니다.

- 큰 세리프 타이틀
- 읽기 쉬운 산세리프 본문
- 넓은 여백
- 비대칭적인 편집 레이아웃
- 큰 여행 이미지
- 섹션 번호와 영문 캡션
- 카드형 콘텐츠
- 절제된 모션
- 모바일에서도 잡지의 편집감을 유지하는 반응형 구성

### Visual Direction

- 차분한 Ivory / Paper Tone
- Deep Ink / Black
- Sand / Warm Neutral
- 여행 이미지가 강조되는 저채도 배경
- 불필요하게 화려한 효과는 피하고 세련되고 절제된 분위기 유지
- 콘텐츠에 적합한 시맨틱 HTML과 접근성 고려

---

## 6. Main Navigation

모바일 하단 내비게이션을 기준으로 주요 메뉴를 4개로 구성합니다.

### HOME

- 다가오는 여행
- 추천 패키지
- 국가별 여행지
- 이벤트
- 여행 필수템
- 여행 저널

### PLAN

- 여행 추천 설문
- 패키지 탐색
- 추천 결과
- 일정 확인
- 일정 수정
- AI REMIX
- 내 일정

### SHOP

- 여행용품 목록
- 상품 상세
- 찜한 상품
- 장바구니
- 주문 / 결제
- 주문 완료

### MY

- 회원 정보
- 내 여행
- 지난 여행
- 찜한 장소
- 주문 내역
- 찜한 상품
- 쿠폰함
- 알림 설정
- 고객센터
- 로그아웃

---

## 7. Home Content Structure

HOME은 여행 잡지의 목차처럼 여러 콘텐츠를 하나의 화면에 편집형으로 배치합니다.

### 01 / UPCOMING

다가오는 여행

- D-Day
- 여행지
- 여행 기간
- 여행 일수
- 방문 예정 장소 수

### 02 / EDITOR'S PICK

추천하는 패키지

- 후쿠오카
- 도쿄
- 서울 등

### 03 / DESTINATIONS

Where to Next?

- KOREA
- JAPAN
- CHINA

### 04 / EVENT

- 여행 짐싸기 게임
- 쿠폰 및 경품 이벤트

### 05 / ESSENTIALS

여행 필수템

- Travel Kit
- Pouch
- Adapter
- Packing Set

### 06 / JOURNAL

여행자의 기록

- 여행지별 저널
- 에디토리얼 콘텐츠
- 여행 후기 및 기록

---

## 8. Tech Stack

### Frontend

- React
- Vite
- JavaScript ES6+
- SCSS Modules
- React Router
- GSAP

### Backend / Data

- Firebase Authentication
- Cloud Firestore
- JSON

### AI

- OpenAI API

### Map / Place

- Google Maps JavaScript API
- Places API
- Place Details
- Routes API

### Design

- Figma
- Adobe Illustrator

### Collaboration

- Git
- GitHub

### Deployment

- Vercel

### Required Packages

```bash
npm install react-router-dom sass firebase gsap
```

---

## 9. Data Strategy

L:CODE는 모든 일정을 AI가 처음부터 생성하는 방식보다  
**샘플 데이터 + 사용자 수정 + AI 보조** 방식으로 구성합니다.

### Static / Sample Data

JSON으로 관리하기 적합한 데이터:

- 기본 여행상품
- 기본 여행 일정
- 도시 / 국가 카테고리
- 샘플 관광지
- 쇼핑 상품
- 이벤트 기본 데이터

### Firebase

사용자별로 저장할 데이터:

- 회원 정보
- 설문 결과
- 저장한 여행 일정
- 수정된 일정
- 찜한 장소
- 찜한 상품
- 장바구니
- 주문 내역
- 쿠폰
- 알림 설정

### OpenAI

OpenAI는 다음과 같은 **일정 변경이 필요한 시점**에 사용합니다.

- 기본 일정 수정 추천
- 사용자 프롬프트 기반 일정 변경
- 여행 중 돌발상황 대응
- 컨디션 기반 일정 재구성

---

## 10. Project Setup Requirements

현재 작업 폴더에 **Vite 기반의 React 프로젝트**를 생성합니다.

### 작업 순서

1. 현재 작업 폴더의 상태를 먼저 확인합니다.
2. 기존 사용자 파일은 삭제하거나 덮어쓰지 않습니다.
3. React 프로젝트가 없다면 Vite 기반 React 프로젝트를 생성합니다.
4. 필요한 패키지를 설치합니다.
5. 아래 명시된 파일 구조를 기준으로 프로젝트를 구성합니다.
6. 빈 파일만 생성하지 않고 각 파일의 역할에 맞는 기본 코드를 작성합니다.
7. 모든 페이지가 React Router를 통해 정상적으로 이동하도록 구현합니다.
8. SCSS Modules를 사용하고, 공통 색상·글꼴·간격은 `_variables.scss`에서 관리합니다.
9. 공통 반응형 스타일은 `_mixins.scss`에 작성합니다.
10. 모바일, 태블릿, 데스크톱에 대응하는 반응형 디자인으로 구현합니다.
11. GSAP으로 페이지 진입, 헤더, 카드 등에 절제된 잡지 스타일 애니메이션을 적용합니다.
12. Firebase 설정값은 소스 코드에 직접 입력하지 않고 `.env` 환경변수로 관리합니다.
13. `.env.example` 파일을 만들고 필요한 환경변수 이름을 작성합니다.
14. Firebase 환경변수가 없어도 앱이 즉시 중단되지 않도록 안전하게 처리합니다.
15. 상품 데이터는 `products.json`에 예시 데이터를 작성하고 상품 목록과 상세 페이지에서 사용합니다.
16. 폼에는 접근 가능한 `label`과 기본적인 유효성 검사를 적용합니다.
17. 이미지가 없을 때 표시할 수 있는 대체 UI를 구현합니다.
18. 구현 완료 후 빌드 또는 실행 검증을 수행하고 오류가 있으면 수정합니다.
19. 마지막에는 실행 방법, Firebase 설정 방법, 주요 라우트와 구현 내용을 정리합니다.

---

## 11. Required Routes

초기 구현 시 아래 라우트는 필수로 구성합니다.

| Route | Page | Description |
|---|---|---|
| `/` | Home | 메인 페이지 |
| `/products` | Products | 여행 상품 목록 |
| `/products/:productId` | ProductDetailPage | 여행 상품 상세 |
| `/travel-planner` | TravelPlanner | AI 여행 추천 / 여행 설문 |
| `/login` | Login | 로그인 / 회원가입 |
| `/my` | MyPage | 회원 전용 마이페이지 |
| `/plans` | Plans | 회원 전용 저장 여행 계획 |
| `/event` | Event | 이벤트 |
| `/contact` | Contact | 고객센터 / 문의 |
| `*` | NotFound | 존재하지 않는 경로 처리 |

> 존재하지 않는 경로는 홈으로 이동시키거나 간단한 404 화면을 표시합니다.

`/my`와 `/plans`는 `ProtectedRoute`로 보호되며 비로그인 사용자는 `/login`으로 이동합니다. 로그인 화면에서 로그인과 회원가입 모드를 모두 제공합니다.

---

## 12. Required Project Structure

초기 구현 단계에서는 아래 구조를 기준으로 구성합니다.

```text
src/
├─ assets/
│  ├─ images/
│  └─ videos/
│
├─ components/
│  ├─ Header.jsx
│  ├─ Header.module.scss
│  ├─ Footer.jsx
│  ├─ Footer.module.scss
│  ├─ ProductCard.jsx
│  ├─ ProductCard.module.scss
│  ├─ ProductDetail.jsx
│  ├─ ProductDetail.module.scss
│  ├─ TravelForm.jsx
│  ├─ TravelForm.module.scss
│  ├─ RecommendationResult.jsx
│  ├─ RecommendationResult.module.scss
│  ├─ Loading.jsx
│  ├─ Loading.module.scss
│  └─ ProtectedRoute.jsx
│
├─ pages/
│  ├─ Home.jsx
│  ├─ Home.module.scss
│  ├─ Products.jsx
│  ├─ Products.module.scss
│  ├─ ProductDetailPage.jsx
│  ├─ ProductDetailPage.module.scss
│  ├─ TravelPlanner.jsx
│  ├─ TravelPlanner.module.scss
│  ├─ Plans.jsx
│  ├─ Plans.module.scss
│  ├─ Event.jsx
│  ├─ Event.module.scss
│  ├─ Contact.jsx
│  ├─ Contact.module.scss
│  ├─ Login.jsx                 # 로그인 및 회원가입 화면
│  ├─ Auth.module.scss
│  ├─ MyPage.jsx                # 로그인 회원 전용 마이페이지
│  ├─ NotFound.jsx
│  └─ Page.module.scss
│
├─ services/
│  ├─ aiService.js
│  ├─ authService.js
│  └─ firestoreService.js
│
├─ firebase/
│  ├─ config.js
│  └─ firestore.js
│
├─ hooks/
│  ├─ useAuth.js
│  └─ useTravelRecommendation.js
│
├─ context/
│  ├─ AuthContext.jsx
│  └─ auth-context.js
│
├─ data/
│  └─ products.json
│
├─ styles/
│  ├─ _variables.scss
│  ├─ _mixins.scss
│  └─ reset.scss
│
├─ utils/
│  └─ validators.js
│
├─ App.jsx
├─ App.module.scss
└─ main.jsx
```

프로젝트 루트에는 다음 파일을 함께 구성합니다.

```text
L-CODE/
├─ src/
├─ public/
├─ .env
├─ .env.example
├─ .gitignore
├─ package.json
├─ vite.config.js
└─ README.md
```

---

## 13. Implementation Details

### Header

`Header`에는 다음 기능을 구현합니다.

- L:CODE 로고
- 주요 페이지 내비게이션
- 현재 페이지 상태 표시
- 모바일 메뉴 대응
- GSAP을 활용한 절제된 등장 애니메이션

### Footer

`Footer`에는 다음 내용을 포함합니다.

- 서비스 정보
- 주요 메뉴 링크
- 고객센터 / Contact 링크
- 저작권 문구

### Home

`Home`은 여행 잡지의 표지와 목차를 결합한 형태로 구성합니다.

- 잡지 표지처럼 구성된 Hero Section
- 추천 여행지
- 대표 여행상품
- Editor's Pick
- 이벤트
- 여행 필수템
- Journal 콘텐츠

### Products

`products.json` 데이터를 이용해 상품 목록을 표시합니다.

- 상품 목록
- 기본 필터 UI
- 국가 / 지역 필터
- 추천순 등 기본 정렬
- 상품 카드
- 이미지가 없을 경우 대체 UI

`ProductCard`를 클릭하면 `/products/:productId`로 이동합니다.

### ProductDetailPage

URL의 `productId`를 기준으로 `products.json`에서 데이터를 조회합니다.

- 대표 이미지
- 상품명
- 여행 기간
- 지역
- 여행 스타일
- 상품 소개
- 일정 요약

상품을 찾지 못한 경우 안내 화면을 표시합니다.

### TravelPlanner

여행 추천을 위한 폼을 구성합니다.

초기 구현 폼 항목:

- 목적지
- 예산
- 여행 기간
- 인원
- 관심사

실제 L:CODE 서비스에서는 이후 아래 항목으로 확장할 수 있습니다.

- 국가
- 날짜
- 동행 유형
- 여행 스타일
- 여행 속도

각 입력에는 접근 가능한 `label`을 연결하고 기본적인 유효성 검사를 적용합니다.

### useTravelRecommendation

`useTravelRecommendation`에서 다음 상태를 관리합니다.

- 추천 요청
- Loading
- Success
- Error

실제 OpenAI API가 준비되지 않은 개발 초기에는 `aiService.js`에 교체 가능한 **Mock 응답**을 구현합니다.

```js
// TODO: 실제 OpenAI API 연동 시 서버 또는 서버리스 함수 요청으로 교체
```

### AI Service

OpenAI API는 브라우저에서 직접 호출하지 않는 것을 원칙으로 합니다.

개발 단계:

```text
TravelForm
   ↓
useTravelRecommendation
   ↓
aiService.js
   ↓
Mock Recommendation
```

실제 연동 단계:

```text
TravelForm
   ↓
useTravelRecommendation
   ↓
Server / Serverless Function
   ↓
OpenAI API
   ↓
Recommendation Result
```

### Plans

`Plans`에서는 Firestore에 저장된 사용자 여행 계획을 조회할 수 있는 기본 구조를 작성합니다.

- 여행 일정 목록
- 일정 데이터 Loading
- Empty State
- Error State
- 일정 상세 이동 확장 가능 구조

### Firebase Authentication

`AuthContext`와 `useAuth`를 연결하여 Firebase 로그인 상태를 앱 전체에서 사용할 수 있도록 구성합니다.

`authService.js`에는 최소한 다음 함수의 기본 구조를 작성합니다.

- 로그인
- 로그아웃
- 사용자 상태 확인

### Firestore

`firestoreService.js`에는 최소한 다음 기능의 기본 구조를 작성합니다.

- 여행 일정 저장
- 여행 일정 목록 조회
- 여행 일정 단일 조회

향후 아래 데이터 저장 기능으로 확장합니다.

- 찜한 장소
- 찜한 상품
- 장바구니
- 주문
- 쿠폰
- 사용자 설정

### Event

`Event`는 단순 기능 페이지가 아닌 잡지 스타일의 이벤트 콘텐츠로 구성합니다.

대표 콘텐츠:

**여행 짐싸고, 쿠폰 받자!**

- 이벤트 Hero
- 참여 방법
- 게임 소개
- 경품 안내
- 참여 버튼
- 향후 게임 기능 연결

### Contact

`Contact`에는 다음 내용을 포함합니다.

- L:CODE 서비스 안내
- FAQ
- 문의 방법
- 운영 안내

다른 페이지와 동일한 Editorial Magazine 스타일을 유지합니다.

---

## 14. Environment Variables

Firebase 및 외부 API 설정값은 소스 코드에 직접 작성하지 않고 `.env` 환경변수로 관리합니다.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_GOOGLE_MAPS_API_KEY=
```

`.env.example`에도 동일한 변수명을 작성하되 실제 키 값은 포함하지 않습니다.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_GOOGLE_MAPS_API_KEY=
```

> Firebase 비밀키나 실제 API 키를 임의로 생성하지 않습니다.

> OpenAI API 키는 브라우저 코드에 직접 노출하지 않습니다. 실제 배포 단계에서는 서버 또는 서버리스 함수에서 OpenAI 요청을 처리합니다.

Firebase 환경변수가 설정되지 않은 개발 환경에서도 앱 전체가 즉시 종료되지 않도록 예외 처리를 적용합니다.

---

## 15. Development Rules

- 현재 작업 폴더의 기존 구조를 먼저 확인합니다.
- 기존 사용자 파일을 임의로 삭제하거나 덮어쓰지 않습니다.
- 기존 프로젝트와 충돌할 경우 구조를 분석한 뒤 안전하게 통합합니다.
- React 프로젝트가 없는 경우에만 Vite 기반 React 프로젝트를 생성합니다.
- 모든 페이지는 React Router를 통해 이동합니다.
- 페이지 및 UI는 컴포넌트 단위로 분리합니다.
- 스타일은 SCSS Modules를 사용합니다.
- 공통 컬러, 글꼴, 간격은 `_variables.scss`에서 관리합니다.
- 공통 반응형 코드는 `_mixins.scss`에서 관리합니다.
- Mobile / Tablet / Desktop에 대응합니다.
- GSAP 애니메이션은 잡지 스타일을 해치지 않도록 절제해서 사용합니다.
- 폼 요소에는 접근 가능한 `label`과 기본 유효성 검사를 적용합니다.
- 콘텐츠에 적합한 시맨틱 HTML을 사용합니다.
- 이미지가 없을 경우 CSS 또는 별도 Placeholder UI를 제공합니다.
- 외부 이미지 URL에 과도하게 의존하지 않습니다.
- Firebase 환경변수가 없어도 앱 전체가 즉시 중단되지 않도록 처리합니다.
- 외부 API 오류, Loading, Empty State를 각각 처리합니다.
- 실제 AI API가 준비되지 않은 경우 Mock 데이터를 사용하고 TODO를 명확히 표시합니다.
- 사용하지 않는 import를 제거합니다.
- 불필요한 `console.log`를 제거합니다.
- 문법 오류와 콘솔 오류가 없도록 정리합니다.
- 구현 완료 후 `npm run build` 또는 개발 서버 실행을 통해 검증합니다.

---

## 16. Design Guidelines

### Typography

- Hero 및 Section Title: 큰 Serif Font
- Body: 가독성이 높은 Sans-serif Font
- Label / Caption: Letter Spacing을 활용한 Editorial Style

### Layout

- 넓은 여백
- 비대칭 Grid
- 큰 이미지 영역
- 콘텐츠 간 명확한 계층
- 잡지 지면처럼 Section Number 활용

예시:

```text
01 / UPCOMING
02 / EDITOR'S PICK
03 / DESTINATIONS
04 / EVENT
05 / ESSENTIALS
06 / JOURNAL
```

### Color

기본 방향:

- Ivory
- Paper White
- Deep Ink
- Black
- Sand
- Warm Neutral

### Motion

GSAP은 아래 영역을 중심으로 제한적으로 활용합니다.

- 페이지 진입
- Header 등장
- Hero Text
- Section Title
- Product Card
- Scroll Reveal

과도한 Parallax, Rotation, Bounce 효과는 사용하지 않고 고급 잡지 스타일에 맞는 부드러운 움직임을 적용합니다.

---

## 17. Development Plan

### Phase 1. Planning

- 시장 및 사용자 문제 분석
- 경쟁 서비스 분석
- 핵심 기능 정의
- 사용자 플로우 설계
- 기능 명세서 작성

### Phase 2. UX / UI Design

- 와이어프레임 제작
- Editorial Magazine 디자인 시스템 구축
- PC / Mobile 반응형 화면 설계
- 컴포넌트 및 상태 정의

### Phase 3. Project Setup

- 기존 폴더 구조 확인
- Vite + React 프로젝트 구성
- 필수 패키지 설치

```bash
npm install react-router-dom sass firebase gsap
```

- React Router 설정
- SCSS Modules 설정
- Firebase 기본 구조 설정
- `.env.example` 작성

### Phase 4. Frontend

- Header / Footer
- Home
- Products
- Product Detail
- Travel Planner
- Plans
- Event
- Contact
- 공통 Loading / Empty / Error UI
- GSAP 인터랙션 적용

### Phase 5. Data & Authentication

- Firebase Authentication
- Firestore 데이터 구조
- JSON 샘플 데이터 연결
- 상품 데이터 관리
- 여행 일정 저장 및 조회

### Phase 6. External API

- Google Maps
- Places
- Routes
- OpenAI 일정 수정 추천

### Phase 7. QA

- 모든 Route 이동 확인
- 상품 목록 / 상세 데이터 연결 확인
- 폼 Validation 확인
- 반응형 테스트
- 로그인 / 인증 테스트
- Firestore 예외 처리 확인
- AI Mock / 오류 처리 테스트
- 이미지 Placeholder 확인
- 콘솔 오류 확인
- Vercel 배포 테스트

---

## 18. Run Project

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

---

## 19. Firebase Setup

1. Firebase Console에서 프로젝트를 생성합니다.
2. Web App을 등록합니다.
3. Firebase Authentication을 활성화합니다.
4. Cloud Firestore를 생성합니다.
5. Firebase Web App 설정값을 확인합니다.
6. 프로젝트 루트에 `.env`를 생성합니다.
7. Firebase 값을 환경변수에 입력합니다.

```env
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

> 실제 키 값은 GitHub에 업로드하지 않습니다.

`.gitignore`에 `.env`가 포함되어 있는지 반드시 확인합니다.

---

## 20. Implementation Summary

초기 구현 완료 시 다음 항목을 확인합니다.

- Vite 기반 React 프로젝트 구성
- React Router 기반 페이지 이동
- SCSS Modules 적용
- Editorial Magazine 반응형 디자인
- Header / Footer
- Home
- Products
- ProductDetailPage
- TravelPlanner
- Plans
- Event
- Contact
- `products.json` 기반 상품 데이터
- Firebase Authentication 기본 구조
- Firestore 여행 일정 저장 / 조회 기본 구조
- AI Recommendation Mock 구조
- GSAP 기본 애니메이션
- Loading / Error / Empty State
- 이미지 Placeholder
- `.env.example`
- Build 검증

---

## 21. Future Improvements

- 실시간 날씨 API 연동
- 실시간 교통 / 대중교통 정보 강화
- 항공편 정보 연동
- 일정 공동 편집
- 동행자 초대
- AI 추천 히스토리
- 여행 중 현재 위치 기반 대체 장소 추천
- 사용자 리뷰 및 여행 저널 작성
- 여행 일정 공유
- 푸시 알림
- 쿠폰 / 이벤트 관리자 기능
- 쇼핑 상품 관리자 기능
- 결제 시스템 고도화
- 관리자 대시보드
- 여행 데이터 분석 및 개인화 추천

---

## 22. Final Development Request

프로젝트 구현 시 다음 원칙에 따라 **프로젝트 생성부터 구현과 검증까지 진행합니다.**

> 현재 작업 폴더에 Vite 기반의 React 프로젝트를 생성해 주세요.

단, 기존 파일이 존재하는 경우에는 먼저 현재 폴더 구조를 확인하고,  
기존 사용자 파일을 삭제하거나 덮어쓰지 않은 상태에서 안전하게 프로젝트를 통합합니다.

최종적으로 다음 항목이 정상적으로 동작하는 상태를 목표로 합니다.

```text
Vite + React
     ↓
React Router
     ↓
SCSS Modules
     ↓
Editorial UI
     ↓
Firebase Authentication
     ↓
Cloud Firestore
     ↓
JSON Product Data
     ↓
AI Recommendation
     ↓
GSAP Interaction
     ↓
Responsive Web
     ↓
Build Verification
```

구현 완료 후에는 다음 내용을 반드시 정리합니다.

1. 프로젝트 실행 방법
2. Firebase 설정 방법
3. 환경변수 설정 방법
4. 주요 Route
5. 주요 Component
6. JSON 데이터 연결 방식
7. Firestore 저장 / 조회 구조
8. AI Mock 또는 OpenAI 연결 위치
9. GSAP 적용 영역
10. 빌드 및 실행 검증 결과

---

## 23. 로그인, 회원가입, 마이페이지

### Firebase 인증 설정

1. `.env.example`을 복사하여 프로젝트 루트에 `.env`를 만듭니다.
2. Firebase Web App 설정값을 각 `VITE_FIREBASE_*` 환경변수에 입력합니다.
3. Firebase Console의 **Authentication → Sign-in method**에서 **이메일/비밀번호** 제공업체를 활성화합니다.
4. 개발 서버를 재시작합니다.

Firebase가 설정되지 않아도 공개 페이지와 AI Mock 추천은 실행되지만 로그인, 회원가입, 마이페이지 및 저장 일정 기능은 사용할 수 없습니다.

### 로그인과 회원가입

- `/login`에서 이메일과 비밀번호로 로그인합니다.
- 같은 화면에서 회원가입 모드로 전환할 수 있습니다.
- 회원가입에는 이름, 올바른 이메일, 6자 이상의 비밀번호가 필요합니다.
- 인증 상태는 `AuthContext`와 `useAuth`를 통해 앱 전체에 제공됩니다.
- 로그인 후에는 사용자가 처음 요청했던 보호 페이지로 이동합니다.

### 마이페이지 접근 제한

다음 라우트는 `ProtectedRoute`로 보호됩니다.

| Route | 기능 | 접근 권한 |
|---|---|---|
| `/my` | 회원 정보, 저장 여행, 찜한 장소, 주문 내역 | 로그인 회원만 가능 |
| `/plans` | 저장된 여행 일정 조회 | 로그인 회원만 가능 |

비로그인 사용자가 보호된 경로를 요청하면 `/login`으로 이동합니다. 인증 확인 중에는 로딩 화면을 표시하며, 마이페이지에서 로그아웃할 수 있습니다.

> 화면의 접근 제한만으로 Firestore 데이터가 보호되지는 않습니다. 실제 배포 환경에서는 Firestore Security Rules에도 `request.auth != null` 및 문서의 `userId == request.auth.uid` 조건을 적용해야 합니다.

---

## 24. Typography

- Hero, 섹션 제목, 상품명: **Maru Buri**
- 본문, 메뉴, 버튼, 폼: **Pretendard**
- 두 폰트는 `index.html`에서 jsDelivr 웹폰트로 불러옵니다.
- 웹폰트를 불러오지 못하면 `Noto Serif KR`, 시스템 산세리프 순으로 대체됩니다.
- 한글 가독성과 일관성을 위해 italic 스타일은 사용하지 않습니다.
- 실제 폰트 스택은 `src/styles/_variables.scss`에서 관리합니다.
