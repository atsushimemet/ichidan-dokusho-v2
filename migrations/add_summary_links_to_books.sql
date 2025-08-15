-- マイグレーション: books テーブルに要約リンクフィールドを追加
-- 日付: 2024-01-XX
-- 目的: 書籍に3つの任意の要約リンク（Webリンク、YouTubeリンクなど）を保存できるようにする

-- books テーブルに要約リンクのカラムを追加
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS summary_link1 TEXT,
ADD COLUMN IF NOT EXISTS summary_link2 TEXT,
ADD COLUMN IF NOT EXISTS summary_link3 TEXT;

-- 新しいカラムにコメントを追加
COMMENT ON COLUMN books.summary_link1 IS '要約リンク1（Webリンク、YouTubeリンクなど、任意項目）';
COMMENT ON COLUMN books.summary_link2 IS '要約リンク2（Webリンク、YouTubeリンクなど、任意項目）';
COMMENT ON COLUMN books.summary_link3 IS '要約リンク3（Webリンク、YouTubeリンクなど、任意項目）';

-- 新しいカラムのデフォルト値はNULL（任意項目のため）

-- マイグレーション完了のログ
INSERT INTO migration_log (migration_name, executed_at) 
VALUES ('add_summary_links_to_books', CURRENT_TIMESTAMP)
ON CONFLICT (migration_name) DO NOTHING;