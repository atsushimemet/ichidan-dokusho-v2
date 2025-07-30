# 📚 一段読書 v2

「完璧じゃなくていい。1ページの前進が、思考と行動を変えていく。」

忙しい人でも「読んだ」「考えた」「次に活かす」を毎日たった5分で完結できる、超ミニマム設計の読書習慣アプリです。

## 📖 目次

- [🚀 クイックスタート](#-クイックスタート)
- [📁 ドキュメント](#-ドキュメント)
- [🏗️ プロジェクト構成](#-プロジェクト構成)
- [💻 開発環境セットアップ](#-開発環境セットアップ)
- [🌐 本番環境](#-本番環境)
- [🎯 サービスコンセプト](#-サービスコンセプト)

## 🚀 クイックスタート

### 開発環境の起動

```bash
# リポジトリクローン
git clone https://github.com/atsushimemet/ichidan-dokusho-v2.git
cd ichidan-dokusho-v2

# Docker環境起動
docker compose -f docker-compose.dev.yml up -d

# アプリケーションアクセス
open http://localhost:3003
```

詳しいセットアップ手順は [開発環境セットアップガイド](./docs/development/getting-started.md) をご覧ください。

## 📁 ドキュメント

プロジェクトの技術ドキュメントは `docs/` ディレクトリに整理されています。

### 📋 主要ドキュメント

| ドキュメント | 説明 |
|------------|------|
| [📖 ドキュメント索引](./docs/README.md) | 全ドキュメントの目次・検索ガイド |
| [🚀 開発環境セットアップ](./docs/development/getting-started.md) | 開発を始めるための手順 |
| [📡 API仕様書](./docs/api/endpoints.md) | バックエンドAPI詳細 |
| [🗄️ マイグレーション手順](./docs/migrations/how-to-migrate.md) | データベース更新方法 |
| [🔧 トラブルシューティング](./docs/troubleshooting/common-issues.md) | よくある問題と解決法 |
| [🌐 本番デプロイガイド](./docs/deployment/production-guide.md) | 本番環境への展開手順 |

### 🔍 目的別ドキュメント検索

| やりたいこと | 参照ドキュメント |
|------------|----------------|
| 開発を始めたい | [getting-started.md](./docs/development/getting-started.md) |
| APIの使い方を知りたい | [endpoints.md](./docs/api/endpoints.md) |
| データベースを更新したい | [how-to-migrate.md](./docs/migrations/how-to-migrate.md) |
| エラーを解決したい | [common-issues.md](./docs/troubleshooting/common-issues.md) |
| 本番環境にデプロイしたい | [production-guide.md](./docs/deployment/production-guide.md) |

## 🏗️ プロジェクト構成

### 🛠️ 技術スタック

**フロントエンド**
- React + TypeScript
- Vite (開発サーバー・ビルドツール)
- Tailwind CSS (スタイリング)
- React Router DOM (ルーティング)

**バックエンド**
- Node.js v22 + Express
- TypeScript
- Google OAuth2.0 + JWT認証
- PostgreSQL (Supabase)

**インフラ・デプロイ**
- Docker + Docker Compose (開発環境)
- Netlify (フロントエンド)
- Render (バックエンド)
- Supabase (データベース)

### 📂 ディレクトリ構成
```
ichidan-dokusho-v2/
├── 📄 README.md                    # このファイル
├── 📄 CLAUDE.md                    # AI運用ガイドライン
├── 🗂️ backend/                     # バックエンドアプリケーション
│   ├── 🐳 Dockerfile.dev
│   ├── 🐳 Dockerfile.prod
│   ├── ⚙️ src/
│   │   ├── index.ts              # Express サーバー
│   │   ├── database.ts           # DB操作
│   │   └── auth.ts               # 認証処理
│   ├── 📄 package.json
│   └── ⚙️ env.example
├── 🗂️ frontend/                    # フロントエンドアプリケーション
│   ├── ⚙️ src/
│   │   ├── App.tsx               # メインアプリ
│   │   ├── components/           # Reactコンポーネント
│   │   ├── contexts/             # React Context
│   │   └── utils/                # ユーティリティ
│   ├── 📄 package.json
│   ├── ⚙️ vite.config.ts
│   └── ⚙️ env.example
├── 📚 docs/                        # 技術ドキュメント
│   ├── 📖 README.md              # ドキュメント索引
│   ├── 🚀 development/           # 開発ガイド
│   ├── 📡 api/                   # API仕様
│   ├── 🗄️ migrations/            # DB マイグレーション手順
│   ├── 🔧 troubleshooting/       # トラブルシューティング
│   └── 🌐 deployment/            # デプロイガイド
├── 🗄️ migrations/                  # データベースマイグレーション
│   ├── 🔧 development/           # 開発環境用
│   └── 🌐 production/            # 本番環境用
└── 🐳 docker-compose.dev.yml      # Docker開発環境設定
```

## 💻 開発環境セットアップ

### 🐳 Docker環境での開発

```bash
# 1. 環境変数設定
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# 2. Docker環境起動
docker compose -f docker-compose.dev.yml up -d

# 3. アプリケーションアクセス
open http://localhost:3003  # フロントエンド
open http://localhost:3001/health  # バックエンド (Health Check)

# 4. データベース接続（開発用）
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d ichidan_dokusho
```

詳細な手順は [開発環境セットアップガイド](./docs/development/getting-started.md) をご覧ください。

## 🌐 本番環境
- フロントエンド, Netlify
- バックエンド, Render
- DB, Supabase（PostgreSQL）

#### 前提条件
- Netlifyアカウント
- Renderアカウント
- Supabaseアカウント

#### クイックデプロイ
1. Supabaseプロジェクトを作成
2. `supabase-schema.sql` を実行
3. NetlifyでGitHubリポジトリを接続
4. 環境変数を設定
5. デプロイ完了

### データベース機能
- **PostgreSQL**: 読書記録の永続化
- **テーブル**: `reading_records`
- **保存項目**:
  - 読んだ本、文章のタイトル
  - 読んだ本、文章のリンク(書籍の場合、amazon link、入力されたlinkを開発者のアフィリエイトリンクに変換する)
  - 今日読んだ量（1文だけ/1段落/1章/1冊・全文の中からプルダウンで選択）
  - 今日の学び or 気づき
  - 明日の小さなアクション
  - 作成日時・更新日時（自動）

### API エンドポイント
- `POST /api/reading-records`: 新しい読書記録を保存
- `GET /api/reading-records`: 全ての読書記録を取得
- `GET /api/test-db`: データベース接続テスト

### 停止方法
```bash
# 全てのコンテナを停止・削除
docker compose down

# データベースのボリュームも削除する場合
docker compose down -v
```

# 🎯 コンセプト
- 「完璧じゃなくていい。1ページの前進が、思考と行動を変えていく。」
- 「1段読書」は、忙しい人でも「読んだ」「考えた」「次に活かす」を毎日たった5分で完結できる、超ミニマム設計の読書習慣アプリ。

# 🌱 サービスの価値
## ユーザーの悩み,「1段読書」の解決策
- 読書を続けられない,「1章 or 1段落だけ」を推奨。続ける心理的ハードルを下げる。
- 読んでも内容が残らない, 学びを一言で記録 → 行動につなげるアウトプット構造。
- 忙しくて時間がない, 入力3ステップ・5分以内で完了。
- インプットばかりで行動が伴わない, 「明日やる1つのアクション」を書くことを必須に。
- 誰かに褒められたい、だけど匿名性は維持したい, いいね機能と匿名性機能（ユーザーはランダムな識別子の名前しか持てない。）。
- 本以外の感想も書きたい, 読んだ本・文章はリンクで登録。書籍ならamazonリンク、文章ならWebリンク。

# ✍️ 入力設計（UIイメージ）
## 入力画面タイトル：📖 今日も1段、読んだ？
1. 読んだ本、文章のタイトル（例：『7つの習慣』）
2. 読んだ本、文章のリンク ※ 書籍の場合はamazonリンク。開発者のアフィリエイトリンクに変換されるようにする。(*1)
3. 今日読んだ量（選択）

- [ ] 1文だけ
- [ ] 1段落
- [ ] 1章
- [ ] 1冊・全文

3. 今日の学び or 気づき（例：「人の話を聴くとは、同意することではない」）
4. 明日の小さなアクション（例：「朝会で相手の話をさえぎらずに聞く」）
5. ✅ 完了
## 過去記録画面（マイページ）
- 過去記録した感想が登録日降順で縦に並ぶ。縦スクロールで振り返ることができる。
- ユーザーに割り振られた64文字のランダムな識別子が過去記録画面のURLになる。
- このページを閲覧したセッションはいいねすることができる。同一ユーザーは何度もいいねすることができる。思った回数だけいいねできる。
## タイムライン画面
- 過去記録画面（マイページ）の全ユーザーバージョン。
- 過去記録した感想が登録日降順で縦に並ぶ。縦スクロールで振り返ることができる。
- URLは/timeline
# トンマナ・他
- シンプルで温かみがある
- ページを捲るような体験がある
# 参考
(*1) Amazon.co.jpの特定の商品に対してシンプルなテキストリンクを作成したい場合
```
Amazon.co.jpの特定の商品へのシンプルなテキストリンクはどのように作ればよいですか。
リンク作成ページでは、さまざまなリンクタイプをお選びいただくことができます。リンクの中には、Amazon.co.jpの特定の商品にリンクを設定することができるものもあります。本プログラムでは、Amazonアソシエイト・プログラムのメンバーが適切なフォーマットのリンクを作成して直接商品リンクによる紹介料が得られるように、リンク作成ツールをお使いいただくことを推奨していますが、その一方で、シンプルなテキストリンクに関するお問い合わせを多数いただいています。Amazon.co.jpの特定の商品に対してシンプルなテキストリンクを作成したい場合、以下のリンクフォーマットをお使いください。

https://www.amazon.co.jp/dp/ASIN/ref=nosim?tag=あなたのアソシエイトID

このリンクフォーマットは、直接商品リンクによる紹介料の支払い対象となります。

ASINと「あなたアソシエイトID」の部分に実際の値を入れるだけです。

ASIN： ASINは、Amazonが特定の商品を識別するために使用している10桁の識別番号で、「Amazon Standard Item Number（Amazon標準商品番号）」の略です。 カタログ上のすべての商品に、固有のASINが割り当てられています。ASINは、商品の詳細ページの商品説明や売上ランキング、発売日などの情報と一緒に表示されています。以前は、書籍のASINにはその書籍のISBN（国際標準図書番号）が使用されていましたが、2007年1月1日にISBNを13桁にする規格改定が行われたため、現在は一部の書籍にはISBNではなくASINが記載されています。詳細については、13桁のISBNに関するFAQをご覧ください。

例： 『ハリー・ポッターと死の秘宝（第7巻）』（ハードカバー、英語版、児童書）にリンクを設定する場合、書籍の13桁のISBNは978-0747591054ですが、ASINは0747591059になります。

https://www.amazon.co.jp/dp/0747591059/ref=nosim?tag=あなたのアソシエイトID

『Adobe Photoshop Elements 5 (PC)』にリンクを設定したい場合、ASINはB000IB9QXIになります。

https://www.amazon.co.jp/dp/B000IB9QXI/ref=nosim?tag=あなたのアソシエイトID

あなたのアソシエイトID： あなたのアソシエイトIDは、あなたのアソシエイトアカウントを特定するために使用される固有のIDで、Amazonアソシエイト・プログラムに登録する際に自動的に生成されます。
```
[Amazon.co.jpの特定の商品へのシンプルなテキストリンクはどのように作ればよいですか。](https://affiliate.amazon.co.jp/help/node/topic/GP38PJ6EUR6PFBEC)
