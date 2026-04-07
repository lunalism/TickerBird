// 뉴스 전역 상태 관리
// 리스트에서 클릭한 피드 아이템(뉴스/트럼프 게시물)을 모달에서 즉시 표시하기 위해 사용합니다.

import { create } from "zustand";
import type { FeedItem } from "@/lib/news/types";

interface NewsStore {
  // 현재 선택된 피드 아이템 (null이면 모달 닫힘)
  selectedItem: FeedItem | null;
  // 전체 피드 아이템 목록 (관련 뉴스 필터용)
  allItems: FeedItem[];
  // 피드 아이템 선택 (모달 열기)
  setSelectedItem: (item: FeedItem | null) => void;
  // 전체 피드 아이템 목록 설정
  setAllItems: (items: FeedItem[]) => void;
}

export const useNewsStore = create<NewsStore>((set) => ({
  selectedItem: null,
  allItems: [],
  setSelectedItem: (item) => set({ selectedItem: item }),
  setAllItems: (items) => set({ allItems: items }),
}));
