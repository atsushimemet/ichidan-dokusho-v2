-- ネタバレ関連のカラムを削除するマイグレーション

-- reading_recordsテーブルからcontains_spoilerカラムを削除
ALTER TABLE reading_records 
DROP COLUMN IF EXISTS contains_spoiler;

-- user_settingsテーブルからhide_spoilersカラムを削除
ALTER TABLE user_settings 
DROP COLUMN IF EXISTS hide_spoilers;
