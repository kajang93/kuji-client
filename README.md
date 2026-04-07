
# 💻 Kuji Client

> Kuji App의 프론트엔드 클라이언트입니다.  
> React + Vite 기반으로 PWA 및 Capacitor 하이브리드 앱까지 확장 가능한 구조를 가지고 있습니다.

---

## 📌 기술 스택

| 항목 | 기술 |
|------|------|
| **언어** | TypeScript |
| **프레임워크** | React 18.x |
| **빌드 툴** | Vite |
| **UI 스타일링** | CSS Modules (→ TailwindCSS 도입 예정) |
| **상태 관리** | useState / Context (→ Zustand or Recoil 도입 예정) |
| **인증 방식** | JWT + LocalStorage |
| **배포** | Vercel |

---

## 📂 프로젝트 구조

```bash
kuji-client/
└─ src/
   ├─ components/
   │  ├─ Sidebar.tsx          # 메뉴 및 유저 정보
   │  ├─ Login.tsx            # 통합 로그인 (카카오 + 이메일)
   │  ├─ SignUp.tsx           # 회원가입 (반응형/프리미엄 UI)
   │  ├─ TermsConsentModal.tsx # 약관 동의 팝업
   │  ├─ KakaoCallback.tsx    # 소셜 로그인 처리 센터
   │  └─ ...
   └─ App.tsx                 # 화면 전환 및 전체 상태 관리


```


## 🧩 주요 기능 흐름

| 단계 | 설명 |
|------|------|
| 1️⃣ | `MainScreen`에서 전체 쿠지 상품 리스트 확인 |
| 2️⃣ | `Login` 화면에서 카카오 또는 일반 이메일 로그인 |
| 3️⃣ | 신규 사용자의 경우 `TermsConsentModal`을 통해 필수 약관 동의 |
| 4️⃣ | 로그인 성공 후 `RoleType`에 따라 대시보드 또는 메인 화면 진입 |
| 5️⃣ | 상품 상세페이지에서 쿠지 뽑기(Gacha) 진행 |

---

## 🧠 상태 관리

- `MainLayout`이 앱의 상태를 전체적으로 관리 (`selectedAnimation`)
- 클릭 이벤트 기반으로 화면이 전환됨
- 나중에 전역 상태(Zustand or Redux) 도입 예정


---

## 🧱 실행 방법

### 🖥️ 개발 환경 실행

```bash
# 개발 서버 실행
npm install
npm run dev

# 백그라운드 실행 (선택)
npm run dev &
```

- 기본 URL: [http://localhost:5173](http://localhost:5173)

**`.env` 파일 예시**
```env
VITE_API_BASE_URL=http://localhost:8080
```

---

### 📦 빌드

```bash
npm run build
```

- 빌드 결과물: `/dist`
- **Vercel**에서 정적 배포 가능

---

### 🎨 디자인 가이드

| 항목 | 설명 |
|------|------|
| **폰트 / 컬러** | 기본 CSS 기준 → 추후 Tailwind Theme 적용 |
| **카드 레이아웃** | flex/grid 기반 정렬 |
| **상태 표시** | 남은 수량(글자색 구분), 가격 표시 |
| **반응형 디자인** | 모바일 / 데스크탑 대응 |
| **애니메이션 효과** | hover 시 scale 또는 shadow 효과 |

---

### 🧭 개발 계획

| 단계 | 기능 | 상태 |
|------|------|------|
| 1️⃣ | Vite + React 프로젝트 세팅 | ✅ 완료 |
| 2️⃣ | 카카오 소셜 로그인 연동 (OAuth 2.0) | ✅ 완료 |
| 3️⃣ | 일반 회원가입 및 로그인 기능 구현 | ✅ 완료 |
| 4️⃣ | 약관 동의 프로세스(Consent Flow) 구축 | ✅ 완료 |
| 5️⃣ | 프리미엄 UI 디자인 시스템 (Glassmorphism) | ✅ 완료 |
| 6️⃣ | 통합 로그인 및 권한별 리다이렉트 자동화 | 🔄 진행 중 |
| 7️⃣ | 쿠지(Gacha) 뽑기 애니메이션 및 로직 | ⏳ 예정 |
| 8️⃣ | 판매자/관리자 센터 대시보드 고도화 | ⏳ 예정 |

---

### ☁️ 배포 환경

| 구분 | 플랫폼 | 설명 |
|------|---------|------|
| **Frontend** | [Vercel](https://vercel.com) | 정적 빌드 자동 배포 |
| **Backend** | [Railway](https://railway.app) | API 통신 서버 |
| **환경변수** | `.env.production` | API BASE URL 등 |

---

### 🧑‍💻 개발자

**KyungAh Jang**  
Frontend Developer (React / TypeScript)  
📧 Email: [stars_ka@naver.com](mailto:stars_ka@naver.com)  
🐙 GitHub: [https://github.com/kajang93](https://github.com/kajang93)

---

> 💬 *이 클라이언트는 Kuji App의 사용자 인터페이스로,  
> React 컴포넌트 기반으로 구성되어 있으며 백엔드 REST API와 통신합니다.*
