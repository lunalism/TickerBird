// 경제 용어사전 페이지 (서버 컴포넌트)
// metadata만 정의하고, 데이터 페치/검색/필터 등 인터랙션은 클라이언트 컴포넌트에서 처리합니다.

import type { Metadata } from "next";
import GlossaryClient from "./GlossaryClient";

export const metadata: Metadata = {
  title: "용어사전 | Tickerbird",
  description:
    "미국 주요 거시 경제 지표(CPI · PCE · GDP · FOMC · ISM 등)를 한글로 풀이한 용어사전.",
};

export default function GlossaryPage() {
  return <GlossaryClient />;
}
