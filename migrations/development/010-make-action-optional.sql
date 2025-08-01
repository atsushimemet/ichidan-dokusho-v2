-- Issue #110: 明日の小さなアクションを任意項目にする
-- actionフィールドをNOT NULLからNULL許可に変更

-- 既存のNOT NULL制約を削除
ALTER TABLE reading_records ALTER COLUMN action DROP NOT NULL;

-- コメントを追加
COMMENT ON COLUMN reading_records.action IS '明日の小さなアクション（任意項目）'; 
