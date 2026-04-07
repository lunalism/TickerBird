// 뉴스 상세 풀페이지 (직접 접근용)
// URL 직접 접근이나 새로고침 시 사용됩니다.

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NewsDetailContent from "@/components/news/NewsDetailContent";

export default async function NewsDetailPage({
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
    <div className="mx-auto max-w-[700px] px-4 py-6 sm:px-6">
      {/* 뒤로가기 버튼 */}
      <Link
        href="/news"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        뉴스로 돌아가기
      </Link>

      <NewsDetailContent
        article={article}
        relatedArticles={relatedArticles ?? []}
      />
    </div>
  );
}
