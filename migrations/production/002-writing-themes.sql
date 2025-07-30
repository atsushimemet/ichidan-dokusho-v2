-- 本番環境用：書きたいテーマ機能を追加するマイグレーション
-- 実行日時: 2025-07-30
-- 実行環境: Supabase本番環境
-- 対応Issue: #115

-- writing_themesテーブルを作成
CREATE TABLE IF NOT EXISTS writing_themes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    theme_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- writing_themesテーブルのインデックスを作成
CREATE INDEX IF NOT EXISTS idx_writing_themes_user_id ON writing_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_themes_created_at ON writing_themes(created_at);

-- writing_themesテーブルの更新日時トリガーを作成
CREATE TRIGGER update_writing_themes_updated_at 
    BEFORE UPDATE ON writing_themes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 実行確認用クエリ
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'writing_themes';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'writing_themes';
-- SELECT COUNT(*) FROM writing_themes;