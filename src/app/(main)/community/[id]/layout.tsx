// 커뮤니티 게시글 상세 페이지 SEO metadata 전용 layout
// 자식 page.tsx가 "use client"라 metadata를 export 할 수 없어
// 이 layout에서 메타데이터만 분리해 정의합니다.

import type { Metadata } from "next";

export const metadata: Metadata = {
  // 부모 community/layout.tsx의 absolute 제목을 덮어씁니다.
  // 루트 layout의 title.template("%s | Tickerbird")이 이중 적용되지 않도록 absolute로 지정합니다.
  title: { absolute: "게시글 | 커뮤니티 | Tickerbird" },
  description: "커뮤니티 게시글 상세 보기",
  openGraph: {
    title: "게시글 | 커뮤니티 | Tickerbird",
    description: "커뮤니티 게시글 상세 보기",
  },
};

// 자식 페이지를 그대로 통과시키는 pass-through layout
export default function CommunityPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
