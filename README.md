# 🎮 이치방쿠지 (一番くじ) 웹 애플리케이션

> **"당신의 행운을 실시간으로 확인하세요!"**  
> 본 프로젝트는 일본의 인기 복권 서비스인 '이치방쿠지'를 웹으로 완벽히 재현한 프리미엄 뽑기 서비스입니다.  
> React + Vite 기반의 고성능 클라이언트와 Spring Boot 백엔드가 결합된 현대적인 아키텍처를 지향합니다.

---

## 🚀 프로젝트 핵심 가치

- **Real Experience**: 실제 복권을 뜯는 듯한 2층 구조의 드래그 애니메이션 구현.
- **Premium Design**: Slate-Indigo 테마와 Rose-Amber 액센트 컬러를 활용한 세련된 다크 모드 UI.
- **Role-Based System**: 일반 고객, 사업자(판매자), 시스템 관리자별로 최적화된 대시보드 및 권한 관리.

---

## 🛠️ 기술 스택 (Tech Stack)

| 항목 | 기술 | 상세 내용 |
|------|------|------|
| **Frontend** | React 18.x | TypeScript 기반의 안정적인 UI 개발 |
| **Build Tool** | Vite | 초고속 HMR 및 빌드 성능 제공 |
| **Styling** | Tailwind CSS v4.0 | 최신 사양의 유틸리티 우선 CSS 프레임워크 |
| **Animation** | Motion (Framer) | 프리미엄 드래그 및 파티클 이펙트 |
| **Icons** | Lucide React | 세련되고 일관된 아이콘 시스템 |
| **Backend** | Spring Boot | RESTful API 및 보안 처리 (JWT) |

---

## 🗺️ 시스템 아키텍처 (ERD)

데이터베이스 설계는 확장성과 보안을 최우선으로 고려하였습니다.

### 주요 데이터 엔티티
- **사용자(USERS)**: 고객(Customer), 사업자(Business), 관리자(Admin) 유형 관리.
- **상품 시리즈(PRODUCT_SERIES)**: 원피스, 귀멸의칼날 등 개별 쿠지 판 정보.
- **상품 등급(PRIZES)**: A상(피규어)부터 H상(굿즈)까지의 상세 스펙 및 재고.
- **당첨 내역(WINNINGS)**: 실시간 당첨 결과 및 배송 상태(준비중/배송중/완료) 추적.
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
- **사업자 승인 시스템**: 사업자 가입 시 관리자의 승인이 완료된 후 대시보드 접근 가능 (Pending 상태 지원).
- **프로필 관리**: 닉네임 변경 및 프로필 이미지 업로드 기능.

### 2. 쿠지 뽑기 경험 (Kuji Experience)
- **실시간 재고**: 각 시리즈별 남은 쿠지 수량 실시간 동기화.
- **드래그 뜯기(Reveal)**: 실제 종이를 뜯는 듯한 드래그 제스처 기반 애니메이션. 
- **라스트 원(Last One) 효과**: 마지막 쿠지 뜯기 시 슬로우 모션 및 강력한 연출 추가.

### 3. 사업자 대시보드 (Seller Center)
- **상품 등록**: 쿠지 판 이름, 대표 이미지, A~H상별 수량 및 이미지 설정.
- **재고 대시보드**: 전체 상품의 판매 추이 및 재고 부족 알림(🟢 충분/🟡 부족/🔴 경고).
- **배송 관리**: 당첨자 목록 조회 및 운송장 번호 등록 기능을 통한 물류 관리.

### 4. 부가 기능
- **찜하기(Wishlist)**: 관심 있는 시리즈 실시간 저장 및 관리.
- **1:1 문의**: 상품 및 배송 관련 질의응답 시스템.
- **알림 설정**: 배송 시작, 문의 답변 등록 시 카카오톡/푸시 알림 연동.

---

## 📂 폴더 구조 (Project Structure)

```bash
kuji-client/
├─ src/
│  ├─ components/     # 주요 화면 및 재사용 가능한 UI 컴포넌트
│  │  ├─ KujiReveal.tsx   # 핵심 드래그 뜯기 엔진
│  │  ├─ Login.tsx        # 일반/사업자 통합 로그인
│  │  └─ ...
│  ├─ styles/         # 전역 CSS 및 Tailwind 설정
│  └─ App.tsx         # 전역 상태 및 라우팅 허브
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
`.env` 파일에 백엔드 API 주소를 설정합니다.
```env
VITE_API_BASE_URL=http://localhost:8080
```

---

### 🧑‍💻 개발자

**KyungAh Jang**  
Frontend Developer (React / TypeScript)  
📧 Email: [stars_ka@naver.com](mailto:stars_ka@naver.com)  
🐙 GitHub: [https://github.com/kajang93](https://github.com/kajang93)

---

> 본 문서는 프로젝트의 **'단일 진실 공급원(Single Source of Truth)'**으로 사용됩니다.  
> 모든 기능과 디자인 가이드는 이 문서에 최신화됩니다.
