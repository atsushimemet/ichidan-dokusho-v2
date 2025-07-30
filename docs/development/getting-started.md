# 🚀 開発環境セットアップガイド

一段読書アプリの開発を始めるためのセットアップ手順です。

## 📋 前提条件

### 必要なソフトウェア

- **Docker Desktop** (v4.0以上)
- **Docker Compose** (v2.0以上)
- **Git** (v2.30以上)
- **Node.js** (v18以上) - フロントエンド開発時
- **好みのエディタ** (VS Code推奨)

### 推奨VS Code拡張機能

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "esbenp.prettier-vscode",
    "ms-vscode-remote.remote-containers"
  ]
}
```

## 🔧 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/atsushimemet/ichidan-dokusho-v2.git
cd ichidan-dokusho-v2
```

### 2. 環境変数の設定

```bash
# バックエンド環境変数
cp backend/env.example backend/.env

# フロントエンド環境変数
cp frontend/env.example frontend/.env
```

環境変数の設定例：

```env
# backend/.env
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=ichidan_dokusho
NODE_ENV=development
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# frontend/.env
VITE_API_BASE_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Docker環境の起動

```bash
# 開発環境起動
docker compose -f docker-compose.dev.yml up -d

# 起動確認
docker compose -f docker-compose.dev.yml ps
```

期待される出力：
```
NAME                            IMAGE                         COMMAND                   SERVICE    CREATED        STATUS        PORTS
ichidan-dokusho-v2-backend-1    ichidan-dokusho-v2-backend    "docker-entrypoint.s…"   backend    21 hours ago   Up 19 hours   0.0.0.0:3001->3001/tcp
ichidan-dokusho-v2-db-1         postgres:15-alpine            "docker-entrypoint.s…"   db         21 hours ago   Up 19 hours   0.0.0.0:5433->5432/tcp
ichidan-dokusho-v2-frontend-1   ichidan-dokusho-v2-frontend   "docker-entrypoint.s…"   frontend   21 hours ago   Up 19 hours   0.0.0.0:3003->3002/tcp
```

### 4. データベースのセットアップ

```bash
# マイグレーション実行
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d ichidan_dokusho -f /docker-entrypoint-initdb.d/supabase-schema.sql

# 開発用マイグレーション実行（順番に）
for file in migrations/development/*.sql; do
  echo "Executing $file..."
  docker compose -f docker-compose.dev.yml exec db psql -U postgres -d ichidan_dokusho -c "$(cat $file)"
done
```

### 5. 動作確認

```bash
# バックエンドAPI確認
curl http://localhost:3001/health

# 期待されるレスポンス
# {"status":"OK","timestamp":"2025-07-30T06:02:39.850Z"}

# フロントエンドアクセス
open http://localhost:3003
```

## 🛠️ 開発ワークフロー

### 日常的な開発作業

```bash
# 開発環境起動
docker compose -f docker-compose.dev.yml up -d

# ログ確認
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend

# 開発環境停止
docker compose -f docker-compose.dev.yml down
```

### コンテナ内での作業

```bash
# バックエンドコンテナに入る
docker compose -f docker-compose.dev.yml exec backend bash

# フロントエンドコンテナに入る
docker compose -f docker-compose.dev.yml exec frontend bash

# データベースに接続
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d ichidan_dokusho
```

### 新機能開発の流れ

1. **フィーチャーブランチ作成**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **開発・テスト**
   ```bash
   # コード変更
   # 動作確認
   curl http://localhost:3001/api/your-endpoint
   ```

3. **コミット・プッシュ**
   ```bash
   git add .
   git commit -m "feat: 新機能の説明"
   git push -u origin feature/new-feature-name
   ```

4. **プルリクエスト作成**
   ```bash
   gh pr create --title "feat: 新機能の説明" --body "変更内容の詳細"
   ```

## 🧪 テスト実行

### バックエンドテスト

```bash
# ユニットテスト実行（準備中）
docker compose -f docker-compose.dev.yml exec backend npm test

# APIテスト実行
docker compose -f docker-compose.dev.yml exec backend npm run test:api
```

### フロントエンドテスト

```bash
# ユニットテスト実行（準備中）
docker compose -f docker-compose.dev.yml exec frontend npm test

# E2Eテスト実行（準備中）
docker compose -f docker-compose.dev.yml exec frontend npm run test:e2e
```

## 🔍 デバッグ手順

### よくある問題と解決法

#### 1. ポートが既に使用されている

```bash
# ポート使用状況確認
lsof -i :3001
lsof -i :3003
lsof -i :5433

# プロセス終了
kill -9 [PID]
```

#### 2. データベース接続エラー

```bash
# データベースコンテナ再起動
docker compose -f docker-compose.dev.yml restart db

# 接続確認
docker compose -f docker-compose.dev.yml exec db psql -U postgres -c "SELECT NOW();"
```

#### 3. フロントエンドのビルドエラー

```bash
# node_modules再インストール
docker compose -f docker-compose.dev.yml exec frontend rm -rf node_modules
docker compose -f docker-compose.dev.yml exec frontend npm install

# キャッシュクリア
docker compose -f docker-compose.dev.yml exec frontend npm run dev -- --force
```

### デバッグツール

```bash
# コンテナ内のプロセス確認
docker compose -f docker-compose.dev.yml exec backend ps aux

# リソース使用量確認
docker stats

# ネットワーク確認
docker network ls
docker inspect ichidan-dokusho-v2_default
```

## 📚 追加リソース

- [Docker Compose コマンド参考](https://docs.docker.com/compose/reference/)
- [PostgreSQL ドキュメント](https://www.postgresql.org/docs/)
- [React + Vite ガイド](https://vitejs.dev/guide/)
- [Express.js ドキュメント](https://expressjs.com/)

## 🆘 サポート

開発環境のセットアップで問題が発生した場合：

1. [トラブルシューティング](../troubleshooting/common-issues.md)を確認
2. GitHubのIssueで質問
3. 開発チームSlackで相談

Happy Coding! 🎉