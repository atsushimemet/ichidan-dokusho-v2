-- 読みたいもの・見たいものリストテーブルの作成
CREATE TABLE IF NOT EXISTS reading_wishlist (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    link TEXT,
    is_not_book BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_reading_wishlist_user_id ON reading_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_wishlist_created_at ON reading_wishlist(created_at);

-- 更新日時を自動更新するトリガーの作成
CREATE TRIGGER update_reading_wishlist_updated_at
    BEFORE UPDATE ON reading_wishlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();