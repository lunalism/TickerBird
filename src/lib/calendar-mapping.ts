// 캘린더(FRED) ↔ 용어사전(glossary) 매핑 테이블
//
// - FRED API의 release_id는 정수 식별자이고, Supabase glossary 테이블의 id는
//   "CPI", "PCE" 등 문자열 키입니다. 두 식별 체계를 연결하기 위한 매핑을 한 곳에 모았습니다.
// - TermTooltip이 이 매핑을 사용해 호버 중인 캘린더 이벤트를 용어 데이터로 연결합니다.
// - 이전에는 src/data/glossary.ts에 함께 있었으나, 로컬 GLOSSARY 배열을 제거하면서
//   매핑만 본 파일로 분리했습니다 (글로서리 데이터의 단일 소스는 Supabase).

/**
 * FRED release_id → glossary.id 매핑.
 * 매핑이 없는 release_id는 툴팁에 설명이 없는 것으로 처리합니다.
 */
export const releaseIdToTerm: Record<number, string> = {
  // 기본 6종
  10: "CPI",
  50: "NFP",
  53: "GDP",
  392: "FOMC",
  56: "소매판매",
  46: "무역수지",
  // 확장 12종
  54: "PCE",
  82: "PPI",
  112: "신규실업수당청구",
  184: "ISM",
  57: "내구재주문",
  13: "산업생산",
  245: "소비자신뢰지수",
  111: "미시간대소비자심리",
  17: "주택착공",
  19: "기존주택판매",
  398: "신규주택판매",
  23: "경상수지",
};
