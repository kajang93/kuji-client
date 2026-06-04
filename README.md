# 🎮 이치방쿠지 (一番くじ) 웹 애플리케이션

> **"당신의 행운을 실시간으로 확인하세요!"**  
> 본 프로젝트는 일본의 인기 복권 서비스인 '이치방쿠지'를 웹으로 완벽히 재현한 프리미엄 뽑기 서비스입니다.  
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

### Phase 1: 기반 구축 (완료 ✅)
- [x] 프론트엔드 프리미엄 UI/UX 테마 구축
- [x] Spring Boot 기반 REST API 및 DB 스키마 설계
- [x] 카카오 소셜 로그인 및 JWT 보안 적용
- [x] 핵심 애니메이션 엔진(드래그 뜯기) 구현

### Phase 2: 상거래 핵심 로직 연동 (완료 ✅)
- [x] 백엔드 실시간 재고 차감 및 당첨 이력 저장 연동
- [x] 사용자 보관함 및 배송 신청 시스템 연동
- [x] **경량 주소 검색**: 카카오/다음 우편번호 API CDN 온디맨드 로딩 구현
- [x] **결제 시스템 연동**: 토스페이먼츠 PG 카드 결제 및 포인트 충전 구현
- [ ] **상태 자동화**: 택배사 API 연동을 통한 실시간 배송 추적 자동 업데이트

### Phase 3: 커뮤니티 및 고도화 (진행 중 🚀)
- [x] **커뮤니티 상호작용**: 게시글 좋아요, 찜하기(Wishlist), 실시간 댓글 CRUD 연동
- [x] **당첨 인증 및 공유 기능**: 당첨 증서(Certificate) 및 게시판 SNS 공유 기능
- [x] **실시간 알림**: FCM 기반의 배송 시작, 재입고 알림, 문의 답변 푸시 알림
- [x] **관리자 통계 2.0**: ApexCharts를 활용한 매출 분석 및 인기 상품 통계 시각화 연동 완료
- [ ] **다국어 지원**: 일본 본토 시장 및 글로벌 대응을 위한 i18next 적용
- [ ] **PWA/모바일 앱**: 하이브리드 앱 전환을 통한 푸시 알림 및 카메라 접근성 강화

### Phase 4: AI 통합 (예정 🤖)
- [ ] **개인화 추천 엔진**: 사용자 행동 데이터 기반 GPT-4o 뽑기 추천 API 연동
- [ ] **AI 고객지원 챗봇**: LLM 기반 자동 응답 + 에스컬레이션 플로우 구현
- [ ] **당첨 확률 인사이트 UI**: 실시간 재고 기반 AI 체감 확률 시각화 위젯
- [ ] **수요 예측 대시보드**: 판매 추이 AI 분석 및 품절 예상 알림 (관리자/사업자 전용)
- [ ] **GPT Vision 상품 등록 보조**: 이미지 업로드 시 상품명/등급/특징 자동 초안 생성

### 보완 작업 (Pending Tasks) 📝
- [ ] **회원가입 시 SMS 인증 연동**: 회원가입 폼 내부에 Aligo 기반 본인인증(SMS) 타이머 UI 및 검증 로직 추가 (발신번호 승인 후 진행 예정)
- [x] **사업자/어드민 대시보드 실데이터 연동**: `BusinessDashboard.tsx`, `AdminDashboard.tsx`의 매출 통계 차트 및 배송 대기 건수를 실제 DB 통계 API와 연동
- [x] **앱/프로덕션 배포 시 환경 설정**: CORS 고도화 및 `.env` 파일의 `VITE_API_BASE_URL`을 실서버 IP로 고정하여 구동되도록 세팅

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
