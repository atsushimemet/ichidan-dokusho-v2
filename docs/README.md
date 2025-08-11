# 📚 一段読書 ドキュメント

一段読書アプリケーションの技術ドキュメント集です。

## 📁 ディレクトリ構成

```
docs/
├── README.md                    # このファイル
├── user-guide/                 # ユーザー向けガイド
│   └── service-overview.md     # サービス概要・利用ガイド
├── api/                        # API関連ドキュメント
│   └── endpoints.md            # APIエンドポイント仕様
├── deployment/                 # デプロイ関連
│   ├── production-guide.md     # 本番環境デプロイガイド
│   └── environment-setup.md    # 環境構築手順
├── development/                # 開発関連
│   ├── getting-started.md      # 開発環境セットアップ
│   ├── coding-standards.md     # コーディング規約
│   └── architecture.md         # アーキテクチャ設計
├── migrations/                 # データベースマイグレーション
│   ├── how-to-migrate.md       # マイグレーション実行手順
│   └── rollback-guide.md       # ロールバック手順
├── operations/                 # 運用関連
│   ├── monitoring.md           # 監視・ログ
│   └── backup-restore.md       # バックアップ・復旧
└── troubleshooting/           # トラブルシューティング
    ├── common-issues.md        # よくある問題と解決法
    ├── mobile-issues.md        # モバイル固有の問題
    └── third-party-issues.md   # 外部サービス連携問題
```

## 🔍 ドキュメント検索ガイド

### 目的別ドキュメント検索

| やりたいこと | 参照ドキュメント |
|------------|----------------|
| サービスの概要を知りたい | [user-guide/service-overview.md](./user-guide/service-overview.md) |
| 開発環境を構築したい | [development/getting-started.md](./development/getting-started.md) |
| 本番環境にデプロイしたい | [deployment/production-guide.md](./deployment/production-guide.md) |
| データベースを更新したい | [migrations/how-to-migrate.md](./migrations/how-to-migrate.md) |
| APIの仕様を知りたい | [api/endpoints.md](./api/endpoints.md) |
| エラーを解決したい | [troubleshooting/common-issues.md](./troubleshooting/common-issues.md) |
| モバイルの問題を解決したい | [troubleshooting/mobile-issues.md](./troubleshooting/mobile-issues.md) |

### 技術別ドキュメント検索

| 技術領域 | 関連ドキュメント |
|---------|----------------|
| フロントエンド (React/Vite) | development/, troubleshooting/mobile-issues.md |
| バックエンド (Node.js/Express) | api/, development/, operations/ |
| データベース (PostgreSQL/Supabase) | migrations/, operations/backup-restore.md |
| デプロイ (Netlify/Render) | deployment/ |
| 認証 (Google OAuth) | troubleshooting/third-party-issues.md |

## 📝 ドキュメント作成・更新ガイドライン

### 新しいドキュメントを作成する場合

1. 適切なカテゴリディレクトリを選択
2. ファイル名は英語、ケバブケース使用（例：`database-setup.md`）
3. ファイル先頭にタイトルと概要を記載
4. 目次（TOC）を含める（長い場合）
5. このREADMEの検索ガイドを更新

### ドキュメント構成の原則

- **操作手順**: ステップバイステップで記載
- **トラブルシューティング**: 症状 → 原因 → 解決法の順序
- **API仕様**: エンドポイント、パラメータ、レスポンス例を含める
- **スクリーンショット**: 必要に応じて画像を含める

## 🏷️ ラベル・タグ

ドキュメント内でよく使用するラベル：

- 🚀 **本番環境**: 本番環境での操作に関する内容
- 🔧 **開発環境**: 開発環境での操作に関する内容
- ⚠️ **注意**: 重要な注意事項
- 💡 **Tips**: 便利な情報やベストプラクティス
- 🐛 **バグ**: 既知の問題や回避策

## 📞 サポート

ドキュメントに関する質問や改善提案は、GitHubのIssueで受け付けています。