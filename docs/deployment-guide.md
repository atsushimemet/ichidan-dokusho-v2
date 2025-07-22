# 本番環境デプロイガイド

## 概要
このドキュメントは、1段読書アプリケーションを本番環境（Netlify + Render + Supabase）にデプロイする手順を説明します。

## アーキテクチャ
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Netlify   │    │    Render   │    │   Supabase  │
│ (Frontend)  │◄──►│ (Backend)   │◄──►│ (Database)  │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 前提条件
- GitHubアカウント
- Netlifyアカウント
- Renderアカウント
- Supabaseアカウント

## 1. Supabase（データベース）セットアップ

### 1.1 プロジェクト作成
1. [Supabase](https://supabase.com)にログイン
2. 「New Project」をクリック
3. プロジェクト名: `ichidan-dokusho-v2`
4. データベースパスワードを設定（安全なパスワードを使用）
5. リージョン: `Asia Pacific (Tokyo)` を選択
6. 「Create new project」をクリック

### 1.2 データベーススキーマの適用
1. プロジェクトダッシュボードで「SQL Editor」を開く
2. `backend/supabase-schema.sql`の内容をコピー
3. SQLエディタに貼り付けて実行

### 1.3 接続情報の取得
1. 「Settings」→「Database」を開く
2. 以下の情報をメモ：
   - **Database URL**: `postgresql://postgres:[password]@[host]:5432/postgres`
   - **API Key (anon/public)**: フロントエンド用
   - **API Key (service_role)**: バックエンド用

## 2. Render（バックエンド）デプロイ

### 2.1 サービス作成
1. [Render](https://render.com)にログイン
2. 「New」→「Web Service」をクリック
3. GitHubリポジトリを接続
4. リポジトリ: `ichidan-dokusho-v2`を選択

### 2.2 設定
- **Name**: `ichidan-dokusho-backend`
- **Root Directory**: `backend`
- **Runtime**: `Docker`
- **Dockerfile**: `Dockerfile.prod`
- **Build Command**: `docker build -f Dockerfile.prod -t ichidan-dokusho-backend .`
- **Start Command**: `docker run -p 3001:3001 ichidan-dokusho-backend`
- **Plan**: `Free`

### 2.3 環境変数の設定
「Environment」タブで以下を設定：

```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
CORS_ORIGIN=https://[your-netlify-domain].netlify.app
```

### 2.4 デプロイ
1. 「Create Web Service」をクリック
2. Dockerイメージのビルドとデプロイが開始される
3. デプロイ完了まで待機（約10-15分）
4. 生成されたURLをメモ（例: `https://ichidan-dokusho-backend.onrender.com`）

### 2.5 Dockerfile.prodの確認
Renderで使用する`backend/Dockerfile.prod`の内容を確認：

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 3. Netlify（フロントエンド）デプロイ

### 3.1 サイト作成
1. [Netlify](https://netlify.com)にログイン
2. 「Add new site」→「Import an existing project」をクリック
3. GitHubリポジトリを接続
4. リポジトリ: `ichidan-dokusho-v2`を選択

### 3.2 ビルド設定
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `22`（Dockerfileと統一）

### 3.3 環境変数の設定
「Site settings」→「Environment variables」で以下を設定：

```
VITE_API_BASE_URL=https://[your-render-url].onrender.com
```

### 3.4 デプロイ
1. 「Deploy site」をクリック
2. デプロイ完了まで待機（約3-5分）
3. 生成されたURLをメモ（例: `https://ichidan-dokusho-v2.netlify.app`）

## 4. 環境変数の更新

### 4.1 Render環境変数の更新
NetlifyのURLが確定したら、Renderの環境変数を更新：

```
CORS_ORIGIN=https://[your-netlify-domain].netlify.app
```

### 4.2 フロントエンドコードの更新
本番環境用のAPI URLを設定するため、フロントエンドのコードを更新：

```typescript
// frontend/src/components/InputForm.tsx
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// API呼び出し部分を更新
const response = await fetch(`${API_BASE_URL}/api/reading-records`, {
  // ...
});
```

同様に`MyPage.tsx`と`Timeline.tsx`も更新。

## 5. 動作確認

### 5.1 バックエンドAPI確認
```bash
curl https://[your-render-url].onrender.com/health
```

### 5.2 フロントエンド確認
1. NetlifyのURLにアクセス
2. 入力フォームでテストデータを送信
3. マイページでデータが表示されることを確認
4. タイムラインでいいね機能が動作することを確認

## 6. カスタムドメイン設定（オプション）

### 6.1 Netlify
1. 「Domain settings」→「Custom domains」
2. ドメインを追加
3. DNS設定を更新

### 6.2 SSL証明書
- Netlify: 自動でLet's Encrypt証明書が発行される
- Render: 自動でSSL証明書が発行される

## 7. 監視とログ

### 7.1 Render
- 「Logs」タブでリアルタイムログを確認
- 「Metrics」タブでパフォーマンスを監視

### 7.2 Netlify
- 「Functions」タブでサーバーレス関数のログを確認
- 「Analytics」タブでアクセス解析を確認

### 7.3 Supabase
- 「Logs」でデータベースアクセスログを確認
- 「Database」でテーブル状況を監視

## 8. トラブルシューティング

### 8.1 よくある問題

#### CORSエラー
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```
**解決策**: Renderの環境変数`CORS_ORIGIN`を正しく設定

#### データベース接続エラー
```
Connection terminated unexpectedly
```
**解決策**: Supabaseの接続URLとパスワードを確認

#### ビルドエラー
```
Build failed
```
**解決策**: 
- Dockerfile.prodの構文を確認
- Node.jsバージョンを確認
- 依存関係のインストールを確認
- ビルドコマンドを確認
- Dockerイメージのビルドログを確認

### 8.2 ログの確認方法
1. **Render**: ダッシュボードの「Logs」タブ
2. **Netlify**: ダッシュボードの「Deploys」→「View deploy log」
3. **Supabase**: ダッシュボードの「Logs」

## 9. セキュリティ考慮事項

### 9.1 環境変数
- 機密情報は必ず環境変数で管理
- 本番環境の環境変数をGitにコミットしない

### 9.2 CORS設定
- 必要最小限のオリジンのみ許可
- 本番環境ではワイルドカード（`*`）を使用しない

### 9.3 データベース
- SupabaseのRow Level Security（RLS）を有効化
- 適切なポリシーを設定

## 10. コスト最適化

### 10.1 Render
- Freeプラン: 月間750時間まで
- スリープ機能を活用

### 10.2 Supabase
- Freeプラン: 月間500MBまで
- 不要なデータを定期的に削除

### 10.3 Netlify
- Freeプラン: 月間100GBまで
- 画像の最適化を実施

## 11. バックアップと復旧

### 11.1 データベースバックアップ
1. Supabaseダッシュボードで「Backups」
2. 自動バックアップが有効になっていることを確認
3. 必要に応じて手動バックアップを実行

### 11.2 コードバックアップ
- GitHubでバージョン管理
- 重要な変更はタグを付けて管理

## 12. 更新手順

### 12.1 コード更新
1. ローカルで変更をコミット
2. GitHubにプッシュ
3. NetlifyとRenderが自動でデプロイ

### 12.2 環境変数更新
1. 各サービスのダッシュボードで環境変数を更新
2. 必要に応じて手動でリデプロイ

---

## 作成日
2025年7月22日

## 更新履歴
- 2025年7月22日: 初版作成
- 2025年7月22日: RenderデプロイをDocker方式に変更
- 2025年7月22日: Node.jsバージョンを22に統一
- 2025年7月22日: RenderのDocker設定にBuild CommandとStart Commandを追加 
