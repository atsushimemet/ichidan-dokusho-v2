# 🔧 よくある問題と解決法

一段読書アプリでよく発生する問題とその解決方法をまとめています。

## 📋 目次

- [開発環境の問題](#開発環境の問題)
- [データベース関連](#データベース関連)
- [認証・ログイン問題](#認証ログイン問題)
- [API・バックエンド問題](#apiバックエンド問題)
- [フロントエンド問題](#フロントエンド問題)
- [パフォーマンス問題](#パフォーマンス問題)

## 🐳 開発環境の問題

### Docker関連

#### ❌ ポートが既に使用されている

**症状**
```
Error starting userland proxy: listen tcp4 0.0.0.0:3001: bind: address already in use
```

**解決法**
```bash
# 使用中のプロセスを確認
lsof -i :3001
lsof -i :3003
lsof -i :5433

# プロセスを終了
kill -9 [PID]

# または、異なるポートを使用
# docker-compose.dev.yml を編集
```

#### ❌ Docker ボリュームの権限問題

**症状**
```
Permission denied: '/app/node_modules'
```

**解決法**
```bash
# ボリュームを削除して再作成
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d

# または、権限を修正
docker compose -f docker-compose.dev.yml exec backend chown -R node:node /app
```

#### ❌ コンテナが起動しない

**症状**
```
Container exited with code 1
```

**解決法**
```bash
# ログを確認
docker compose -f docker-compose.dev.yml logs backend
docker compose -f docker-compose.dev.yml logs frontend
docker compose -f docker-compose.dev.yml logs db

# 環境変数を確認
docker compose -f docker-compose.dev.yml exec backend env

# コンテナを再ビルド
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up -d
```

## 🗄️ データベース関連

### PostgreSQL接続問題

#### ❌ データベース接続エラー

**症状**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解決法**
```bash
# データベースコンテナの状態確認
docker compose -f docker-compose.dev.yml ps db

# データベースコンテナ再起動
docker compose -f docker-compose.dev.yml restart db

# 接続テスト
docker compose -f docker-compose.dev.yml exec db psql -U postgres -c "SELECT NOW();"

# 環境変数確認
echo $DB_HOST
echo $DB_PORT
```

#### ❌ マイグレーション失敗

**症状**
```
relation "writing_themes" does not exist
```

**解決法**
```bash
# テーブルの存在確認
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d ichidan_dokusho -c "\dt"

# マイグレーション再実行
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d ichidan_dokusho -f /tmp/migration.sql

# 詳細は migrations/README.md を参照
```

#### ❌ データベースの文字化け

**症状**
日本語文字が「?」で表示される

**解決法**
```sql
-- エンコーディング確認
SHOW client_encoding;
SHOW server_encoding;

-- UTF-8に設定
SET client_encoding = 'UTF8';

-- データベース再作成（データが失われるので注意）
DROP DATABASE IF EXISTS ichidan_dokusho;
CREATE DATABASE ichidan_dokusho WITH ENCODING 'UTF8' LC_COLLATE='ja_JP.UTF-8' LC_CTYPE='ja_JP.UTF-8';
```

## 🔐 認証・ログイン問題

### Google OAuth関連

#### ❌ Google認証が失敗する

**症状**
```
Authentication failed: Invalid token
```

**解決法**
```bash
# 環境変数確認
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# Google Console設定確認
# 1. https://console.developers.google.com/
# 2. 認証情報 > OAuth 2.0 クライアント ID
# 3. 承認済みのリダイレクト URI を確認
# 4. 承認済みの JavaScript 生成元を確認
```

#### ❌ JWT トークンエラー

**症状**
```
JsonWebTokenError: invalid token
```

**解決法**
```bash
# JWT_SECRET環境変数確認
echo $JWT_SECRET

# トークンの期限確認
# ブラウザのDevTools > Application > Local Storage
# 期限切れの場合は再ログイン

# トークンデバッグ（https://jwt.io/ で確認）
```

## 🔌 API・バックエンド問題

### Node.js/Express関連

#### ❌ API応答が遅い

**症状**
APIリクエストに10秒以上かかる

**解決法**
```bash
# コンテナのリソース使用量確認
docker stats

# バックエンドログ確認
docker compose -f docker-compose.dev.yml logs -f backend

# データベースクエリ最適化
# Slow Query Log を確認

# PostgreSQL接続プール設定確認
# backend/src/database.ts の Pool設定
```

#### ❌ CORS エラー

**症状**
```
Access to fetch at 'http://localhost:3001/api/...' from origin 'http://localhost:3003' has been blocked by CORS policy
```

**解決法**
```javascript
// backend/src/index.ts で CORS設定確認
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3003',
  credentials: true
}));

// 環境変数確認
export CORS_ORIGIN="http://localhost:3003"
```

## 🎨 フロントエンド問題

### React/Vite関連

#### ❌ ページが真っ白になる

**症状**
アプリにアクセスしても白い画面のみ表示

**解決法**
```bash
# ブラウザのコンソールエラー確認
# F12 > Console タブ

# フロントエンドログ確認
docker compose -f docker-compose.dev.yml logs -f frontend

# ビルドエラー確認
docker compose -f docker-compose.dev.yml exec frontend npm run build

# キャッシュクリア
# ブラウザでCtrl+Shift+R（ハードリロード）
```

#### ❌ Hot Reload が動かない

**症状**
コードを変更してもブラウザが自動更新されない

**解決法**
```bash
# Vite設定確認
# frontend/vite.config.ts

# ファイル監視設定確認
docker compose -f docker-compose.dev.yml logs frontend | grep "watch"

# コンテナ再起動
docker compose -f docker-compose.dev.yml restart frontend
```

#### ❌ 環境変数が読み込まれない

**症状**
`import.meta.env.VITE_API_BASE_URL` が undefined

**解決法**
```bash
# 環境変数名確認（VITEプレフィックス必須）
# frontend/.env
VITE_API_BASE_URL=http://localhost:3001

# ファイルが正しい場所にあるか確認
ls -la frontend/.env

# コンテナ再起動
docker compose -f docker-compose.dev.yml restart frontend
```

## ⚡ パフォーマンス問題

### 遅延・レスポンス問題

#### ❌ 初回ロードが遅い

**症状**
アプリの初回アクセスに30秒以上かかる

**解決法**
```bash
# Docker リソース制限確認
docker system df
docker system prune

# データベース接続プール設定
# backend/src/database.ts
const pool = new Pool({
  max: 20, // 最大接続数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

# インデックス確認
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d ichidan_dokusho -c "
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
"
```

#### ❌ メモリ不足エラー

**症状**
```
JavaScript heap out of memory
```

**解決法**
```bash
# Node.jsメモリ制限を増加
# docker-compose.dev.yml
environment:
  - NODE_OPTIONS=--max-old-space-size=4096

# Docker Desktopのメモリ設定を確認
# Settings > Resources > Memory

# 不要なプロセス終了
docker system prune -a
```

## 🔍 デバッグ手順

### 段階的問題解決

1. **症状の特定**
   - エラーメッセージの記録
   - 発生条件の確認
   - 影響範囲の特定

2. **ログの確認**
   ```bash
   # 全サービスのログ確認
   docker compose -f docker-compose.dev.yml logs --tail=100
   
   # 特定サービスのログ
   docker compose -f docker-compose.dev.yml logs -f backend
   ```

3. **環境の確認**
   ```bash
   # コンテナ状態確認
   docker compose -f docker-compose.dev.yml ps
   
   # リソース使用量確認
   docker stats
   
   # 環境変数確認
   docker compose -f docker-compose.dev.yml exec backend env
   ```

4. **段階的復旧**
   ```bash
   # ソフトリスタート
   docker compose -f docker-compose.dev.yml restart
   
   # ハードリスタート
   docker compose -f docker-compose.dev.yml down
   docker compose -f docker-compose.dev.yml up -d
   
   # フルリビルド
   docker compose -f docker-compose.dev.yml down -v
   docker compose -f docker-compose.dev.yml build --no-cache
   docker compose -f docker-compose.dev.yml up -d
   ```

## 📞 サポート

上記の解決法で問題が解決しない場合：

1. **GitHubでIssue作成**
   - エラーメッセージ
   - 実行コマンド
   - 環境情報（OS、Dockerバージョン等）

2. **開発チームSlackで相談**
   - #troubleshooting チャンネル
   - スクリーンショット添付推奨

3. **緊急時は直接連絡**
   - 本番環境影響時
   - セキュリティ関連問題

## 💡 予防策

- 定期的な `docker system prune` 実行
- 開発環境の定期的な再構築
- 環境変数の適切な管理
- ログの定期的な確認