# 🐛 モバイルタイムライン表示エラーの修正

## 📱 問題
スマートフォンでタイムラインにアクセスした際に、以下のエラーが発生していました：
- `Fetch API cannot load http://localhost:3001/api/session due to access control checks`
- `Session initialization error: TypeError: Load failed`
- タイムラインのローディングスピナーが止まらない

## 🔍 原因
`Timeline.tsx` の `initializeSession` 関数で、ハードコードされた `http://localhost:3001` を使用していたため、スマートフォンからアクセスできない状態でした。

## ✅ 修正内容
- **ファイル**: `frontend/src/components/Timeline.tsx`
- **変更**: `initializeSession` 関数で環境変数 `VITE_API_BASE_URL` を使用するように修正

### 修正前
```typescript
const response = await fetch('http://localhost:3001/api/session', {
```

### 修正後
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const response = await fetch(`${API_BASE_URL}/api/session`, {
```

## 🎯 期待される効果
1. **スマートフォンでのタイムライン表示**: 正常に動作するようになります
2. **CORSエラー解決**: 正しいバックエンドURL（Render）にアクセス
3. **セッション初期化**: エラーが解消されます
4. **PC・スマホ両対応**: 環境に応じて適切なAPI URLを使用

## 🚀 デプロイ手順
1. このPRがマージされると、Netlifyで自動的に再デプロイが実行されます
2. デプロイ完了後、スマートフォンでタイムラインをテストしてください
3. ローディングスピナーが正常に終了し、投稿が表示されることを確認してください

## 📋 テスト項目
- [ ] PCブラウザでタイムラインが正常に表示される
- [ ] スマートフォンでタイムラインが正常に表示される
- [ ] セッション初期化エラーが発生しない
- [ ] いいね機能が正常に動作する

## 🔗 関連Issue
- モバイルでのタイムライン表示エラー
- CORSエラーによるAPI接続失敗 
