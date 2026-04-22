/**
 * 경제 지표 용어집 (Glossary) — 정적 사본
 *
 * 이 파일은 Supabase `glossary` 테이블의 시드 사본입니다.
 * - 페이지 UI는 기본적으로 Supabase에서 데이터를 읽지만, 캘린더 등 SSR/타입 안정이
 *   필요한 컨텍스트에서는 여기서 직접 가져다 쓸 수 있습니다.
 * - DB와 항상 동기 상태를 유지해 주세요. (마이그레이션: 20260410000000_create_glossary_table.sql)
 *
 * - GLOSSARY: 1차원 배열 (UI에서 바로 활용)
 * - releaseIdToTerm: FRED release_id → TermItem.id 매핑 (캘린더 이벤트와 용어 연결용)
 */

/** 용어 항목 */
export interface TermItem {
  /** 영문/한글 식별자 (예: "PCE", "신규실업수당청구") — Supabase glossary.id와 동일 */
  id: string;
  /** 한글 풀네임 */
  term: string;
  /** 영문 풀네임 */
  term_en: string;
  /** 한글 설명 (1~2 문장) */
  definition: string;
  /** 분류 (물가/고용/성장/통화정책/소비/경기/무역/부동산/외환) */
  category: string;
}

/**
 * 경제 지표 용어 목록
 * 카테고리별로 묶어 정의 — DB의 시드 데이터와 동일한 항목들입니다.
 */
export const GLOSSARY: TermItem[] = [
  // ── 물가 ──
  {
    id: "CPI",
    term: "CPI 소비자물가지수",
    term_en: "Consumer Price Index",
    definition:
      "소비자가 구매하는 상품/서비스 가격의 평균 변동을 측정하는 핵심 인플레이션 지표.",
    category: "물가",
  },
  {
    id: "PCE",
    term: "PCE 개인소비지출 물가지수",
    term_en: "Personal Consumption Expenditures Price Index",
    definition:
      "연준이 선호하는 인플레이션 지표. CPI보다 더 넓은 범위의 소비 지출을 측정.",
    category: "물가",
  },
  {
    id: "PPI",
    term: "PPI 생산자물가지수",
    term_en: "Producer Price Index",
    definition:
      "생산자가 받는 상품/서비스 가격 변동 측정. 소비자 물가 선행지표.",
    category: "물가",
  },

  // ── 고용 ──
  {
    id: "NFP",
    term: "비농업부문 고용 (NFP)",
    term_en: "Nonfarm Payrolls",
    definition:
      "농업을 제외한 산업의 신규 고용 인원 변화. 매월 첫째 금요일 발표되는 핵심 고용 지표.",
    category: "고용",
  },
  {
    id: "신규실업수당청구",
    term: "신규실업수당청구건수",
    term_en: "Initial Jobless Claims",
    definition:
      "매주 새로 실업수당을 신청한 사람 수. 노동시장 건전성을 빠르게 파악하는 주간 지표.",
    category: "고용",
  },

  // ── 성장 ──
  {
    id: "GDP",
    term: "국내총생산 (GDP)",
    term_en: "Gross Domestic Product",
    definition:
      "한 국가에서 생산된 모든 재화/서비스의 총 가치. 경제 규모와 성장률을 측정하는 핵심 지표.",
    category: "성장",
  },

  // ── 통화정책 ──
  {
    id: "FOMC",
    term: "연방공개시장위원회 (FOMC)",
    term_en: "Federal Open Market Committee",
    definition:
      "미 연준의 통화정책 결정 기구. 연 8회 회의에서 기준금리 등을 결정.",
    category: "통화정책",
  },
  {
    id: "FFR",
    term: "연방기금금리 (기준금리)",
    term_en: "Federal Funds Rate",
    definition:
      "미국 은행 간 초단기 자금 거래에 적용되는 금리. 모든 시장 금리의 기준점.",
    category: "통화정책",
  },

  // ── 소비 ──
  {
    id: "소매판매",
    term: "소매판매",
    term_en: "Retail Sales",
    definition:
      "소매업체의 월별 판매액 변동. 소비자 지출 동향을 측정하는 핵심 지표.",
    category: "소비",
  },
  {
    id: "소비자신뢰지수",
    term: "소비자신뢰지수",
    term_en: "Consumer Confidence Index",
    definition:
      "소비자들의 경제 상황 인식과 미래 전망을 지수화. 소비 지출 선행지표.",
    category: "소비",
  },
  {
    id: "미시간대소비자심리",
    term: "미시간대 소비자심리지수",
    term_en: "Michigan Consumer Sentiment",
    definition:
      "미시간대학교가 발표하는 소비자 심리 지수. 향후 소비 동향 예측에 활용.",
    category: "소비",
  },

  // ── 경기 ──
  {
    id: "ISM",
    term: "ISM 제조업지수",
    term_en: "ISM Manufacturing PMI",
    definition:
      "미국 제조업 경기를 나타내는 지수. 50 이상이면 경기 확장, 이하면 수축.",
    category: "경기",
  },
  {
    id: "내구재주문",
    term: "내구재주문",
    term_en: "Durable Goods Orders",
    definition:
      "3년 이상 사용 가능한 제품 신규 주문액. 기업 투자 의향과 제조업 경기를 나타냄.",
    category: "경기",
  },
  {
    id: "산업생산",
    term: "산업생산지수",
    term_en: "Industrial Production Index",
    definition:
      "제조업/광업/전기가스업의 생산량 변화. 경제 전반의 생산 활동 수준을 측정.",
    category: "경기",
  },

  // ── 무역 ──
  {
    id: "무역수지",
    term: "무역수지",
    term_en: "Trade Balance",
    definition:
      "한 국가의 상품/서비스 수출입 차액. 흑자/적자 여부로 대외 경쟁력 판단.",
    category: "무역",
  },
  {
    id: "경상수지",
    term: "경상수지",
    term_en: "Current Account",
    definition:
      "상품/서비스 교역과 소득 이전을 포함한 대외 거래 수지. 국가 경쟁력 지표.",
    category: "무역",
  },

  // ── 부동산 ──
  {
    id: "주택착공",
    term: "주택착공건수",
    term_en: "Housing Starts",
    definition:
      "신규 주택 건설 시작 건수. 부동산 시장과 건설 경기를 나타내는 지표.",
    category: "부동산",
  },
  {
    id: "기존주택판매",
    term: "기존주택판매",
    term_en: "Existing Home Sales",
    definition:
      "이미 건설된 주택의 매매 건수. 부동산 시장 활성화 정도를 나타냄.",
    category: "부동산",
  },
  {
    id: "신규주택판매",
    term: "신규주택판매",
    term_en: "New Home Sales",
    definition:
      "새로 건설된 주택의 판매 건수. 건설 경기와 주택 수요를 파악하는 지표.",
    category: "부동산",
  },

  // ── 외환 ──
  {
    id: "DXY",
    term: "달러 인덱스 (DXY)",
    term_en: "U.S. Dollar Index",
    definition:
      "주요 6개 통화 대비 미 달러화 가치를 지수화. 달러 강세/약세 측정.",
    category: "외환",
  },
];

/**
 * FRED release_id → 용어 ID 매핑
 *
 * 캘린더 이벤트(CalendarEvent.releaseId)에서 용어 설명으로 빠르게 찾아갈 때 사용합니다.
 * 매핑되지 않은 release_id는 용어 설명이 없는 것으로 처리하면 됩니다.
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

/**
 * 용어 ID로 TermItem을 찾는 헬퍼.
 * 매칭되는 항목이 없으면 undefined를 반환합니다.
 */
export function getTermById(id: string): TermItem | undefined {
  return GLOSSARY.find((t) => t.id === id);
}

/**
 * FRED release_id로 곧장 TermItem을 찾는 헬퍼.
 * 매핑이 없거나 용어가 정의되지 않은 경우 undefined.
 */
export function getTermByReleaseId(releaseId: number): TermItem | undefined {
  const id = releaseIdToTerm[releaseId];
  if (!id) return undefined;
  return getTermById(id);
}
