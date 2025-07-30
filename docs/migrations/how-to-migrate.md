# 📊 データベースマイグレーション実行手順

データベースのスキーマ変更を安全に実行するためのガイドです。

## 📋 目次

- [概要](#概要)
- [前提条件](#前提条件)
- [開発環境でのマイグレーション](#開発環境でのマイグレーション)
- [本番環境でのマイグレーション](#本番環境でのマイグレーション)
- [マイグレーション後の確認](#マイグレーション後の確認)
- [トラブルシューティング](#トラブルシューティング)

## 概要

一段読書アプリでは、以下の環境でマイグレーションを管理しています：

- **開発環境**: Docker PostgreSQL（開発・テスト用）
- **本番環境**: Supabase PostgreSQL（本番サービス用）

## 前提条件

### 開発環境
- Docker & Docker Compose がインストール済み
- 開発環境コンテナが起動中

### 本番環境
- Supabaseプロジェクトへのアクセス権限
- 本番データベースの**バックアップ実行済み** ⚠️

## 開発環境でのマイグレーション

### 1. 開発環境の起動確認

```bash
# Dockerコンテナ状態確認
docker compose -f docker-compose.dev.yml ps

# データベース接続確認
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d ichidan_dokusho -c "SELECT NOW();"
```

### 2. マイグレーションファイルの準備

```bash
# マイグレーションファイル確認
ls -la migrations/development/

# ファイル例：
# 001-add-notes-field.sql
# 002-add-user-fields.sql
# 003-add-spoiler-fields.sql
# 004-add-writing-themes.sql
```

### 3. マイグレーション実行

```bash
# 方法1: ファイルをコンテナにコピーして実行
docker compose -f docker-compose.dev.yml cp migrations/development/004-add-writing-themes.sql db:/tmp/migration.sql
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d ichidan_dokusho -f /tmp/migration.sql

# 方法2: 直接SQL内容を実行
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d ichidan_dokusho -c "$(cat migrations/development/004-add-writing-themes.sql)"
```

### 4. 実行結果確認

```bash
# テーブル作成確認
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d ichidan_dokusho -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
"

# カラム確認（例：writing_themesテーブル）
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d ichidan_dokusho -c "
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'writing_themes';
"
```

## 本番環境でのマイグレーション

### ⚠️ 重要な注意事項

1. **必ずバックアップを取得**してから実行
2. **メンテナンス時間を設定**（必要に応じて）
3. **ロールバック手順を準備**
4. **段階的にテスト実行**

### 1. 事前準備

```bash
# 本番マイグレーションファイル確認
ls -la migrations/production/

# ファイル例：
# 001-spoiler-fields.sql (実行済み)
# 002-writing-themes.sql (実行予定)
```

### 2. Supabaseでの実行手順

#### 方法A: SupabaseコンソールのSQL Editor

1. [Supabaseダッシュボード](https://supabase.com/dashboard) にログイン
2. プロジェクト選択
3. 左メニューから「SQL Editor」を選択
4. 「New Query」をクリック
5. マイグレーションファイルの内容をコピー&ペースト
6. 「Run」ボタンで実行

#### 方法B: psqlコマンド（推奨）

```bash
# 接続情報を環境変数に設定（例）
export PGHOST="db.xxx.supabase.co"
export PGPORT="5432"
export PGDATABASE="postgres"
export PGUSER="postgres"
export PGPASSWORD="your-password"

# マイグレーション実行
psql -f migrations/production/002-writing-themes.sql

# または直接SQL実行
psql -c "$(cat migrations/production/002-writing-themes.sql)"
```

### 3. 実行例（writing-themesテーブル作成）

```sql
-- migrations/production/002-writing-themes.sql の内容

-- 1. テーブル作成
CREATE TABLE IF NOT EXISTS writing_themes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    theme_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. インデックス作成
CREATE INDEX IF NOT EXISTS idx_writing_themes_user_id ON writing_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_themes_created_at ON writing_themes(created_at);

-- 3. トリガー作成
CREATE TRIGGER update_writing_themes_updated_at 
    BEFORE UPDATE ON writing_themes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## マイグレーション後の確認

### 1. データベース構造確認

```sql
-- テーブル存在確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'writing_themes';

-- カラム構造確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'writing_themes'
ORDER BY ordinal_position;

-- インデックス確認
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename = 'writing_themes';
```

### 2. アプリケーション動作確認

```bash
# バックエンドAPI確認
curl -X GET "https://your-api-domain.com/health"

# 新機能のAPIエンドポイント確認（認証必要）
curl -X GET "https://your-api-domain.com/api/writing-themes" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. フロントエンド確認

1. アプリケーションにアクセス
2. 新機能（設定ページのテーマ管理）を確認
3. テーマの追加・編集・削除をテスト
4. エラーログの確認

## トラブルシューティング

### よくある問題と解決法

#### 1. 「relation already exists」エラー

```sql
-- 原因: テーブルが既に存在
-- 解決: IF NOT EXISTS を使用（推奨）またはテーブル削除後再実行

-- 確認
SELECT table_name FROM information_schema.tables WHERE table_name = 'writing_themes';

-- 削除（慎重に実行）
DROP TABLE IF EXISTS writing_themes CASCADE;
```

#### 2. 「function does not exist」エラー

```sql
-- 原因: トリガー関数が存在しない
-- 解決: 関数を作成

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

#### 3. 権限不足エラー

```sql
-- 原因: データベースユーザーに権限がない
-- 解決: 適切な権限を付与

-- 確認
SELECT * FROM information_schema.role_table_grants 
WHERE grantee = 'your_user' AND table_name = 'writing_themes';

-- 権限付与（管理者権限が必要）
GRANT ALL PRIVILEGES ON writing_themes TO your_user;
GRANT USAGE, SELECT ON SEQUENCE writing_themes_id_seq TO your_user;
```

### ロールバック手順

緊急時のロールバック方法は [rollback-guide.md](./rollback-guide.md) を参照してください。

## 📞 サポート

マイグレーション実行時に問題が発生した場合：

1. エラーメッセージとSQL文を記録
2. データベースの現在の状態を確認
3. GitHubのIssueまたは開発チームに連絡
4. 緊急時は直ちにロールバックを検討