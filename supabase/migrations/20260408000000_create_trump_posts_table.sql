-- 트럼프 Truth Social 게시물 저장 테이블
-- 뉴스와 달리 누적 보관 (삭제 안 함)
CREATE TABLE trump_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL UNIQUE,     -- Truth Social 원본 게시물 ID (중복 방지)
  content text NOT NULL,             -- 게시물 원문 (영어)
  content_ko text,                   -- Claude API 번역본 (한국어)
  summary_ko text,                   -- 한국어 3줄 요약
  post_url text,                     -- 원본 게시물 링크
  posted_at timestamptz NOT NULL,    -- 게시물 작성 시간
  created_at timestamptz DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_trump_posts_posted_at ON trump_posts (posted_at DESC);

-- RLS
ALTER TABLE trump_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trump_posts_select_policy"
  ON trump_posts FOR SELECT USING (true);
