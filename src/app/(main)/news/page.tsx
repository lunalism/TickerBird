// 뉴스 페이지 (서버 컴포넌트)
// 서버에서 articles + trump_posts를 병렬로 미리 조회하여
// 클라이언트 컴포넌트에 props로 전달합니다.

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import NewsPageClient from "./NewsPageClient";
import NewsModal from "@/components/news/NewsModal";

export const metadata: Metadata = {
  title: "뉴스",
};

export default async function NewsPage() {
  const supabase = await createClient();

  // 로그인 여부 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  const limit = isLoggedIn ? 50 : 10;

  // articles + trump_posts 병렬 조회
  const [articlesRes, trumpRes] = await Promise.all([
    supabase
      .from("articles")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(limit),
    supabase
      .from("trump_posts")
      .select("*")
      .order("posted_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <>
      <NewsPageClient
        initialArticles={articlesRes.data ?? []}
        initialTrumpPosts={trumpRes.data ?? []}
        isLoggedIn={isLoggedIn}
      />
      <NewsModal />
    </>
  );
}
