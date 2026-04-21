// 용어사전 전역 캐시 스토어 (Zustand)
//
// - 애플리케이션 전역에서 단일 소스(Supabase glossary 테이블)를 공유하기 위한 스토어.
// - 첫 사용 시(fetchTerms 최초 호출) DB에서 전체 목록을 한 번만 가져와 메모리에 캐싱하고,
//   이후 모든 컴포넌트(TermTooltip, GlossaryClient 등)는 동일한 인스턴스에서 재사용합니다.
// - 중복 호출 방지: isLoaded 또는 isLoading 플래그가 설정되어 있으면 즉시 반환합니다.
// - 조회 편의를 위해 termsById(용어 id — 예: "CPI")와 termsByName(한글/영문 풀네임)
//   두 가지 인덱스를 유지합니다. 외부에서는 getTermById / getTermByName 메서드만 사용하세요.
//
// 주의
// - Zustand 스토어는 클라이언트 전용입니다. "use client" 컴포넌트에서만 사용하세요.
// - fetch 실패 시 isLoading만 해제하여 다음 호출 때 재시도할 수 있게 둡니다.

import { create } from "zustand";

import { createClient } from "@/lib/supabase/client";
import type { GlossaryTerm } from "@/types/database";

interface GlossaryStore {
  /** 전체 용어 목록 (DB에서 받은 순서 그대로) */
  terms: GlossaryTerm[];
  /** 용어 id("CPI", "PCE" 등) → GlossaryTerm 조회용 Map */
  termsById: Map<string, GlossaryTerm>;
  /** 한글/영문 풀네임(term, term_en) → GlossaryTerm 조회용 Map */
  termsByName: Map<string, GlossaryTerm>;
  /** 최초 fetch 완료 여부 */
  isLoaded: boolean;
  /** fetch 진행 중 여부 (중복 호출 방지용) */
  isLoading: boolean;

  /** Supabase glossary 테이블에서 전체 용어를 1회 로드 (이미 로드/진행 중이면 skip) */
  fetchTerms: () => Promise<void>;
  /** 용어 id("CPI" 등)로 TermItem 조회 */
  getTermById: (id: string) => GlossaryTerm | undefined;
  /** 용어 한글/영문 풀네임으로 TermItem 조회 */
  getTermByName: (name: string) => GlossaryTerm | undefined;
}

export const useGlossaryStore = create<GlossaryStore>((set, get) => ({
  terms: [],
  termsById: new Map(),
  termsByName: new Map(),
  isLoaded: false,
  isLoading: false,

  fetchTerms: async () => {
    // 이미 로드됐거나 진행 중이면 중복 호출 방지
    // (TermTooltip이 여러 인스턴스에서 동시에 호출해도 실제 네트워크 요청은 1회만 발생)
    if (get().isLoaded || get().isLoading) return;

    set({ isLoading: true });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("glossary")
        // countries는 최근 추가된 TEXT[] 컬럼 — 국기 렌더용
        .select("id, term, term_en, definition, category, countries, created_at");

      if (error) throw error;

      // 두 가지 조회 인덱스 생성:
      // - termsById:   id("CPI") 기준 — caldenar release_id 매핑에서 사용
      // - termsByName: 한글/영문 풀네임 기준 — 자유 텍스트 매칭에 사용
      const rows = (data ?? []) as GlossaryTerm[];
      const byId = new Map<string, GlossaryTerm>();
      const byName = new Map<string, GlossaryTerm>();
      rows.forEach((t) => {
        byId.set(t.id, t);
        if (t.term) byName.set(t.term, t);
        if (t.term_en) byName.set(t.term_en, t);
      });

      set({
        terms: rows,
        termsById: byId,
        termsByName: byName,
        isLoaded: true,
        isLoading: false,
      });
    } catch (err) {
      console.error("용어사전 로드 실패:", err);
      // 실패 시 isLoading만 해제 → 다음 호출에서 재시도 가능
      set({ isLoading: false });
    }
  },

  getTermById: (id: string) => get().termsById.get(id),
  getTermByName: (name: string) => get().termsByName.get(name),
}));
