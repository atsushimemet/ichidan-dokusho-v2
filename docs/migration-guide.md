# マイグレーション手順書：要約リンク機能の追加

## 概要
このマイグレーションでは、`books` テーブルに3つの要約リンクフィールド（`summary_link1`, `summary_link2`, `summary_link3`）を追加します。これにより、書籍に関連する要約情報（Webリンク、YouTubeリンクなど）を任意で3つまで保存できるようになります。

## 変更内容

### 1. データベーススキーマの変更
- `books` テーブルに以下のカラムを追加：
  - `summary_link1` (TEXT, NULL許可)
  - `summary_link2` (TEXT, NULL許可)  
  - `summary_link3` (TEXT, NULL許可)

### 2. バックエンドAPI の変更
- `/api/admin/books` エンドポイントで要約リンクを受け取り・保存
- `createBook` 関数の引数に要約リンクフィールドを追加

### 3. フロントエンドフォームの変更
- `/admin/register` ページに要約リンク入力フィールドを3つ追加
- バリデーション：URL形式チェック、任意項目

## マイグレーション実行手順

### ステップ 1: データベースマイグレーション

#### 開発環境での実行
```bash
# プロジェクトルートディレクトリに移動
cd /workspace

# PostgreSQLに接続してマイグレーションを実行
psql -h localhost -U postgres -d your_database_name -f migrations/add_summary_links_to_books.sql
```

#### 本番環境での実行
```bash
# 本番データベースのバックアップを作成（必須）
pg_dump -h your_prod_host -U your_prod_user your_prod_db > backup_$(date +%Y%m%d_%H%M%S).sql

# マイグレーションファイルを本番サーバーにアップロード
scp migrations/add_summary_links_to_books.sql user@prod-server:/path/to/migrations/

# 本番データベースでマイグレーションを実行
psql -h your_prod_host -U your_prod_user your_prod_db -f /path/to/migrations/add_summary_links_to_books.sql
```

### ステップ 2: アプリケーションのデプロイ

#### バックエンドのデプロイ
```bash
# バックエンドディレクトリに移動
cd backend

# 依存関係のインストール（必要に応じて）
npm install

# TypeScriptのビルド
npm run build

# アプリケーションの再起動
npm restart
# または
pm2 restart your-app-name
```

#### フロントエンドのデプロイ
```bash
# フロントエンドディレクトリに移動
cd frontend

# 依存関係のインストール（必要に応じて）
npm install

# プロダクションビルド
npm run build

# ビルド成果物をWebサーバーにデプロイ
# 例：Nginxの場合
sudo cp -r dist/* /var/www/html/
```

### ステップ 3: 動作確認

#### 1. データベース確認
```sql
-- テーブル構造の確認
\d books;

-- 新しいカラムが追加されていることを確認
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'books' 
AND column_name LIKE 'summary_link%';
```

#### 2. API 動作確認
```bash
# 要約リンク付きで書籍登録のテスト
curl -X POST http://localhost:3001/api/admin/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "テスト書籍",
    "amazon_link": "https://www.amazon.co.jp/dp/test",
    "summary_link1": "https://example.com/summary1",
    "summary_link2": "https://www.youtube.com/watch?v=test",
    "summary_link3": "https://note.com/test-summary",
    "tags": ["テスト"],
    "username": "your_admin_username",
    "password": "your_admin_password"
  }'
```

#### 3. フロントエンド動作確認
1. `/admin/register` ページにアクセス
2. 管理者認証を行う
3. 書籍情報フォームに以下が表示されることを確認：
   - 要約リンク1 (任意)
   - 要約リンク2 (任意) 
   - 要約リンク3 (任意)
4. 要約リンクを入力して書籍登録が正常に動作することを確認

## ロールバック手順

### 緊急時のロールバック
問題が発生した場合は、以下の手順でロールバックできます：

#### 1. アプリケーションのロールバック
```bash
# 前のバージョンのアプリケーションに戻す
git checkout previous-version-tag
npm run build
npm restart
```

#### 2. データベースのロールバック
```sql
-- 要約リンクカラムを削除（データも失われるため注意）
ALTER TABLE books 
DROP COLUMN IF EXISTS summary_link1,
DROP COLUMN IF EXISTS summary_link2,
DROP COLUMN IF EXISTS summary_link3;
```

#### 3. バックアップからの復元（最終手段）
```bash
# 事前に作成したバックアップからデータベースを復元
psql -h your_host -U your_user your_db < backup_YYYYMMDD_HHMMSS.sql
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. マイグレーション実行時のエラー
**問題**: `relation "books" does not exist`
**解決**: booksテーブルが存在しない場合は、先にベーステーブルを作成する

#### 2. API でエラーが発生する
**問題**: `column "summary_link1" does not exist`
**解決**: データベースマイグレーションが正常に完了していない可能性があります。ステップ1を再実行してください。

#### 3. フロントエンドでフォームが表示されない
**問題**: 要約リンクのフィールドが表示されない
**解決**: ブラウザのキャッシュをクリアするか、ハードリフレッシュ（Ctrl+F5）を実行してください。

## 注意事項

1. **バックアップ**: 本番環境でのマイグレーション前に必ずデータベースのバックアップを作成してください。

2. **ダウンタイム**: このマイグレーションは既存のデータに影響を与えませんが、アプリケーションの再起動が必要です。

3. **データ型**: summary_linkフィールドはTEXT型で、URL検証はフロントエンドで行われます。

4. **NULL値**: 要約リンクは任意項目のため、NULL値が許可されています。

5. **文字数制限**: TEXT型のため理論上制限はありませんが、実用的には2048文字程度に留めることを推奨します。

## 関連ファイル

- **マイグレーションファイル**: `/migrations/add_summary_links_to_books.sql`
- **バックエンドAPI**: `/backend/src/index.ts` (admin/books エンドポイント)
- **データベース関数**: `/backend/src/database.ts` (createBook関数)
- **フロントエンドコンポーネント**: `/frontend/src/components/BookRegisterPage.tsx`

## 更新履歴

- **2024-01-XX**: 初版作成 - 要約リンク機能の追加