-- 本番環境用：ネタバレ関連のカラムとテーブルを追加するマイグレーション
-- 実行日時: 2025-07-26
-- 実行環境: Supabase本番環境

-- reading_recordsテーブルに新しいカラムを追加
ALTER TABLE reading_records 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_not_book BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS custom_link TEXT,
ADD COLUMN IF NOT EXISTS contains_spoiler BOOLEAN DEFAULT FALSE;

-- user_settingsテーブルを作成
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    hide_spoilers BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- user_settingsテーブルのインデックスを作成
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- user_settingsテーブルの更新日時トリガーを作成
CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 実行確認用クエリ
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reading_records' AND column_name IN ('notes', 'is_not_book', 'custom_link', 'contains_spoiler');
-- SELECT * FROM user_settings LIMIT 5; 
