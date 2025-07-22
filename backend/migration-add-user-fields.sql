-- マイグレーション: reading_recordsテーブルにユーザー情報フィールドを追加
-- 実行日時: 2025-01-22

-- 1. user_idとuser_emailカラムを追加
ALTER TABLE reading_records 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- 2. インデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_reading_records_user_id ON reading_records(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_records_user_email ON reading_records(user_email);

-- 3. 既存の投稿にデフォルトユーザー情報を付与
UPDATE reading_records 
SET 
    user_id = 'demo_user_' || id, 
    user_email = 'demo' || id || '@example.com'
WHERE user_id IS NULL;

-- 4. サンプルデータの更新（既存のサンプルデータにユーザー情報を付与）
UPDATE reading_records 
SET 
    user_id = 'demo_user_1',
    user_email = 'demo1@example.com'
WHERE title = '7つの習慣';

UPDATE reading_records 
SET 
    user_id = 'demo_user_2',
    user_email = 'demo2@example.com'
WHERE title = '星の王子さま';

UPDATE reading_records 
SET 
    user_id = 'demo_user_3',
    user_email = 'demo3@example.com'
WHERE title = '嫌われる勇気';

-- 5. 確認用クエリ
-- SELECT id, title, user_id, user_email FROM reading_records ORDER BY id; 
