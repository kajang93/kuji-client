# 🎮 오시쿠지 (推しクジ) 웹 애플리케이션

> **"당신의 행운을 실시간으로 확인하세요!"**  
> 본 프로젝트는 일본의 인기 복권 서비스인 '오시쿠지'를 웹으로 완벽히 재현한 프리미엄 뽑기 서비스입니다.  
> React + Vite 기반의 고성능 클라이언트와 Spring Boot 백엔드가 결합된 현대적인 아키텍처를 지향합니다.

---

## 🚀 프로젝트 핵심 가치

- **Real Experience**: 실제 복권을 뜯는 듯한 2층 구조의 드래그 애니메이션 구현.
- **Premium Design**: Slate-Indigo 테마와 Rose-Amber 액센트 컬러를 활용한 세련된 다크 모드 UI.
- **Role-Based System**: 일반 고객, 사업자(판매자), 시스템 관리자별로 최적화된 대시보드 및 권한 관리.
- **Real Commerce**: 토스페이먼츠 PG 결제 및 실제 포인트 적립/차감 시스템 완비.
- **AI-Powered**: LLM 기반 개인화 추천, AI 고객지원, 수요 예측 등 AI를 서비스 전반에 통합.

---

## 🛠️ 기술 스택 (Tech Stack)

| 항목 | 기술 | 상세 내용 |
|------|------|------|
| **Frontend** | React 18.x | TypeScript 기반의 안정적인 UI 개발 |
| **Build Tool** | Vite | 초고속 HMR 및 빌드 성능 제공 |
| **Styling** | Tailwind CSS v4.0 | 최신 사양의 유틸리티 우선 CSS 프레임워크 |
| **Animation** | Motion (Framer) | 프리미엄 드래그 및 파티클 이펙트 |
| **Icons** | Lucide React | 세련되고 일관된 아이콘 시스템 |
| **결제** | 토스페이먼츠 SDK | PG 카드 결제 및 리다이렉트 플로우 |
| **알림** | Firebase FCM | 웹 푸시 포그라운드/백그라운드 알림 |
| **Toast** | Sonner | 비침습적 실시간 알림 UI |
| **AI / LLM** | OpenAI API (GPT-4o) | 개인화 추천, AI 챗봇, 수요 예측 |
| **Backend** | Spring Boot | RESTful API 및 보안 처리 (JWT) |

---

## 🗺️ 시스템 아키텍처 (ERD)

데이터베이스 설계는 확장성과 보안을 최우선으로 고려하였습니다.

### 주요 데이터 엔티티
- **사용자(USERS)**: 고객(Customer), 사업자(Business), 관리자(Admin) 유형 관리.
- **상품 시리즈(PRODUCT_SERIES)**: 원피스, 귀멸의칼날 등 개별 쿠지 판 정보.
- **상품 등급(PRIZES)**: A상(피규어)부터 H상(굿즈)까지의 상세 스펙 및 재고.
- **당첨 내역(WINNINGS)**: 실시간 당첨 결과 및 배송 상태(준비중/배송중/완료) 추적.
- **포인트(POINTS)**: 충전/사용/적립/환불 내역 관리 및 PG 결제 세션 연동.
- **고객 지원(INQUIRIES)**: 1:1 문의 및 관리자/판매자 답변 시스템.

---

## 🎨 디자인 시스템 (Design Guide)

### 컬러 팔레트 (Color Palette)
- **Background**: `Slate-900` ~ `Indigo-950` (심해의 신비로움을 주는 다크 모드)
- **Primary Accent**: `Rose-500` (열정과 행운의 컬러)
- **Secondary Accent**: `Amber-500` (승리와 보상의 컬러)
- **Success/Info**: `Teal-400` / `Indigo-500`

### 핵심 UI/UX 원칙
- **Micro-interactions**: 버튼 하나에도 부드러운 스케일링과 색상 변화 적용.
- **Visual Feedback**: 당첨 시 화려한 파티클 효과와 충격파 애니메이션으로 보상감 극대화.
- **Consistency**: 모든 컴포넌트에서 일관된 테두리 반경(`rounded-2xl`)과 블러(`backdrop-blur`) 효과 유지.

---

## ✨ 상세 기능 명세 (Detailed Features)

### 1. 인증 및 사용자 관리
- **통합 로그인**: 이메일/비밀번호 로그인 및 **카카오 OAuth 2.0** 소셜 로그인 지원.
- **안정적인 통신 로직**: 서버의 다양한 응답 형식(JSON, Plain Text)을 자동으로 판별하여 처리하는 견고한 API 레이어 구축.
- **실시간 데이터 동기화**: 로그인 즉시 포인트, 프로필, **개인 보관함(당첨 내역)** 자동 연동.
- **사업자 승인 시스템**: 관리자 승인 전용 대기 화면 및 권한 제어.

### 2. 쿠지 뽑기 경험 (Kuji Experience)
- **실시간 재고 엔진**: 백엔드 DB와 연동된 실시간 재고 차감 및 당첨 확률 계산.
- **드래그 뜯기(Reveal)**: 실제 종이를 뜯는 듯한 햅틱 감성의 드래그 애니메이션.
- **고유 이력 관리**: 모든 뽑기 결과에 고유 ID(`drawHistoryId`)를 부여하여 배송 및 분쟁 방지 기반 마련.

### 3. 포인트 충전 시스템 (Point Charge)
- **토스페이먼츠 PG 결제 연동**: 카드 결제를 통한 포인트 충전 (prepare → 결제창 → confirm 3단계 플로우).
- **프리셋 및 직접 입력**: 1만/3만/5만/10만원 프리셋 + 보너스 포인트 지급, 직접 금액 입력 지원.
- **충전 요약 카드**: 결제 전 충전 후 예상 포인트를 실시간으로 미리보기.
- **포인트 내역 탭**: 충전(CHARGE) / 사용(USE) / 적립(REWARD) / 환불(REFUND) 이력 조회.
- **리다이렉트 복구**: PG 결제 후 URL 파라미터(`?pointCharge=success/fail`)를 감지하여 결제 상태 자동 복구.

### 4. 상거래 및 물류 시스템 (Commerce & Logistics)
- **스마트 보관함**: 서버에 저장된 당첨 내역을 실시간으로 불러오고, 등급별 옵션(버전/색상) 선택 지원.
- **지능형 배송 신청**:
    - 동일 판매자의 상품을 자동으로 인식하여 **묶음 배송** 신청 가능.
    - 카카오/다음 우편번호 API CDN 온디맨드 로딩을 활용한 **경량화 주소 검색** 연동.
    - 수령인 정보, 주소, 배송 메시지 등 상세 배송 폼 구현.
- **실시간 포인트**: 뽑기 시 즉시 포인트 적립 및 UI 실시간 반영.
- **물류 관리 및 상태 동기화**:
    - **백엔드 상태 결합**: 판매자가 운송장을 등록하면 `DrawHistory` 상태도 즉시 `SHIPPING`으로 동기화.
    - **운송장 유효성 검증**: 운송장 번호 미입력 건에 대한 오등록 및 비정상 완료 처리 차단.
    - **고객 직접 배송 확정**: 실제 수령한 고객이 마이페이지에서 직접 **[배송 확정]** 처리 — 신뢰성 강화.
    - **배송 현황 필터링 탭**: `전체 / 배송준비 / 배송중 / 완료` 상태별 서브 탭으로 다중 주문 현황 파악.
    - **동적 배송 추적**: 배송 상태에 따른 진행 단계 바(Stage 1~4) 및 타임라인 실시간 시각화.

### 5. 사업자 대시보드 (Seller Center)
- **상품 및 재고 관리**: 시리즈 등록, 등급별 이미지 및 수량 설정, 실시간 재고 모니터링.
- **물류 관리**: 사용자 배송 요청 확인 및 택배사/운송장 번호 등록 시스템.
- **문의 관리**: 구매자 1:1 문의 수신 및 답변 처리.

### 6. 커뮤니티 및 알림 (Community & Notification)
- **커뮤니티 게시판**: 게시글 작성/수정/삭제, 다중 이미지 업로드, 좋아요, 실시간 댓글 CRUD.
- **당첨 공유**: 당첨 증서(Certificate) 생성 및 SNS 공유 기능.
- **실시간 FCM 알림**: 배송 시작, 재입고, 문의 답변 등 웹 푸시 알림 수신.
- **알림 설정 동기화**: 알림 수신 항목별 토글 설정을 백엔드와 실시간 동기화.

### 7. AI 기능 (AI Features) 🤖
- **개인화 뽑기 추천**: 사용자의 뽑기 이력, 찜 목록, 장르 선호도를 분석해 GPT-4o 기반 맞춤형 쿠지 추천 제공.
- **AI 고객지원 챗봇**: 자주 묻는 배송/환불/뽑기 규정 질문에 LLM이 자동 응답, 복잡한 문의는 담당자에게 자동 에스컬레이션.
- **당첨 확률 인사이트**: 남은 재고 데이터를 기반으로 각 등급의 현재 체감 당첨 확률을 AI가 실시간 계산하여 표시.
- **수요 예측 & 재고 알림**: 판매 추이를 AI로 분석하여 품절 예상 시점을 예측하고 사전 알림 발송.
- **AI 상품 설명 생성**: 사업자가 상품 이미지를 업로드하면 GPT Vision이 상품명/등급/특징을 자동으로 초안 생성.

---

## 📅 프로젝트 로드맵 (Roadmap)

본 프로젝트는 단순한 뽑기 시뮬레이터를 넘어, 완벽한 커머스 플랫폼으로의 진화를 목표로 합니다.

### 기반 구축 (완료 ✅)
- 프론트엔드 프리미엄 UI/UX 테마 구축
- Spring Boot 기반 REST API 및 DB 스키마 설계
- 카카오 소셜 로그인 및 JWT 보안 적용
- 핵심 애니메이션 엔진(드래그 뜯기) 구현
- CI/CD 자동화 (GitHub Actions를 통한 자동 AWS 배포 파이프라인 구축)

### 상거래 핵심 로직 연동 (완료 ✅)
- 백엔드 실시간 재고 차감 및 당첨 이력 저장 연동
- 사용자 보관함 및 배송 신청 시스템 연동 (택배사 연동 및 UI/UX 고도화)
- **경량 주소 검색**: 카카오/다음 우편번호 API CDN 온디맨드 로딩 구현
- **결제 시스템 연동**: 토스페이먼츠 PG 카드 결제 및 결제 승인 시 보너스 포인트 연동
- **상태 자동화**: Delivery Tracker API 연동을 통한 실시간 배송 추적 자동 업데이트

### 커뮤니티 및 소셜 기능 고도화 (진행 중 🚀)
- **커뮤니티 상호작용**: 게시글 좋아요, 찜하기(Wishlist), 실시간 댓글 CRUD 연동
- **당첨 인증 및 공유 기능**: 당첨 증서(Certificate) 및 게시판 SNS 공유 기능
- **실시간 알림**: FCM 기반의 배송 시작, 재입고 알림, 문의 답변 푸시 알림
- **관리자 통계 2.0**: ApexCharts를 활용한 매출 분석 및 인기 상품 통계 시각화 연동 완료
- **통합 소셜 로그인 확장**: 기존 카카오 로그인에 이어 **네이버 로그인(Implicit Grant)** 및 **구글 로그인(OAuth 2.0)** 프론트엔드 연동 완료
- **가맹점 모집 브로셔 구축**: 카카오톡 피드 템플릿(Kakao Link API)을 연동한 공유하기, 클립보드 복사, 마우스 호버 네온 글로우 애니메이션이 적용된 반응형 브로셔 페이지(`brochure.html`) 제작
- **다국어 지원**: 일본 본토 시장 및 글로벌 대응을 위한 i18next 적용

### AI 통합 (예정 🤖)
- **개인화 추천 엔진**: 사용자 행동 데이터 기반 GPT-4o 뽑기 추천 API 연동
- **AI 고객지원 챗봇**: LLM 기반 자동 응답 + 에스컬레이션 플로우 구현
- **당첨 확률 인사이트 UI**: 실시간 재고 기반 AI 체감 확률 시각화 위젯
- **수요 예측 대시보드**: 판매 추이 AI 분석 및 품절 예상 알림 (관리자/사업자 전용)
- **GPT Vision 상품 등록 보조**: 이미지 업로드 시 상품명/등급/특징 자동 초안 생성

### 보완 작업 (Pending Tasks) 📝
- **인증 및 보안 고도화**: 아이디 찾기 시 고객/사업자 구분 토글 연동, OTP 인증 후 즉시 비밀번호 재설정 및 로그인 유저 비밀번호 변경 기능 통합 완료 ✅
- **상거래 기능 고도화**: 상품(쿠지)별 커스텀 적립 포인트 설정 기능 추가 및 구매 시 동적 적립금 계산 로직 완벽 연동 완료 ✅
- **회원가입 시 SMS 인증 연동**: 회원가입 시 Aligo 기반 본인인증(SMS) 로직 및 UI 연동 완료
- **앱/프로덕션 배포 시 환경 설정**: CORS 고도화 및 GitHub Actions Secrets 기반의 `ENV_FILE` 주입 파이프라인으로 생산 배포 자동화 완료
- **랜덤 닉네임 자동 생성기**: 소셜 로그인 시 닉네임을 미설정한 유저를 위해 서버와 연동하여 트렌디한 **[형용사 + 명사(동물/단어)]** 조합의 랜덤 닉네임 자동 부여 기능 적용 완료 (예: 가챠에 진심인 다람쥐)
- **프론트엔드 이미지 최적화**: 10MB 용량 제한 예외 처리 및 `browser-image-compression`을 활용한 모바일 1MB 자동 압축 기능 적용
- **에러 핸들링 고도화**: API 응답 중 튀어나오는 원시 JSON 에러 데이터를 파싱하여, 순수 텍스트 메시지만 팝업창(Toast)에 노출되도록 헬퍼 전면 적용
- **AI 협업 컨벤션 동기화**: 프로젝트 최상단에 `.cursorrules` 전역 규칙 파일 도입으로 코드 스타일 및 순수 한글 커밋 룰 강제화 완료
- **운영 최적화 및 디버깅**: 판매자 상품 삭제 버튼 및 API 기능 연동, 메인 화면의 상품 목록 ACTIVE 상태 필터링 처리 완료
- **PWA 사용자 경험(UX) 고도화**: Safari Standalone 앱 모드에서 차단되는 브라우저 기본 새로고침을 대체하기 위해 커스텀 Pull-to-Refresh(아래로 당겨서 새로고침) 터치 제어 컴포넌트 연동 및 **왼쪽 끝에서 오른쪽으로 스와이프 시 '뒤로가기(Swipe-to-Go-Back)' 글로벌 제어 로직 전면 적용 완료**
- **사업자 상담 챗봇 고도화**: 가맹점 모집 브로셔 내 카카오톡 채널('쿠지샵') 실데이터 연동 및 문의 푸시 알림 수신 체계 확립
- **마이페이지 고도화**: 일반 유저 및 사업자 프로필에서 휴대폰, 생년월일, 주소 등 세부 정보 조회 및 수정이 정상적으로 연동되도록 폼 데이터 전송 및 응답 매핑 확장 완료 ✅
- **어드민 운영 도구 고도화**: 사업자 수수료 6개월 무료 혜택(선착순) 프로모션 관리 대시보드 구축 및 개별 사업자 기본 수수료율 제어 로직 통합 완료 ✅
- **사업자 운영 제어 로직**: 사업자 심사 중(isActive=false)인 경우 상품 상태를 임의로 '운영중(ACTIVE)'으로 변경하지 못하도록 토스트 에러 팝업 및 방어 로직 적용 완료 ✅
- **알림톡 시스템 분리**: 사업자 전용 알림톡 설정 항목(kakaoBizOrder, kakaoBizCancel, kakaoBizInquiry) 추가 및 프론트엔드 연동 완벽 분리 적용 완료 ✅
- **수수료 프로모션 관리**: 관리자(Admin) 패널에 수수료 프로모션 관리(AdminPromotionManagement) 화면 추가 및 UI 연동 완료 ✅
- **소셜 로그인 백엔드 테스트**: 새롭게 연동된 네이버 및 구글 로그인의 토큰 검증 및 가입 플로우 통합 엣지 케이스 테스트 진행

---

## 🛠 프론트엔드 리팩토링 로드맵 (Frontend Refactoring Roadmap)
현재 `App.tsx`에 집중된 모놀리식 구조를 현대적인 React 아키텍처로 개편하여 유지보수성 및 성능을 극대화합니다.

- **Routing Architecture**: `react-router-dom` 도입을 통한 페이지 분리 및 URL 라우팅 체계 구축
- **Global State Management**: `Zustand` 도입을 통한 전역 상태 관리 (유저 정보, 장바구니, 모달 제어 등) 및 Prop Drilling 제거
- **Server State Management**: `@tanstack/react-query` 도입을 통한 API 로딩, 캐싱, 에러 핸들링 및 서버 데이터 동기화 최적화
- **Code Splitting & Lazy Loading**: `React.lazy`와 `Suspense`를 활용한 페이지 단위 번들 스플리팅으로 초기 로딩 속도(FCP) 극대화
- **SEO & Meta Tags**: `react-helmet-async`를 도입하여 상품별 동적 타이틀 및 Open Graph 메타 태그 최적화

---

## 📂 폴더 구조 (Project Structure)

```bash
kuji-client/
├─ src/
│  ├─ api/                      # 🚀 서버 통신 센터 (중앙 집중식 관리)
│  │  ├─ client.ts              # 모든 요청의 헤더 및 인증 토큰 자동 삽입
│  │  ├─ auth.ts                # 로그인, 회원가입, 프로필 조회 전용
│  │  ├─ kuji.ts                # 뽑기판, 상품 상세, 뽑기 실행 전용
│  │  ├─ shipping.ts            # 배송 신청 및 배송 현황 조회 전용
│  │  ├─ points.ts              # 포인트 충전 준비/확정/내역 조회 전용
│  │  ├─ wishlist.ts            # 찜하기 토글 및 목록 조회
│  │  └─ firebase.ts            # FCM 포그라운드 메시지 핸들러
│  ├─ components/               # UI 컴포넌트 및 페이지 단위 모듈
│  │  ├─ KujiReveal.tsx         # 핵심 드래그 뜯기 엔진
│  │  ├─ WinningHistory.tsx     # 보관함 및 배송 신청 로직
│  │  ├─ PointCharge.tsx        # 포인트 충전 화면 (토스페이먼츠 연동)
│  │  ├─ DeliveryTracking.tsx   # 동적 배송 추적 시각화
│  │  └─ ...
│  ├─ shared-types.ts           # 백엔드와 합의된 전역 타입 정의
│  └─ App.tsx                   # 전역 상태 관리 및 비즈니스 로직 허브
└─ ...
```

---

## 🏃 도구 실행 및 개발

### 개발 서버 실행
```bash
npm install
npm run dev
```

### 환경 변수 설정
`.env` 파일에 아래 항목을 설정합니다.

```env
# 백엔드 API 주소
VITE_API_BASE_URL=http://localhost:8080

# 카카오 OAuth
VITE_KAKAO_REST_API_KEY=your_kakao_rest_api_key
VITE_KAKAO_CLIENT_SECRET=your_kakao_client_secret

# Firebase FCM
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

> ⚠️ `.env` 파일은 `.gitignore`에 포함되어 있으며 절대 커밋하지 마세요.

---

### 🧑‍💻 개발자

**KyungAh Jang**  
Frontend Developer (React / TypeScript)  
📧 Email: [stars_ka@naver.com](mailto:stars_ka@naver.com)  
🐙 GitHub: [https://github.com/kajang93](https://github.com/kajang93)

---

> 본 문서는 프로젝트의 **'단일 진실 공급원(Single Source of Truth)'**으로 사용됩니다.  
> 모든 기능과 디자인 가이드는 이 문서에 최신화됩니다.
