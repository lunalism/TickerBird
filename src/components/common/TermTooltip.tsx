// 캘린더 이벤트(또는 기타 위치)에서 사용하는 경제 용어 툴팁
//
// 데이터 소스
// - Supabase glossary 테이블을 단일 소스로 사용합니다.
// - 실제 fetch/캐싱은 `useGlossaryStore` (Zustand)가 담당하며, 본 컴포넌트는
//   마운트 시 fetchTerms를 호출하고 store에서 getTermById로 동기 조회합니다.
// - props.releaseId(FRED release_id)는 `releaseIdToTerm` 매핑으로 용어 id("CPI" 등)로 변환합니다.
// - 매칭되는 용어가 없거나 아직 로드 전이면 children만 렌더 (툴팁 비활성).
//
// 표시 방식: React state(onMouseEnter/onMouseLeave) + fixed 포지셔닝
// - 이전 CSS group-hover + absolute 방식은 부모 컨테이너의 overflow:hidden
//   또는 stacking context에 막혀 팝업이 가려지는 이슈가 있었습니다.
// - 본 구현은 isVisible state로 표시 여부를 제어하고, position:fixed + 높은
//   z-index(9999)로 뷰포트 기준 배치 → 부모 overflow를 완전히 우회합니다.
// - 마우스 진입 좌표(e.clientX/clientY)를 저장하여 그 위치 기준으로 툴팁을
//   배치합니다 (위쪽·가로 중앙 정렬, transform으로 보정).

"use client";

import { useEffect, useMemo, useState, type ReactNode, type MouseEvent } from "react";

import { releaseIdToTerm } from "@/lib/calendar-mapping";
import { COUNTRY_NAMES, countryCodeToFlag } from "@/lib/country";
import { cn } from "@/lib/utils";
import { useGlossaryStore } from "@/stores/glossaryStore";

/** 카테고리별 배지 색상 (GlossaryClient와 동일 팔레트) */
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

interface TermTooltipProps {
  /** FRED release_id (releaseIdToTerm 매핑으로 용어 id로 변환) */
  releaseId: number;
  /**
   * 호버 대상이 될 컨텐츠 (예: 지표명 span).
   * 단일 element 또는 텍스트 모두 가능합니다.
   */
  children: ReactNode;
}

export default function TermTooltip({
  releaseId,
  children,
}: TermTooltipProps) {
  // 스토어에서 필요한 값만 구독 — isLoaded가 바뀌면 재렌더링되어 툴팁이 활성화됩니다.
  // fetchTerms는 함수 참조이므로 선택적으로 꺼내서 useEffect에서 호출합니다.
  const fetchTerms = useGlossaryStore((s) => s.fetchTerms);
  const isLoaded = useGlossaryStore((s) => s.isLoaded);
  const getTermById = useGlossaryStore((s) => s.getTermById);

  // 마운트 시 1회 fetch 시도 (store가 중복 호출을 자동 차단)
  // 의존성 배열에 fetchTerms만 넣어 함수 참조가 바뀌지 않는 한 1번만 실행됩니다.
  useEffect(() => {
    void fetchTerms();
  }, [fetchTerms]);

  // release_id → 용어 id → TermItem 조회
  // isLoaded를 의존성에 포함시켜 fetch 완료 시점에 term이 갱신되도록 useMemo 사용.
  const term = useMemo(() => {
    if (!isLoaded) return null;
    const termId = releaseIdToTerm[releaseId];
    if (!termId) return null;
    return getTermById(termId) ?? null;
  }, [isLoaded, releaseId, getTermById]);

  // 툴팁 표시 여부 + 마우스 좌표(뷰포트 기준, position:fixed에서 사용)
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 관련 국가 → 국기 이모지/라벨 목록을 useMemo로 캐싱.
  // term이 없으면 빈 배열을 반환하므로 훅 호출 순서는 항상 안정적으로 유지됩니다.
  const flags = useMemo(() => {
    const codes = term?.countries ?? [];
    return codes
      .map((code) => ({
        code,
        emoji: countryCodeToFlag(code),
        name: COUNTRY_NAMES[code] ?? code,
      }))
      .filter((f) => f.emoji.length > 0);
  }, [term]);

  // 매칭되는 용어가 없으면 (로드 전 포함) 툴팁 없이 children만 렌더링
  if (!term) {
    return <>{children}</>;
  }

  // 호버 진입: 현재 마우스 좌표를 저장하고 툴팁을 표시
  const handleMouseEnter = (e: MouseEvent<HTMLSpanElement>) => {
    setCoords({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  };

  // 호버 중 이동: 마우스를 따라다니도록 좌표 갱신
  const handleMouseMove = (e: MouseEvent<HTMLSpanElement>) => {
    setCoords({ x: e.clientX, y: e.clientY });
  };

  // 호버 이탈: 툴팁 숨김
  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    // 트리거 컨테이너 — inline-block으로 children 크기에만 맞춤
    <span
      className="relative inline-block cursor-help"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* 툴팁 팝업 — fixed + z-[9999]로 부모 overflow:hidden을 완전히 우회 */}
      {isVisible && (
        <span
          role="tooltip"
          // 인라인 스타일로 뷰포트 기준 위치 지정
          // top:  마우스 y - 10px (커서보다 약간 위)
          // left: 마우스 x (transform으로 가로 중앙 정렬 + 위쪽으로 올림)
          style={{
            top: coords.y - 10,
            left: coords.x,
            transform: "translate(-50%, -100%)",
          }}
          className={cn(
            // 포지셔닝: fixed로 뷰포트 기준, 최상단 z-index
            "pointer-events-none fixed z-[9999]",
            // 크기: 컨텐츠 길이만큼, 단 최대 300px
            "w-max max-w-[300px] whitespace-normal break-words text-left",
            // 카드 스타일 (popover 토큰으로 라이트/다크 자동 대응)
            "rounded-md border border-border bg-popover px-3 py-2 shadow-lg",
          )}
        >
          {/* 상단: 카테고리 배지 + 한국어명 + 국기 이모지 */}
          <span className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold",
                categoryBadgeClass(term.category)
              )}
            >
              {term.category}
            </span>
            <span className="text-sm font-semibold text-popover-foreground">
              {term.term}
            </span>
            {/*
              관련 국가 국기 이모지 — useMemo로 계산된 flags 리스트를 순회.
              빈 배열이면 아무것도 렌더되지 않아 공간을 차지하지 않습니다.
            */}
            {flags.map((f) => (
              <span
                key={f.code}
                title={f.name}
                aria-label={f.name}
                className="text-sm leading-none"
              >
                {f.emoji}
              </span>
            ))}
          </span>

          {/* 중간: 영문명 (있을 경우만) */}
          {term.term_en && (
            <span className="mt-1 block text-[11px] italic text-muted-foreground">
              {term.term_en}
            </span>
          )}

          {/* 하단: 설명 */}
          <span className="mt-1 block text-xs leading-relaxed text-popover-foreground/90">
            {term.definition}
          </span>
        </span>
      )}
    </span>
  );
}
