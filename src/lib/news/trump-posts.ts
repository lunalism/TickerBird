// CNN 아카이브에서 트럼프 Truth Social 게시물 수집
// HTML 태그 제거 후 최신 10개를 반환합니다.

import type { RawTrumpPost } from "./types";

// CNN이 운영하는 Truth Social 아카이브 JSON
const ARCHIVE_URL = "https://ix.cnn.io/data/truth-social/truth_archive.json";

/** HTML 태그 제거 (<p>, <a>, <br> 등) */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** CNN 아카이브에서 트럼프 게시물을 가져옵니다 (최신 10개) */
export async function fetchTrumpPosts(): Promise<RawTrumpPost[]> {
  const response = await fetch(ARCHIVE_URL, {
    headers: { "User-Agent": "TickerBird/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Truth Social 아카이브 요청 실패: ${response.status}`);
  }

  const data: Array<{
    id: string;
    content: string;
    url: string;
    created_at: string;
  }> = await response.json();

  // created_at 기준 최신순 정렬 후 10개만 선택
  const sorted = data
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return sorted.map((post) => ({
    post_id: post.id,
    content: stripHtml(post.content),
    post_url: post.url,
    posted_at: post.created_at,
  }));
}
