// 국가 코드 → 국기 이모지 변환 유틸리티
//
// ISO 3166-1 alpha-2 국가 코드(예: "US", "KR")를
// 유니코드 Regional Indicator Symbol로 조합하여 국기 이모지를 생성합니다.
// 외부 의존성 없는 순수 함수로 작성되어 있어 SSR/CSR 어디서나 사용 가능합니다.
//
// 참고: Windows Chrome은 기본 폰트에 국기 이모지 글리프가 없어
//       두 글자가 따로 보일 수 있습니다(예: "US"). 이 경우 시스템 레벨에서
//       Segoe UI Emoji 등이 필요하며, Twemoji 같은 SVG 대체가 아닌 이상
//       네이티브 렌더링에 의존합니다.

/**
 * 국가 코드(ISO 3166-1 alpha-2)를 국기 이모지 문자열로 변환합니다.
 * - 입력이 비어있거나 2글자가 아니면 빈 문자열을 반환합니다.
 * - 유니코드 Regional Indicator(0x1F1E6)는 알파벳 A(0x41)에서 시작하므로
 *   각 문자의 code point에 오프셋을 더해 두 개의 Regional Indicator를
 *   연결하면 국가 국기가 완성됩니다.
 *
 * @example
 *   countryCodeToFlag("US") // "🇺🇸"
 *   countryCodeToFlag("KR") // "🇰🇷"
 */
export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return "";
  // A(0x41) → Regional Indicator A(0x1F1E6) 간의 오프셋
  const base = 0x1f1e6 - "A".charCodeAt(0);
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => c.charCodeAt(0) + base),
  );
}

/**
 * 국가 코드 → 한국어 국가명 매핑.
 * 국기 이모지의 title 속성(툴팁/접근성 대체 텍스트)에 사용합니다.
 * 미정의 코드는 호출자가 fallback(예: 원 코드 그대로)을 처리하도록 합니다.
 */
export const COUNTRY_NAMES: Record<string, string> = {
  US: "미국",
  KR: "한국",
  JP: "일본",
  CN: "중국",
  EU: "유럽연합",
  GB: "영국",
};
