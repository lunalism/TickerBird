// TradingView 경제 캘린더 위젯 (클라이언트 컴포넌트)
// 외부 스크립트가 부모 컨테이너 위치를 추적해 그 자리에 위젯을 렌더하므로
// next/script(head로 hoisting되어 부모 추적 불가) 대신 useEffect에서
// 직접 script 엘리먼트를 주입합니다. 이는 TradingView 임베드의 표준 React 패턴입니다.

"use client";

import { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import PageLoading from "@/components/ui/PageLoading";

/** TradingView 경제 캘린더 임베드 스크립트 URL */
const TRADINGVIEW_EVENTS_SCRIPT_SRC =
  "https://s3.tradingview.com/external-embedding/embed-widget-events.js";

export default function EconomicCalendarWidget() {
  // 다크모드 상태 (uiStore에서 구독)
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  // 테마 변경 시 내부 컴포넌트를 key로 강제 remount하여
  // 위젯/로딩 상태를 모두 깨끗하게 초기화합니다.
  // (effect 안에서 setState를 동기 호출하지 않기 위한 패턴)
  return (
    <CalendarWidgetInner key={isDarkMode ? "dark" : "light"} isDarkMode={isDarkMode} />
  );
}

interface CalendarWidgetInnerProps {
  isDarkMode: boolean;
}

function CalendarWidgetInner({ isDarkMode }: CalendarWidgetInnerProps) {
  // 위젯이 주입될 컨테이너 ref (React가 자식을 관리하지 않는 imperative 영역)
  const containerRef = useRef<HTMLDivElement>(null);

  // 스크립트 로드 완료 전까지 로딩 오버레이를 표시하기 위한 상태
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 안전망: 잔존 자식 정리 (StrictMode 더블 마운트 등 대비)
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // TradingView가 위젯을 mount할 placeholder div
    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    container.appendChild(widgetDiv);

    // 임베드 스크립트 — innerHTML에 config JSON을 담아야 위젯이 동작합니다
    const script = document.createElement("script");
    script.src = TRADINGVIEW_EVENTS_SCRIPT_SRC;
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      // 다크모드 상태에 따라 light/dark 전환
      colorTheme: isDarkMode ? "dark" : "light",
      isTransparent: false,
      width: "100%",
      height: "100%",
      locale: "kr",
      // 중요도 필터: 모두 표시 (낮음~높음)
      importanceFilter: "-1,0,1,2,3",
      // 국가 필터: 주요 G20 + 한국
      countryFilter:
        "ar,au,br,ca,cn,fr,de,in,id,it,jp,kr,mx,nz,ru,sa,za,tr,gb,us,eu",
    });
    // 스크립트 로드 완료 시점에 로딩 오버레이 제거
    // (위젯 자체 렌더는 약간 더 걸릴 수 있지만 체감상 충분)
    script.onload = () => setIsLoading(false);
    container.appendChild(script);

    // 언마운트 / 재실행 시 정리 — React가 컨테이너 자식을 관리하지 않으므로 직접 비움
    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [isDarkMode]);

  return (
    // 헤더(h-14=56px)와 탭바(h-16=64px)를 제외한 풀 높이로 위젯 표시
    // - 모바일: 100dvh - 헤더 - 탭바
    // - 데스크탑(md 이상): 사이드바 외 풀 높이
    <div className="relative h-[calc(100dvh-3.5rem-4rem)] w-full md:h-[100dvh]">
      {/*
        TradingView 위젯 컨테이너 — React가 자식을 관리하지 않도록 비워둠
        (useEffect에서 imperative하게 widgetDiv + script를 주입)
      */}
      <div
        ref={containerRef}
        className="tradingview-widget-container h-full w-full"
      />

      {/* 로딩 오버레이 — 스크립트 로드 완료 전까지 표시 */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <PageLoading variant="calendar" />
        </div>
      )}
    </div>
  );
}
