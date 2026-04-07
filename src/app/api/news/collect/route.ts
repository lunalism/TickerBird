// 뉴스 수집 메인 API Route Handler
// Cron Job에서 호출하여 RSS + 네이버 뉴스를 수집하고,
// Claude로 번역/요약 후 Supabase에 저장합니다.

import { createClient } from "@supabase/supabase-js";
import { fetchRssFeeds } from "@/lib/news/rss-parser";
import { fetchNaverNews } from "@/lib/news/naver-news";
import { fetchTrumpPosts } from "@/lib/news/trump-posts";
import { translateArticles, translateTrumpPosts } from "@/lib/news/claude-translator";
import type { RawArticle } from "@/lib/news/types";

export async function GET(request: Request) {
  // 인증: Vercel Cron 요청이거나 CRON_SECRET이 맞으면 허용
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const authHeader = request.headers.get("authorization");
  const isManualCall = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  if (!isVercelCron && !isManualCall) {
    return Response.json({ error: "인증 실패" }, { status: 401 });
  }

  try {
    // 1. RSS 수집
    let rssArticles: RawArticle[] = [];
    try {
      rssArticles = await fetchRssFeeds();
      console.log(`RSS 수집 완료: ${rssArticles.length}건`);
    } catch (error) {
      console.error("RSS 수집 전체 실패:", error);
    }

    // 2. 네이버 API 수집
    let naverArticles: RawArticle[] = [];
    try {
      naverArticles = await fetchNaverNews();
      console.log(`네이버 뉴스 수집 완료: ${naverArticles.length}건`);
    } catch (error) {
      console.error("네이버 뉴스 수집 전체 실패:", error);
    }

    // 3. 전체 합치기 + URL 기준 중복 제거
    const allArticles = [...rssArticles, ...naverArticles];
    const seen = new Map<string, RawArticle>();
    for (const article of allArticles) {
      if (!seen.has(article.url)) {
        seen.set(article.url, article);
      }
    }
    const uniqueArticles = Array.from(seen.values());
    console.log(`중복 제거 후: ${uniqueArticles.length}건`);

    if (uniqueArticles.length === 0) {
      return Response.json({
        success: true,
        collected: 0,
        saved: 0,
      });
    }

    // 4. Claude 번역/요약
    const translated = await translateArticles(uniqueArticles);
    console.log(`번역 완료: ${translated.length}건`);

    // 5. Supabase upsert (service_role 사용)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("articles")
      .upsert(translated, { onConflict: "source_url" })
      .select("id");

    if (error) {
      console.error("Supabase upsert 실패:", error);
      return Response.json(
        { error: "데이터 저장 실패", detail: error.message },
        { status: 500 }
      );
    }

    const savedCount = data?.length ?? 0;
    console.log(`기사 저장 완료: ${savedCount}건`);

    // 6. 트럼프 Truth Social 게시물 수집
    let trumpSaved = 0;
    try {
      const rawTrumpPosts = await fetchTrumpPosts();
      console.log(`트럼프 게시물 수집 완료: ${rawTrumpPosts.length}건`);

      if (rawTrumpPosts.length > 0) {
        // Claude 번역/요약
        const translatedTrump = await translateTrumpPosts(rawTrumpPosts);
        console.log(`트럼프 게시물 번역 완료: ${translatedTrump.length}건`);

        // 원본 데이터와 번역 결과 결합 후 upsert
        const trumpRows = rawTrumpPosts.map((post) => {
          const translated = translatedTrump.find((t) => t.post_id === post.post_id);
          return {
            post_id: post.post_id,
            content: post.content,
            content_ko: translated?.content_ko ?? null,
            summary_ko: translated?.summary_ko ?? null,
            post_url: post.post_url,
            posted_at: post.posted_at,
          };
        });

        const { data: trumpData, error: trumpError } = await supabase
          .from("trump_posts")
          .upsert(trumpRows, { onConflict: "post_id" })
          .select("id");

        if (trumpError) {
          console.error("트럼프 게시물 저장 실패:", trumpError);
        } else {
          trumpSaved = trumpData?.length ?? 0;
          console.log(`트럼프 게시물 저장 완료: ${trumpSaved}건`);
        }
      }
    } catch (error) {
      console.error("트럼프 게시물 수집 실패:", error);
    }

    // 7. 응답
    return Response.json({
      success: true,
      collected: uniqueArticles.length,
      saved: savedCount,
      trump_saved: trumpSaved,
    });
  } catch (error) {
    console.error("뉴스 수집 전체 실패:", error);
    return Response.json(
      { error: "뉴스 수집 중 오류 발생" },
      { status: 500 }
    );
  }
}
