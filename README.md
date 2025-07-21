# ichidan-dokusho-v2
# システム情報
## システム要件
- 以下技術スタックを利用すること
  - Node
  - Express
  - TypeScript
  - Supabase(PostgreSQL)
  - Passport.js + Google OAuth2.0 + JWT
  - React
  - Vite
  - Tailwind CSS
  - React Rounter DOM
  - axios
- モノレポ構成で、以下のディレクトリ構成を遵守すること
```
.
├── README.md
├── backend
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── data
│   ├── dist
│   ├── env.example
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   └── tsconfig.json
├── docker-compose.dev.yml
├── docs
│   ├── ...
├── frontend
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── dist
│   ├── env.example
│   ├── index.html
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── src
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── node_modules
│   ├── ...
├── package-lock.json
├── package.json
└── scripts
    ├── ...
```
- 
## 🚀 環境別起動方法
### 開発環境
#### 前提条件
- Docker Desktop がインストールされていること
#### 起動方法
```bash
# Docker Composeでアプリケーションとデータベースを起動
docker compose up --build -d

# アプリケーションにアクセス
# http://localhost:3002

# データベースに直接接続（開発用）
docker exec -it ichidan-dokusho-db-1 psql -U postgres -d ichidan_dokusho
```
### 本番環境
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
