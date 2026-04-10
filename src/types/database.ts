/**
 * 데이터베이스 테이블 타입 정의
 * Supabase 데이터베이스의 각 테이블에 대응하는 TypeScript 타입입니다.
 */

/** 사용자 프로필 */
export interface Profile {
  /** 고유 ID (Supabase Auth의 user.id와 동일) */
  id: string;
  /** 이메일 주소 */
  email: string;
  /** 표시 이름 */
  display_name: string | null;
  /** 프로필 이미지 URL (profiles 테이블의 avatar 컬럼) */
  avatar: string | null;
  /** 사용자 역할 (일반 사용자, 관리자 등) */
  role: "user" | "admin";
  /** 생성 일시 */
  created_at: string;
  /** 수정 일시 */
  updated_at: string;
}

/** AI가 재작성한 뉴스 기사 */
export interface RewrittenNews {
  /** 고유 ID */
  id: string;
  /** 원본 뉴스 제목 */
  original_title: string;
  /** 원본 뉴스 URL */
  original_url: string;
  /** 원본 뉴스 출처 (언론사 등) */
  source: string;
  /** AI가 재작성한 제목 */
  rewritten_title: string;
  /** AI가 재작성한 본문 */
  rewritten_content: string;
  /** AI 요약 */
  summary: string;
  /** 관련 티커 심볼 목록 */
  tickers: string[];
  /** 관련 카테고리 */
  category: string;
  /** 원본 뉴스 발행 일시 */
  published_at: string;
  /** 생성 일시 */
  created_at: string;
  /** 수정 일시 */
  updated_at: string;
}

/** AI 생성 리포트 */
export interface Report {
  /** 고유 ID */
  id: string;
  /** 리포트 제목 */
  title: string;
  /** 리포트 본문 */
  content: string;
  /** 리포트 유형 (일간, 주간, 종목 분석 등) */
  report_type: "daily" | "weekly" | "stock_analysis" | "sector_analysis";
  /** 관련 티커 심볼 목록 */
  tickers: string[];
  /** 리포트 요약 */
  summary: string;
  /** 생성 일시 */
  created_at: string;
  /** 수정 일시 */
  updated_at: string;
}

/** 커뮤니티 게시글 */
export interface Post {
  /** 고유 ID */
  id: string;
  /** 작성자 ID (Profile.id 참조) */
  author_id: string;
  /** 게시글 제목 */
  title: string;
  /** 게시글 본문 */
  content: string;
  /** 관련 티커 심볼 목록 */
  tickers: string[];
  /** 카테고리 (자유, 분석, 질문 등) */
  category: "free" | "analysis" | "question" | "news_discussion";
  /** 좋아요 수 */
  likes_count: number;
  /** 댓글 수 */
  comments_count: number;
  /** 조회 수 */
  views_count: number;
  /** 생성 일시 */
  created_at: string;
  /** 수정 일시 */
  updated_at: string;
}

/** 댓글 */
export interface Comment {
  /** 고유 ID */
  id: string;
  /** 게시글 ID (Post.id 참조) */
  post_id: string;
  /** 작성자 ID (Profile.id 참조) */
  author_id: string;
  /** 부모 댓글 ID (대댓글인 경우) */
  parent_id: string | null;
  /** 댓글 내용 */
  content: string;
  /** 좋아요 수 */
  likes_count: number;
  /** 생성 일시 */
  created_at: string;
  /** 수정 일시 */
  updated_at: string;
}

/** 캘린더 이벤트 (경제 일정, 실적 발표 등) */
export interface CalendarEvent {
  /** 고유 ID */
  id: string;
  /** 이벤트 제목 */
  title: string;
  /** 이벤트 설명 */
  description: string | null;
  /** 이벤트 유형 (경제지표, 실적발표, 배당, IPO 등) */
  event_type: "economic" | "earnings" | "dividend" | "ipo" | "other";
  /** 관련 티커 심볼 */
  ticker: string | null;
  /** 이벤트 일시 */
  event_date: string;
  /** 중요도 (높음, 중간, 낮음) */
  importance: "high" | "medium" | "low";
  /** 생성 일시 */
  created_at: string;
  /** 수정 일시 */
  updated_at: string;
}

/** 알림 */
export interface Notification {
  /** 고유 ID */
  id: string;
  /** 수신자 ID (Profile.id 참조) */
  user_id: string;
  /** 알림 제목 */
  title: string;
  /** 알림 내용 */
  message: string;
  /** 알림 유형 */
  type: "news" | "report" | "community" | "calendar" | "system";
  /** 읽음 여부 */
  is_read: boolean;
  /** 관련 리소스 URL (클릭 시 이동할 경로) */
  link: string | null;
  /** 생성 일시 */
  created_at: string;
}

/** 알림 설정 */
export interface NotificationSettings {
  /** 고유 ID */
  id: string;
  /** 사용자 ID (Profile.id 참조) */
  user_id: string;
  /** 뉴스 알림 활성화 여부 */
  news_enabled: boolean;
  /** 리포트 알림 활성화 여부 */
  reports_enabled: boolean;
  /** 커뮤니티 알림 활성화 여부 (댓글, 좋아요 등) */
  community_enabled: boolean;
  /** 캘린더 알림 활성화 여부 */
  calendar_enabled: boolean;
  /** 이메일 알림 활성화 여부 */
  email_enabled: boolean;
  /** 푸시 알림 활성화 여부 */
  push_enabled: boolean;
  /** 생성 일시 */
  created_at: string;
  /** 수정 일시 */
  updated_at: string;
}

/** 관심 종목 목록 */
export interface Watchlist {
  /** 고유 ID */
  id: string;
  /** 사용자 ID (Profile.id 참조) */
  user_id: string;
  /** 티커 심볼 (예: AAPL, TSLA) */
  ticker: string;
  /** 종목명 */
  name: string;
  /** 메모 */
  memo: string | null;
  /** 추가 일시 */
  created_at: string;
}

/** 관심 키워드 */
export interface InterestKeyword {
  /** 고유 ID */
  id: string;
  /** 사용자 ID (Profile.id 참조) */
  user_id: string;
  /** 키워드 */
  keyword: string;
  /** 활성화 여부 */
  is_active: boolean;
  /** 생성 일시 */
  created_at: string;
}

/** 경제 용어집 (glossary 테이블) */
export interface GlossaryTerm {
  /** 용어 식별자 (영문 또는 한글 키, 예: "CPI", "신규실업수당청구") */
  id: string;
  /** 한글 풀네임 (예: "CPI 소비자물가지수") */
  term: string;
  /** 영문 풀네임 (예: "Consumer Price Index") */
  term_en: string;
  /** 한글 설명 (1~2 문장) */
  definition: string;
  /** 분류 (물가/고용/성장/통화정책/소비/경기/무역/부동산/외환) */
  category: string;
  /** 생성 일시 */
  created_at: string;
}
