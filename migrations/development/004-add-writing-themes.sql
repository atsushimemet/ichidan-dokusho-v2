-- 書きたいテーマテーブルの作成
CREATE TABLE IF NOT EXISTS writing_themes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    theme_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_writing_themes_user_id ON writing_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_themes_created_at ON writing_themes(created_at);

-- 更新日時を自動更新するトリガーの作成
CREATE TRIGGER update_writing_themes_updated_at 
    BEFORE UPDATE ON writing_themes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入（テスト用）
INSERT INTO writing_themes (user_id, theme_name) VALUES
('dev-user-123', 'キャリア'),
('dev-user-123', 'サウナ'),
('dev-user-123', 'プログラミング')
ON CONFLICT DO NOTHING;