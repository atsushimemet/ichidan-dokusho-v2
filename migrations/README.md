# Database Migrations

このディレクトリには、一段読書アプリのデータベースマイグレーションファイルが格納されています。

## ディレクトリ構造

```
migrations/
├── README.md           # このファイル
├── development/        # 開発環境用マイグレーションファイル
│   ├── 001-add-notes-field.sql
│   ├── 002-add-user-fields.sql
│   ├── 003-add-spoiler-fields.sql
│   └── 004-add-writing-themes.sql
└── production/        # 本番環境用マイグレーションファイル
    ├── 001-spoiler-fields.sql
    └── 002-writing-themes.sql
```

## 命名規則

### 開発環境用ファイル
- 形式: `NNN-description.sql`
- 例: `001-add-notes-field.sql`

### 本番環境用ファイル
- 形式: `NNN-feature-name.sql`
- 例: `001-spoiler-fields.sql`

## マイグレーションファイルの実行方法

### 開発環境（Docker）
```bash
# Docker コンテナ内で実行
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d ichidan_dokusho -f /path/to/migration.sql
```

### 本番環境（Supabase）
1. SupabaseコンソールのSQL Editorで実行
2. または、psqlコマンドで本番データベースに接続して実行

## 注意事項

- **本番環境でのマイグレーション実行前には必ずバックアップを取得してください**
- マイグレーションは順序通りに実行する必要があります
- ロールバック用のスクリプトも用意することを推奨します
- 新しいマイグレーションファイルは適切な番号で連番管理してください

## 履歴

| 番号 | ファイル名 | 説明 | 実行日 |
|------|------------|------|--------|
| 001 | add-notes-field.sql | notesフィールド追加 | 2025-07-25 |
| 002 | add-user-fields.sql | ユーザー関連フィールド追加 | 2025-07-26 |
| 003 | add-spoiler-fields.sql | ネタバレ機能追加 | 2025-07-26 |
| 004 | add-writing-themes.sql | 書きたいテーマ機能追加 | 2025-07-30 |

## 本番環境マイグレーション履歴

| 番号 | ファイル名 | 説明 | 実行予定日 |
|------|------------|------|-----------|
| 001 | spoiler-fields.sql | ネタバレ機能（実行済み） | 2025-07-26 |
| 002 | writing-themes.sql | 書きたいテーマ機能 | 未実行 |