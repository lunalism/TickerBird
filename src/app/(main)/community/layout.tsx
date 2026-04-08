// 커뮤니티 페이지 SEO metadata 전용 layout
// page.tsx가 "use client"라 metadata를 export 할 수 없어
// 이 layout에서 메타데이터만 분리해 정의합니다.

import type { Metadata } from "next";

export const metadata: Metadata = {
  // 루트 layout의 title.template("%s | Tickerbird")이 적용되지 않도록
  // absolute로 지정해 중복("... | Tickerbird | Tickerbird")을 방지합니다.
  title: { absolute: "커뮤니티 | Tickerbird" },
  description: "주식 투자자들의 자유로운 토론 공간",
  openGraph: {
    title: "커뮤니티 | Tickerbird",
    description: "주식 투자자들의 자유로운 토론 공간",
  },
};

// 자식 페이지를 그대로 통과시키는 pass-through layout
export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
