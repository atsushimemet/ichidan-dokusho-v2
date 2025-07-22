# ユーザー固有の投稿機能実装

## 概要
Google OAuth認証機能に続き、ユーザー固有の投稿機能を実装しました。これにより、各ユーザーは自分の投稿のみをマイページで確認でき、新規ユーザーは空のマイページから始まります。

## 主な変更点

### データベース
- `reading_records` テーブルに `user_id` と `user_email` フィールドを追加
- 既存の投稿にデフォルトユーザー情報（`demo_user_1`, `demo_user_2`, `demo_user_3`）を付与
- パフォーマンス向上のためのインデックスを追加

### バックエンド
- **`createReadingRecord`**: 投稿時にユーザー情報を保存するように修正
- **`getUserReadingRecords`**: ユーザー固有の投稿を取得する新しい関数を追加
- **`POST /api/reading-records`**: 認証必須に変更し、JWTからユーザー情報を取得
- **`GET /api/my-records`**: 認証されたユーザーの投稿のみを取得する新しいエンドポイント

### フロントエンド
- **`MyPage`**: `/api/my-records` を使用し、JWTトークンで認証
- **`InputForm`**: 投稿時にAuthorizationヘッダーを追加
- **認証コンテキスト**: 両コンポーネントで `useAuth` フックを使用

## 動作確認

### 開発環境
1. **見るだけ**: タイムラインで既存の投稿（デモユーザー）を確認
2. **使う**: Google認証でログイン
3. **マイページ**: 空の状態を確認
4. **投稿**: 新しい読書記録を作成
5. **マイページ**: 自分の投稿のみが表示されることを確認

### 期待される動作
- **既存の投稿**: デフォルトユーザー情報が付与され、タイムラインで表示
- **新規ユーザーA, B**: マイページは空（投稿していないため）
- **投稿時**: ユーザー情報が自動的に保存される
- **マイページ**: 自分の投稿のみが表示される
- **タイムライン**: 全ユーザーの投稿が表示される（既存の動作を維持）

## 本番環境へのデプロイ方法

### 1. Supabase（データベース）
1. SupabaseプロジェクトのSQLエディタにアクセス
2. `backend/migration-add-user-fields.sql` の内容を実行
3. 既存の投稿にユーザー情報が付与されることを確認

### 2. Render（バックエンド）
1. Renderダッシュボードでバックエンドサービスにアクセス
2. 環境変数を確認：
   - `JWT_SECRET`: 設定済み
   - `GOOGLE_CLIENT_ID`: 設定済み
   - データベース接続情報: 設定済み
3. 自動デプロイが実行されることを確認
4. デプロイ完了後、ヘルスチェック: `https://your-backend.onrender.com/health`

### 3. Netlify（フロントエンド）
1. Netlifyダッシュボードでフロントエンドサイトにアクセス
2. 環境変数を確認：
   - `VITE_API_BASE_URL`: バックエンドのURL
   - `VITE_GOOGLE_CLIENT_ID`: Google OAuthクライアントID
3. 自動デプロイが実行されることを確認
4. デプロイ完了後、サイトにアクセスして動作確認

### 4. デプロイ後の確認事項
1. **フロントエンド**: https://your-site.netlify.app
   - ホームページ（選択画面）が表示される
   - Google認証が正常に動作する
   - マイページでユーザー固有の投稿が表示される

2. **バックエンド**: https://your-backend.onrender.com
   - ヘルスチェックエンドポイントが正常に応答
   - データベース接続が正常
   - 認証エンドポイントが正常に動作

3. **データベース**: Supabaseダッシュボード
   - `reading_records` テーブルに `user_id` と `user_email` カラムが存在
   - 既存の投稿にデフォルトユーザー情報が付与されている

## 技術的な詳細

### 認証フロー
1. ユーザーがGoogle認証でログイン
2. バックエンドでJWTトークンを生成
3. フロントエンドでトークンを保存
4. API呼び出し時にAuthorizationヘッダーでトークンを送信
5. バックエンドでトークンを検証し、ユーザー情報を取得

### データベース設計
```sql
-- 既存のテーブル構造に追加
ALTER TABLE reading_records 
ADD COLUMN user_id VARCHAR(255),
ADD COLUMN user_email VARCHAR(255);

-- インデックス追加
CREATE INDEX idx_reading_records_user_id ON reading_records(user_id);
CREATE INDEX idx_reading_records_user_email ON reading_records(user_email);
```

### API エンドポイント
- `POST /api/reading-records` (認証必須): 新しい投稿を作成
- `GET /api/my-records` (認証必須): ユーザー固有の投稿を取得
- `GET /api/reading-records`: 全投稿を取得（タイムライン用）

## 注意事項
- 既存の投稿はデモユーザー情報が付与されます
- 新規ユーザーは投稿を作成するまでマイページは空です
- 認証が必要な機能はJWTトークンなしではアクセスできません

## 関連ファイル
- `backend/migration-add-user-fields.sql`: データベースマイグレーション
- `backend/src/database.ts`: データベース関数の更新
- `backend/src/index.ts`: APIエンドポイントの更新
- `frontend/src/components/MyPage.tsx`: マイページコンポーネントの更新
- `frontend/src/components/InputForm.tsx`: 入力フォームの更新 
