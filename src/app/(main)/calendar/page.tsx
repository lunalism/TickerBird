// 경제 캘린더 페이지 (서버 컴포넌트)
// FRED API 연동 월간 달력뷰의 진입점입니다.
// - metadata: 페이지 타이틀/설명
// - 실제 UI는 클라이언트 상태(월 이동, 날짜 선택)가 필요하므로 CalendarClient에서 처리

import type { Metadata } from "next";
import CalendarClient from "./CalendarClient";

export const metadata: Metadata = {
  title: "경제 캘린더 | Tickerbird",
  description:
    "미국 주요 경제지표 발표 일정(CPI · 고용 · GDP · FOMC · 소매판매 · 무역수지)을 월간 달력으로 한눈에.",
};

export default function CalendarPage() {
  return <CalendarClient />;
}
