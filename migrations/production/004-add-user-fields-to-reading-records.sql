-- 本番環境用：reading_recordsテーブルにユーザー関連カラムを追加するマイグレーション
-- 実行日時: 2025-07-30
-- 実行環境: Supabase本番環境
-- 対応Issue: #116

-- reading_recordsテーブルにユーザー関連カラムを追加
ALTER TABLE reading_records 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- ユーザー関連カラムのインデックスを作成
CREATE INDEX IF NOT EXISTS idx_reading_records_user_id ON reading_records(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_records_user_email ON reading_records(user_email);

-- 実行確認用クエリ
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reading_records' AND column_name IN ('user_id', 'user_email');
-- SELECT COUNT(*) FROM reading_records WHERE user_id IS NOT NULL; 
