-- 本番環境用：ネタバレ関連のカラムを削除するマイグレーション
-- 実行日時: 2025-08-10
-- 実行環境: Supabase本番環境

-- reading_recordsテーブルからcontains_spoilerカラムを削除
ALTER TABLE reading_records 
DROP COLUMN IF EXISTS contains_spoiler;

-- user_settingsテーブルからhide_spoilersカラムを削除
ALTER TABLE user_settings 
DROP COLUMN IF EXISTS hide_spoilers;

-- 実行確認用クエリ
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reading_records' AND column_name = 'contains_spoiler';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'hide_spoilers';
