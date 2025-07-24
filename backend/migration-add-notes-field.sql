-- 備考フィールドを追加するマイグレーション
ALTER TABLE reading_records ADD COLUMN IF NOT EXISTS notes TEXT;

-- 備考フィールドのコメントを追加
COMMENT ON COLUMN reading_records.notes IS '読書に関する備考（どこで読んだのか、何ページ目か、どんなきっかけで読んだのか、教えてくれた人は誰かなど）'; 
