// 경제 용어사전 클라이언트 컴포넌트
// Supabase glossary 테이블에서 전체 용어를 1회 조회한 뒤,
// 검색/카테고리 필터는 클라이언트 사이드에서 즉시 처리합니다.

"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { GlossaryTerm } from "@/types/database";

/** 카테고리 탭 라벨 (요청 사양 그대로) */
const CATEGORY_TABS = [
  "전체",
  "물가",
  "성장",
  "통화정책",
  "고용",
  "소비",
  "경기",
  "무역",
  "부동산",
  "외환",
] as const;

type CategoryTab = (typeof CATEGORY_TABS)[number];

/** 카테고리별 배지 색상 클래스 (라이트/다크 공통) */
function categoryBadgeClass(category: string): string {
  switch (category) {
    case "물가":
      return "bg-red-500/15 text-red-600 dark:text-red-400";
    case "고용":
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
    case "성장":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
    case "통화정책":
      return "bg-violet-500/15 text-violet-600 dark:text-violet-400";
    case "소비":
      return "bg-pink-500/15 text-pink-600 dark:text-pink-400";
    case "경기":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
    case "무역":
      return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400";
    case "부동산":
      return "bg-orange-500/15 text-orange-600 dark:text-orange-400";
    case "외환":
      return "bg-teal-500/15 text-teal-600 dark:text-teal-400";
    default:
      return "bg-gray-500/15 text-gray-600 dark:text-gray-400";
  }
}

export default function GlossaryClient() {
  // ── 데이터 상태 ──
  // React 19의 set-state-in-effect 규칙을 피하려면 setState는 async 콜백에서만 호출해야 합니다.
  // 첫 페치 완료 여부 플래그로 로딩/에러를 파생시킵니다.
  const [terms, setTerms] = useState<GlossaryTerm[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── UI 상태 ──
  const [query, setQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("전체");

  // 첫 마운트 시 1회 Supabase 조회
  useEffect(() => {
    let cancelled = false;

    // IIFE async 패턴 — useEffect 본문에서 직접 await할 수 없으므로
    (async () => {
      try {
        const supabase = createClient();
        const { data, error: dbError } = await supabase
          .from("glossary")
          .select("id, term, term_en, definition, category, created_at")
          .order("category", { ascending: true })
          .order("term", { ascending: true });

        if (cancelled) return;
        if (dbError) {
          console.error("용어사전 조회 실패:", dbError);
          setError("용어를 불러오지 못했습니다");
          setTerms([]);
          return;
        }
        setTerms((data ?? []) as GlossaryTerm[]);
      } catch (err) {
        if (cancelled) return;
        console.error("용어사전 조회 예외:", err);
        setError("용어를 불러오지 못했습니다");
        setTerms([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 파생: 로딩 여부 (terms가 아직 null이고 에러도 없으면 로딩 중)
  const isLoading = terms === null && error === null;

  // 검색 + 카테고리 필터링 결과
  // - 검색어는 영문/한글 풀네임/설명 모두에 대해 부분일치 (대소문자 무시)
  const filteredTerms = useMemo(() => {
    if (!terms) return [];

    const q = query.trim().toLowerCase();

    return terms.filter((t) => {
      // 카테고리 필터 (전체는 무조건 통과)
      if (activeCategory !== "전체" && t.category !== activeCategory) {
        return false;
      }
      // 검색어 필터
      if (q.length === 0) return true;
      return (
        t.id.toLowerCase().includes(q) ||
        t.term.toLowerCase().includes(q) ||
        t.term_en.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
      );
    });
  }, [terms, query, activeCategory]);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      {/* 페이지 타이틀 */}
      <h1 className="mb-4 text-xl font-bold text-foreground md:text-2xl">
        용어사전
      </h1>

      {/* 검색창 */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="용어, 영문명, 설명 검색"
          className={cn(
            "h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        />
      </div>

      {/* 카테고리 필터 탭 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => {
          const isActive = tab === activeCategory;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveCategory(tab)}
              className={cn(
                "h-8 rounded-full border px-3 text-xs font-medium transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 본문: 로딩 / 에러 / 빈 상태 / 카드 그리드 */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 w-full animate-pulse rounded-lg border border-border bg-muted/40"
            />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && filteredTerms.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          검색 결과가 없습니다
        </div>
      )}

      {!isLoading && !error && filteredTerms.length > 0 && (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTerms.map((t) => (
            <li
              key={t.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* 카테고리 배지 */}
              <span
                className={cn(
                  "inline-flex h-6 w-fit items-center rounded-full px-2 text-[11px] font-semibold",
                  categoryBadgeClass(t.category)
                )}
              >
                {t.category}
              </span>

              {/* 영문 term (크게) */}
              <div className="text-lg font-bold leading-tight text-foreground">
                {t.term_en}
              </div>

              {/* 한국어명 (작게) */}
              <div className="text-sm text-muted-foreground">{t.term}</div>

              {/* 설명 */}
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                {t.definition}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
