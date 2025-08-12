-- 読書記録テーブルの作成
CREATE TABLE IF NOT EXISTS reading_records (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    link TEXT,
    reading_amount VARCHAR(50) NOT NULL,
    learning TEXT NOT NULL,
    action TEXT NOT NULL,
    notes TEXT,
    is_not_book BOOLEAN DEFAULT FALSE,
    custom_link TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 書籍情報テーブルの作成
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amazon_link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- タグテーブルの作成
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 書籍とタグの関連テーブル
CREATE TABLE IF NOT EXISTS book_tags (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, tag_id)
);

-- いいねテーブルの作成
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    reading_record_id INTEGER NOT NULL REFERENCES reading_records(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reading_record_id, session_id)
);

-- ユーザー設定テーブルの作成
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_reading_records_created_at ON reading_records(created_at);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_book_tags_book_id ON book_tags(book_id);
CREATE INDEX IF NOT EXISTS idx_book_tags_tag_id ON book_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_likes_reading_record_id ON likes(reading_record_id);
CREATE INDEX IF NOT EXISTS idx_likes_session_id ON likes(session_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 更新日時を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_reading_records_updated_at 
    BEFORE UPDATE ON reading_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at 
    BEFORE UPDATE ON books 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入（テスト用）
INSERT INTO reading_records (title, link, reading_amount, learning, action) VALUES
('7つの習慣', 'https://www.amazon.co.jp/dp/ASIN/ref=nosim?tag=test', '1章', '人の話を聴くとは、同意することではない', '朝会で相手の話をさえぎらずに聞く'),
('星の王子さま', 'https://www.amazon.co.jp/dp/ASIN/ref=nosim?tag=test', '1段落', '大切なものは目に見えない', '家族との時間を大切にする'),
('嫌われる勇気', 'https://www.amazon.co.jp/dp/ASIN/ref=nosim?tag=test', '1文だけ', '過去は変えられないが、未来は変えられる', '今日から新しい習慣を始める')
ON CONFLICT DO NOTHING; 
