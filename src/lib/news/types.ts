// 뉴스 수집 공통 타입 정의

import type { Article } from "@/components/news/NewsCard";

/** RSS/네이버에서 수집한 원본 기사 */
export type RawArticle = {
  title: string;
  url: string;
  publishedAt: string;
  sourceName: string;
  country: "KR" | "US";
};

/** Claude 번역/요약 완료된 기사 (Supabase 저장용) */
export type TranslatedArticle = {
  title_ko: string;
  summary_ko: string;
  title_en: string;
  summary_en: string;
  source_url: string;
  source_name: string;
  country: "KR" | "US";
  published_at: string;
};

/** CNN 아카이브에서 수집한 트럼프 게시물 원본 */
export type RawTrumpPost = {
  post_id: string;
  content: string;
  post_url: string;
  posted_at: string;
};

/** Supabase trump_posts 테이블 레코드 */
export type TrumpPost = {
  id: string;
  post_id: string;
  content: string;
  content_ko: string;
  summary_ko: string;
  post_url: string;
  posted_at: string;
  created_at: string;
};

/** 뉴스 + 트럼프 게시물 통합 피드 아이템 */
export type FeedItem =
  | (Article & { itemType: "article" })
  | (TrumpPost & { itemType: "trump" });
