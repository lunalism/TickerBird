// 경제 캘린더 페이지 — TradingView 위젯 임베드 진입점
// 위젯은 다크모드/외부 script 주입이 필요하므로 클라이언트 컴포넌트로 분리합니다.

import type { Metadata } from "next";
import EconomicCalendarWidget from "./EconomicCalendarWidget";

export const metadata: Metadata = {
  title: "경제 캘린더 | Tickerbird",
  description:
    "주요 경제지표 발표, 실적 발표, 중앙은행 회의 일정을 한눈에.",
};

export default function CalendarPage() {
  return <EconomicCalendarWidget />;
}
