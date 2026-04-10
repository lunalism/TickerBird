-- ============================================
-- 경제 용어사전 테이블 생성
-- 미국 주요 거시 경제 지표 용어집
-- ============================================

-- 테이블 생성
-- id는 영문/한글 식별자 (예: "CPI", "신규실업수당청구")로 사용
CREATE TABLE glossary (
  id          text        PRIMARY KEY,         -- 용어 식별자 (영문/한글 키)
  term        text        NOT NULL,            -- 한글 풀네임
  term_en     text        NOT NULL,            -- 영문 풀네임
  definition  text        NOT NULL,            -- 한글 설명 (1~2 문장)
  category    text        NOT NULL,            -- 분류 (물가/고용/성장/통화정책/소비/경기/무역/부동산/외환)
  created_at  timestamptz DEFAULT now()
);

-- 인덱스: 카테고리 필터용
CREATE INDEX idx_glossary_category ON glossary (category);

-- ============================================
-- RLS (Row Level Security) 설정
-- ============================================

-- RLS 활성화
ALTER TABLE glossary ENABLE ROW LEVEL SECURITY;

-- 모든 유저 (비로그인 포함) SELECT 허용
CREATE POLICY "glossary_select_policy"
  ON glossary
  FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE는 별도 정책 없음 (관리자 또는 service_role만 RLS bypass로 수정)

-- ============================================
-- 시드 데이터 INSERT (20개 미국 주요 경제 지표)
-- ============================================

INSERT INTO glossary (id, term, term_en, definition, category) VALUES
  -- ── 물가 ──
  ('CPI', 'CPI 소비자물가지수', 'Consumer Price Index',
   '소비자가 구매하는 상품/서비스 가격의 평균 변동을 측정하는 핵심 인플레이션 지표.', '물가'),
  ('PCE', 'PCE 개인소비지출 물가지수', 'Personal Consumption Expenditures Price Index',
   '연준이 선호하는 인플레이션 지표. CPI보다 더 넓은 범위의 소비 지출을 측정.', '물가'),
  ('PPI', 'PPI 생산자물가지수', 'Producer Price Index',
   '생산자가 받는 상품/서비스 가격 변동 측정. 소비자 물가 선행지표.', '물가'),

  -- ── 고용 ──
  ('NFP', '비농업부문 고용 (NFP)', 'Nonfarm Payrolls',
   '농업을 제외한 산업의 신규 고용 인원 변화. 매월 첫째 금요일 발표되는 핵심 고용 지표.', '고용'),
  ('신규실업수당청구', '신규실업수당청구건수', 'Initial Jobless Claims',
   '매주 새로 실업수당을 신청한 사람 수. 노동시장 건전성을 빠르게 파악하는 주간 지표.', '고용'),

  -- ── 성장 ──
  ('GDP', '국내총생산 (GDP)', 'Gross Domestic Product',
   '한 국가에서 생산된 모든 재화/서비스의 총 가치. 경제 규모와 성장률을 측정하는 핵심 지표.', '성장'),

  -- ── 통화정책 ──
  ('FOMC', '연방공개시장위원회 (FOMC)', 'Federal Open Market Committee',
   '미 연준의 통화정책 결정 기구. 연 8회 회의에서 기준금리 등을 결정.', '통화정책'),
  ('FFR', '연방기금금리 (기준금리)', 'Federal Funds Rate',
   '미국 은행 간 초단기 자금 거래에 적용되는 금리. 모든 시장 금리의 기준점.', '통화정책'),

  -- ── 소비 ──
  ('소매판매', '소매판매', 'Retail Sales',
   '소매업체의 월별 판매액 변동. 소비자 지출 동향을 측정하는 핵심 지표.', '소비'),
  ('소비자신뢰지수', '소비자신뢰지수', 'Consumer Confidence Index',
   '소비자들의 경제 상황 인식과 미래 전망을 지수화. 소비 지출 선행지표.', '소비'),
  ('미시간대소비자심리', '미시간대 소비자심리지수', 'Michigan Consumer Sentiment',
   '미시간대학교가 발표하는 소비자 심리 지수. 향후 소비 동향 예측에 활용.', '소비'),

  -- ── 경기 ──
  ('ISM', 'ISM 제조업지수', 'ISM Manufacturing PMI',
   '미국 제조업 경기를 나타내는 지수. 50 이상이면 경기 확장, 이하면 수축.', '경기'),
  ('내구재주문', '내구재주문', 'Durable Goods Orders',
   '3년 이상 사용 가능한 제품 신규 주문액. 기업 투자 의향과 제조업 경기를 나타냄.', '경기'),
  ('산업생산', '산업생산지수', 'Industrial Production Index',
   '제조업/광업/전기가스업의 생산량 변화. 경제 전반의 생산 활동 수준을 측정.', '경기'),

  -- ── 무역 ──
  ('무역수지', '무역수지', 'Trade Balance',
   '한 국가의 상품/서비스 수출입 차액. 흑자/적자 여부로 대외 경쟁력 판단.', '무역'),
  ('경상수지', '경상수지', 'Current Account',
   '상품/서비스 교역과 소득 이전을 포함한 대외 거래 수지. 국가 경쟁력 지표.', '무역'),

  -- ── 부동산 ──
  ('주택착공', '주택착공건수', 'Housing Starts',
   '신규 주택 건설 시작 건수. 부동산 시장과 건설 경기를 나타내는 지표.', '부동산'),
  ('기존주택판매', '기존주택판매', 'Existing Home Sales',
   '이미 건설된 주택의 매매 건수. 부동산 시장 활성화 정도를 나타냄.', '부동산'),
  ('신규주택판매', '신규주택판매', 'New Home Sales',
   '새로 건설된 주택의 판매 건수. 건설 경기와 주택 수요를 파악하는 지표.', '부동산'),

  -- ── 외환 ──
  ('DXY', '달러 인덱스 (DXY)', 'U.S. Dollar Index',
   '주요 6개 통화 대비 미 달러화 가치를 지수화. 달러 강세/약세 측정.', '외환')
ON CONFLICT (id) DO NOTHING;
