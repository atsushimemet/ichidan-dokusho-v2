-- reading_recordsテーブルにtheme_idカラムを追加
-- Issue #116: テーマベース読書記録統計機能のため

-- 1. theme_idカラムを追加（NULLを許可、外部キー制約あり）
ALTER TABLE reading_records 
ADD COLUMN theme_id INTEGER;

-- 2. 外部キー制約を追加
ALTER TABLE reading_records 
ADD CONSTRAINT fk_reading_records_theme_id 
FOREIGN KEY (theme_id) REFERENCES writing_themes(id) 
ON DELETE SET NULL;

-- 3. インデックスを追加（テーマ別統計取得の高速化）
CREATE INDEX idx_reading_records_theme_id ON reading_records(theme_id);

-- 4. 複合インデックスを追加（ユーザー別・テーマ別統計取得の高速化）
CREATE INDEX idx_reading_records_user_theme ON reading_records(user_id, theme_id);

-- 5. 日付別統計用のインデックスを追加（created_atでソート）
CREATE INDEX idx_reading_records_created_at ON reading_records(created_at);

-- 確認用のクエリ
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'reading_records' 
-- ORDER BY ordinal_position;