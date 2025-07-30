-- reading_recordsテーブルにユーザー関連カラムを追加
-- Issue #116: ユーザー認証機能のため

-- 1. user_idとuser_emailカラムを追加
ALTER TABLE reading_records 
ADD COLUMN user_id VARCHAR(255),
ADD COLUMN user_email VARCHAR(255);

-- 2. ユーザー関連カラムのインデックスを作成
CREATE INDEX idx_reading_records_user_id ON reading_records(user_id);
CREATE INDEX idx_reading_records_user_email ON reading_records(user_email);

-- 確認用のクエリ
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'reading_records' 
-- AND column_name IN ('user_id', 'user_email')
-- ORDER BY ordinal_position; 
