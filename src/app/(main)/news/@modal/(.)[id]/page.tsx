// 뉴스 모달 페이지 (Intercepting Route)
// 뉴스 리스트에서 클릭 시 모달로 표시됩니다.

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewsModal from "@/components/news/NewsModal";
import NewsDetailContent from "@/components/news/NewsDetailContent";

export default async function NewsModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 해당 기사 조회
  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !article) {
    notFound();
  }

  // 관련 뉴스 3개 조회 (같은 country, 현재 기사 제외)
  const { data: relatedArticles } = await supabase
    .from("articles")
    .select("*")
    .eq("country", article.country)
    .neq("id", id)
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <NewsModal>
      <NewsDetailContent
        article={article}
        relatedArticles={relatedArticles ?? []}
      />
    </NewsModal>
  );
}
