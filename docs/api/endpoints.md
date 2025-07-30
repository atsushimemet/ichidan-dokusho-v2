# 📡 API エンドポイント仕様

一段読書アプリのバックエンドAPI仕様書です。

## 🔗 ベースURL

- **開発環境**: `http://localhost:3001`
- **本番環境**: `https://your-api-domain.com`

## 🔐 認証

ほとんどのAPIエンドポイントでJWT認証が必要です。

### 認証ヘッダー

```http
Authorization: Bearer <JWT_TOKEN>
```

### トークン取得

```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "google_id_token"
}
```

## 📋 エンドポイント一覧

### 🏥 ヘルスチェック

#### GET /health

システムの状態確認

**リクエスト**
```http
GET /health
```

**レスポンス**
```json
{
  "status": "OK",
  "timestamp": "2025-07-30T06:02:39.850Z"
}
```

### 🔐 認証関連

#### POST /api/auth/google

Google OAuth認証

**リクエスト**
```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**レスポンス**
```json
{
  "message": "Authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": "google_user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

#### GET /api/auth/verify

認証状態確認 🔒

**リクエスト**
```http
GET /api/auth/verify
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス**
```json
{
  "message": "Token is valid",
  "user": {
    "userId": "user_id",
    "email": "user@example.com"
  }
}
```

### 📚 読書記録関連

#### GET /api/reading-records

全読書記録取得

**リクエスト**
```http
GET /api/reading-records?sessionId=session_123
```

**パラメータ**
- `sessionId` (optional): いいね状態取得用のセッションID

**レスポンス**
```json
{
  "message": "Reading records retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "7つの習慣",
      "link": "https://www.amazon.co.jp/dp/ASIN/ref=nosim?tag=test",
      "reading_amount": "1章",
      "learning": "人の話を聴くとは、同意することではない",
      "action": "朝会で相手の話をさえぎらずに聞く",
      "notes": "メモ内容",
      "is_not_book": false,
      "custom_link": null,
      "contains_spoiler": false,
      "user_id": "user_123",
      "user_email": "user@example.com",
      "created_at": "2025-07-30T05:58:57.438471Z",
      "updated_at": "2025-07-30T05:58:57.438471Z",
      "like_count": "5",
      "is_liked": true
    }
  ]
}
```

#### GET /api/my-records

ユーザー固有の読書記録取得 🔒

**リクエスト**
```http
GET /api/my-records?sessionId=session_123
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス**
```json
{
  "message": "User reading records retrieved successfully",
  "data": [
    // 読書記録のオブジェクト配列（上記と同じ形式）
  ]
}
```

#### POST /api/reading-records

新しい読書記録を作成 🔒

**リクエスト**
```http
POST /api/reading-records
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "書籍タイトル",
  "reading_amount": "1章",
  "learning": "学んだ内容",
  "action": "実行するアクション",
  "notes": "メモ（任意）",
  "isNotBook": false,
  "customLink": "https://example.com",
  "containsSpoiler": false
}
```

**レスポンス**
```json
{
  "message": "Reading record created successfully",
  "data": {
    "id": 123,
    "title": "書籍タイトル",
    // ... その他のフィールド
  }
}
```

#### PUT /api/reading-records/:id

読書記録を更新

**リクエスト**
```http
PUT /api/reading-records/123
Content-Type: application/json

{
  "title": "更新されたタイトル",
  "learning": "更新された学び",
  "action": "更新されたアクション",
  "containsSpoiler": true
}
```

#### DELETE /api/reading-records/:id

読書記録を削除

**リクエスト**
```http
DELETE /api/reading-records/123
```

### ❤️ いいね機能

#### POST /api/reading-records/:id/like

いいねを追加

**リクエスト**
```http
POST /api/reading-records/123/like
Content-Type: application/json

{
  "sessionId": "session_123"
}
```

#### DELETE /api/reading-records/:id/like

いいねを削除

**リクエスト**
```http
DELETE /api/reading-records/123/like
Content-Type: application/json

{
  "sessionId": "session_123"
}
```

### ⚙️ ユーザー設定

#### GET /api/user-settings

ユーザー設定取得 🔒

**リクエスト**
```http
GET /api/user-settings
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス**
```json
{
  "hideSpoilers": false
}
```

#### PUT /api/user-settings

ユーザー設定更新 🔒

**リクエスト**
```http
PUT /api/user-settings
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "hideSpoilers": true
}
```

### 🎨 書きたいテーマ関連

#### GET /api/writing-themes

書きたいテーマ一覧取得 🔒

**リクエスト**
```http
GET /api/writing-themes
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス**
```json
{
  "message": "Writing themes retrieved successfully",
  "data": [
    {
      "id": 1,
      "user_id": "user_123",
      "theme_name": "キャリア",
      "created_at": "2025-07-30T05:58:57.438471Z",
      "updated_at": "2025-07-30T05:58:57.438471Z"
    }
  ]
}
```

#### POST /api/writing-themes

新しいテーマを作成 🔒

**リクエスト**
```http
POST /api/writing-themes
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "theme_name": "プログラミング"
}
```

**制限事項**
- テーマ名: 100文字以内
- 最大10テーマまで作成可能

**エラーレスポンス（制限超過時）**
```json
{
  "message": "テーマは最大10個まで設定できます。新しいテーマを追加するには、既存のテーマを削除してください。"
}
```

#### PUT /api/writing-themes/:id

テーマを更新 🔒

**リクエスト**
```http
PUT /api/writing-themes/1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "theme_name": "キャリア開発"
}
```

#### DELETE /api/writing-themes/:id

テーマを削除 🔒

**リクエスト**
```http
DELETE /api/writing-themes/1
Authorization: Bearer <JWT_TOKEN>
```

### 🔍 検索・ユーティリティ

#### GET /api/reading-records/search/title

タイトルで読書記録を検索

**リクエスト**
```http
GET /api/reading-records/search/title?q=習慣&limit=5
```

#### POST /api/extract-amazon-info

AmazonURLから書籍情報を抽出

**リクエスト**
```http
POST /api/extract-amazon-info
Content-Type: application/json

{
  "amazonUrl": "https://www.amazon.co.jp/dp/B00KFB5DJC"
}
```

#### POST /api/search-amazon

タイトルからAmazonリンクを検索

**リクエスト**
```http
POST /api/search-amazon
Content-Type: application/json

{
  "title": "7つの習慣"
}
```

## 🚨 エラーレスポンス

### 標準エラー形式

```json
{
  "message": "エラーメッセージ",
  "error": "詳細なエラー情報"
}
```

### HTTPステータスコード

- `200`: 成功
- `201`: 作成成功
- `400`: リクエストエラー（バリデーション失敗等）
- `401`: 認証エラー
- `403`: 認可エラー
- `404`: リソースが見つからない
- `500`: サーバーエラー

### よくあるエラー

#### 認証エラー
```json
{
  "message": "User authentication required"
}
```

#### バリデーションエラー
```json
{
  "message": "Missing required fields: title, reading_amount, learning, action"
}
```

## 📊 レート制限

現在、レート制限は実装されていませんが、将来的に以下の制限を予定：

- **認証済みユーザー**: 1000リクエスト/時間
- **未認証ユーザー**: 100リクエスト/時間

## 🔄 API バージョニング

現在はv1のみ提供。将来的なバージョン管理計画：

- `v1`: 現在の仕様
- `v2`: GraphQL対応（予定）

## 📞 サポート

API仕様に関する質問や不具合報告は、GitHubのIssueで受け付けています。