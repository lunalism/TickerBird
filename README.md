# 🐦 Tickerbird
### *Smart Investing Starts Here*

> AI가 분석하는 한국·미국 주식 금융 뉴스 플랫폼.
> 복잡한 시장 정보를 한눈에, 투자 인사이트를 더 빠르게.

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

🌐 **[tickerbird.me](https://tickerbird.me)** — Closed Beta

---

## 📌 소개

**Tickerbird**는 개인 투자자를 위한 AI 기반 금융 뉴스 분석 플랫폼입니다.

쏟아지는 금융 뉴스 속에서 진짜 중요한 정보만 빠르게 파악하고,
AI가 분석한 인사이트를 바탕으로 더 나은 투자 결정을 내릴 수 있도록 돕습니다.

---

## ✨ 주요 기능

| | 기능 | 설명 |
|---|---|---|
| 📰 | **AI 뉴스 분석** | 뉴스 자동 요약, 감성 분석 (긍정/중립/부정), 관련 종목 태깅 |
| 📊 | **AI 리포트** | 일간·주간 시황 리포트, 종목별 AI 분석 리포트 자동 생성 |
| 💬 | **커뮤니티** | 투자자 간 인사이트 공유, 종목 토론, 분석 공유 |
| 📅 | **경제 캘린더** | 한국·미국 경제지표 및 기업 실적 발표 일정 |
| 🔔 | **스마트 알림** | 관심 키워드 뉴스 알림, 경제 지표 발표 알림 |
| ⭐ | **관심 종목** | 한국·미국 관심 종목 등록 및 관련 뉴스 모아보기 |

---

## 🌍 지원 시장

| 현재 지원 | 추후 예정 |
|-----------|----------|
| 🇰🇷 한국 (KOSPI / KOSDAQ) | 🇯🇵 일본 (TSE) |
| 🇺🇸 미국 (NYSE / NASDAQ) | 🇭🇰 홍콩 (HKEX) |

---

## 💎 요금제

| 기능 | Free | Premium |
|------|:----:|:-------:|
| 뉴스 피드 | ✅ | ✅ |
| AI 뉴스 요약 | 하루 5건 | 무제한 |
| AI 감성 분석 | ❌ | ✅ |
| 관심 키워드 | 3개 | 무제한 |
| 일간 시황 리포트 | 최근 3개 | 무제한 |
| 종목 분석 리포트 | 월 3회 | 무제한 |
| 리포트 저장 | ❌ | ✅ |
| 캘린더 알림 | 3개 | 무제한 |
| 커뮤니티 | ✅ | ✅ |

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Database / Auth** | Supabase (PostgreSQL + Auth) |
| **상태관리** | Zustand |
| **AI** | Claude API (Anthropic) |
| **아이콘** | Lucide React |
| **날짜 처리** | date-fns |
| **배포** | Vercel |

---

## 🚀 시작하기

### 요구사항
- Node.js 18.17+
- npm

### 설치 및 실행

```bash
# 1. 클론
git clone https://github.com/lunalism/tickerbird.git
cd tickerbird

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 값 입력

# 4. 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인

### 환경변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=your_anthropic_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/          # 인증 페이지 (로그인)
│   ├── (main)/          # 메인 페이지 (뉴스, 리포트, 커뮤니티 등)
│   ├── api/             # API Routes
│   └── admin/           # 어드민 페이지
├── components/
│   ├── ui/              # shadcn/ui 기본 컴포넌트
│   ├── layout/          # 레이아웃 (사이드바, 헤더)
│   ├── features/        # 기능별 컴포넌트
│   └── common/          # 공통 컴포넌트
├── lib/
│   ├── supabase/        # Supabase 클라이언트 설정
│   └── utils/           # 유틸리티 함수
├── hooks/               # Custom Hooks
├── stores/              # Zustand 스토어
├── types/               # TypeScript 타입 정의
└── constants/           # 상수 정의
```

---

## 📄 라이선스

Private Repository — All rights reserved.

---

*Built with ❤️ for Korean & Global Investors*
