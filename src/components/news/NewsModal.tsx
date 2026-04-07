// 뉴스 모달 컴포넌트
// Zustand selectedItem을 구독하여 모달을 즉시 표시합니다.
// 뉴스 기사와 트럼프 게시물 모두 지원합니다.

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useNewsStore } from "@/stores/newsStore";
import type { FeedItem } from "@/lib/news/types";

// 출처별 배지 스타일
function getSourceBadgeStyle(source: string): string {
  switch (source) {
    case "CNBC":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "MarketWatch":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "Investing.com":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "Nasdaq":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
    case "네이버":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "Truth Social":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

// 상대 시간 포맷
function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 60) return `${Math.max(1, diffMin)}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}

export default function NewsModal() {
  const selectedItem = useNewsStore((s) => s.selectedItem);
  const allItems = useNewsStore((s) => s.allItems);
  const setSelectedItem = useNewsStore((s) => s.setSelectedItem);

  // 원문 보기 토글 상태 (뉴스 기사 전용)
  const [isOriginalOpen, setIsOriginalOpen] = useState(false);

  // 모달 닫기
  const handleClose = useCallback(() => {
    setSelectedItem(null);
    setIsOriginalOpen(false);
  }, [setSelectedItem]);

  // ESC 키 닫기 + 배경 스크롤 방지
  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedItem, handleClose]);

  // 관련 뉴스 3개 (같은 타입, 현재 아이템 제외, 최신순)
  const relatedItems = useMemo(() => {
    if (!selectedItem) return [];
    if (selectedItem.itemType === "trump") {
      // 트럼프 게시물: 다른 트럼프 게시물 3개
      return allItems
        .filter((a) => a.itemType === "trump" && a.id !== selectedItem.id)
        .slice(0, 3);
    }
    // 뉴스 기사: 같은 country의 기사 3개
    return allItems
      .filter(
        (a) =>
          a.itemType === "article" &&
          a.country === selectedItem.country &&
          a.id !== selectedItem.id
      )
      .slice(0, 3);
  }, [selectedItem, allItems]);

  // 관련 아이템 클릭
  const handleRelatedClick = (item: FeedItem) => {
    setIsOriginalOpen(false);
    setSelectedItem(item);
  };

  // selectedItem이 null이면 아무것도 렌더링하지 않음
  if (!selectedItem) return null;

  // 트럼프 게시물 모달
  if (selectedItem.itemType === "trump") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

        <div className="relative z-10 mx-4 max-h-[85vh] w-full max-w-[600px] overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-xl">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="닫기"
          >
            <X size={18} />
          </button>

          <div className="space-y-5">
            {/* 상단: Truth Social 배지 + 발행 시간 */}
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 text-xs font-medium ${getSourceBadgeStyle("Truth Social")}`}
              >
                Truth Social
              </span>
              <span className="text-xs text-muted-foreground">🇺🇸 미국</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(selectedItem.posted_at)}
              </span>
            </div>

            {/* 한국어 번역 전문 */}
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {selectedItem.content_ko || selectedItem.content}
            </div>

            {/* 시장 영향 요약 */}
            {selectedItem.summary_ko && (
              <div className="rounded-lg border border-border bg-accent/30 p-4">
                <h3 className="mb-2 text-xs font-bold text-muted-foreground">
                  시장 영향 분석
                </h3>
                <div className="space-y-1.5">
                  {selectedItem.summary_ko.split("\n").map((line, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      • {line}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Truth Social 원문 링크 */}
            {selectedItem.post_url && (
              <a
                href={selectedItem.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
              >
                <ExternalLink size={14} />
                Truth Social에서 원문 보기 →
              </a>
            )}

            {/* 관련 게시물 */}
            {relatedItems.length > 0 && (
              <div className="border-t border-border pt-4">
                <h3 className="mb-3 text-sm font-bold text-foreground">
                  관련 게시물
                </h3>
                <div className="space-y-2">
                  {relatedItems.map((related) => (
                    <button
                      key={related.id}
                      onClick={() => handleRelatedClick(related)}
                      className="block w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-accent/50"
                    >
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <span
                          className={`rounded px-1 py-0.5 text-[10px] font-medium ${getSourceBadgeStyle("Truth Social")}`}
                        >
                          Truth Social
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {related.itemType === "trump"
                            ? formatRelativeTime(related.posted_at)
                            : ""}
                        </span>
                      </div>
                      <p className="truncate text-sm font-medium text-foreground">
                        {related.itemType === "trump"
                          ? (related.content_ko || related.content).split("\n")[0]
                          : ""}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 뉴스 기사 모달 (기존 로직)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 반투명 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* 모달 박스 */}
      <div className="relative z-10 mx-4 max-h-[85vh] w-full max-w-[600px] overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-xl">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="닫기"
        >
          <X size={18} />
        </button>

        <div className="space-y-5">
          {/* 상단: 출처 배지 + 국가 + 발행 시간 */}
          <div className="flex items-center gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-medium ${getSourceBadgeStyle(selectedItem.source_name)}`}
            >
              {selectedItem.source_name}
            </span>
            <span className="text-xs text-muted-foreground">
              {selectedItem.country === "KR" ? "🇰🇷 한국" : "🇺🇸 미국"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(selectedItem.published_at)}
            </span>
          </div>

          {/* 한국어 제목 */}
          <h1 className="text-xl font-bold leading-tight text-foreground">
            {selectedItem.title_ko}
          </h1>

          {/* 한국어 요약 3줄 */}
          <div className="space-y-1.5">
            {selectedItem.summary_ko.split("\n").map((line, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed text-muted-foreground"
              >
                • {line}
              </p>
            ))}
          </div>

          {/* 한국 뉴스: 바로 외부 링크 표시 / 미국 뉴스: 원문 보기 토글 */}
          {selectedItem.country === "KR" ? (
            <a
              href={selectedItem.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
            >
              <ExternalLink size={14} />
              {selectedItem.source_name}에서 전체 기사 읽기 →
            </a>
          ) : (
            <div>
              <button
                onClick={() => setIsOriginalOpen(!isOriginalOpen)}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {isOriginalOpen ? (
                  <>
                    원문 접기 <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    원문 보기 <ChevronDown size={14} />
                  </>
                )}
              </button>

              {isOriginalOpen && (
                <div className="mt-3 space-y-3 border-t border-border pt-3">
                  <h2 className="text-base font-semibold text-muted-foreground">
                    {selectedItem.title_en}
                  </h2>
                  <div className="space-y-1.5">
                    {selectedItem.summary_en.split("\n").map((line, i) => (
                      <p
                        key={i}
                        className="text-sm leading-relaxed text-muted-foreground/80"
                      >
                        • {line}
                      </p>
                    ))}
                  </div>
                  <a
                    href={selectedItem.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
                  >
                    <ExternalLink size={14} />
                    {selectedItem.source_name}에서 전체 기사 읽기 →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* 관련 뉴스 */}
          {relatedItems.length > 0 && (
            <div className="border-t border-border pt-4">
              <h3 className="mb-3 text-sm font-bold text-foreground">
                관련 뉴스
              </h3>
              <div className="space-y-2">
                {relatedItems.map((related) => {
                  const sourceName =
                    related.itemType === "article"
                      ? related.source_name
                      : "Truth Social";
                  const timeStr =
                    related.itemType === "article"
                      ? related.published_at
                      : related.posted_at;
                  const title =
                    related.itemType === "article"
                      ? related.title_ko
                      : (related.content_ko || related.content).split("\n")[0];
                  return (
                    <button
                      key={related.id}
                      onClick={() => handleRelatedClick(related)}
                      className="block w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-accent/50"
                    >
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <span
                          className={`rounded px-1 py-0.5 text-[10px] font-medium ${getSourceBadgeStyle(sourceName)}`}
                        >
                          {sourceName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelativeTime(timeStr)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
