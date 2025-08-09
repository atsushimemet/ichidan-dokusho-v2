# Bottom Navigation Bar 実装設計書

## 概要

### プロジェクト概要
本設計書は、GitHubイシュー#164「bottom navでread, memo, writeのナビゲーションを移動」の実装に関する詳細な設計仕様書です。現在ハンバーガーメニューに配置されている「読む」「メモ」「書く」のナビゲーション機能をBottom Navigation Barに移行し、ユーザビリティの向上を図ります。

### 背景と目的
- **背景**: 現在の読書記録アプリでは、主要機能である「読む」「メモ」「書く」がハンバーガーメニュー内に配置されており、ユーザーがこれらの機能にアクセスするためには複数のタップが必要
- **目的**: Bottom Navigation Barを導入することで、主要機能への直接アクセスを可能にし、モバイルファーストなUXを実現する

## サブイシュー分析

### Sub-Issue 1: ハンバーガーメニューからのナビゲーションリンク削除
- **現状**: `App.tsx:94-128`行にて以下のナビゲーションリンクが実装されている
  - 📖 読む（登録画面） → `/reading`
  - 📝 メモ（入力画面） → `/input`
  - ✍️ 書く（出力画面） → `/draft-output`
  - 📚 マイページ → `/mypage`
- **対象**: これら4つのリンクをハンバーガーメニューから削除
- **残存項目**: 以下は引き続きハンバーガーメニューに残存（Issue #168により並び順変更）
  - 📊 ダッシュボード → `/dashboard`
  - 🌟 タイムライン → `/timeline` （全ユーザー共通）
  - ⚙️ 設定 → `/settings`
  - ❓ Q&A → `/qa` （全ユーザー共通）
  - 📍 場所を探す → 外部リンク（区切り線付き）
  - 🚪 ログアウト → 認証機能

### Sub-Issue 2: ナビゲーションアクセス手段の変更
- **現状**: `/reading`、`/input`、`/draft-output`、`/mypage` の4つのルートパスが存在
- **対応**: ルートパス自体は維持し、アクセス手段をハンバーガーメニューからBottom Navigation Barに移行
- **注意**: URL構造やルーティング設定に変更は不要

### Sub-Issue 3: Bottom Navigation Barの確立
- **要件**: 新しいBottom Navigation Barコンポーネントの作成
- **配置**: アプリケーション下部に固定配置

### Sub-Issue 4: Bottom Navigation Barへのナビゲーションリンク追加
- **要件**: 「読む」「メモ」「書く」機能への直接アクセス機能を追加

### Sub-Issue 5: ハンバーガーメニューの並び順変更（Issue #168）
- **要件**: ハンバーガーメニューの項目順序を以下に変更
  1. 📊 ダッシュボード → `/dashboard`
  2. 🌟 タイムライン → `/timeline`
  3. ⚙️ 設定 → `/settings`
  4. ❓ Q&A → `/qa`
  5. 📍 場所を探す → 外部リンク（区切り線付き）
  6. 🚪 ログアウト → 認証機能

## 現状分析

### 既存ナビゲーション構造
```tsx
// App.tsx (Lines 82-172) - 完全なハンバーガーメニュー構造
<div className="py-2">
  {/* 未認証ユーザー向け */}
  {!isAuthenticated && (
    <Link to="/">🏠 ホーム</Link>
  )}

  {/* 認証済みユーザー向け */}
  {isAuthenticated && (
    <>
      <Link to="/reading">📖 読む（登録画面）</Link>      // 移行対象
      <Link to="/input">📝 メモ（入力画面）</Link>        // 移行対象  
      <Link to="/draft-output">✍️ 書く（出力画面）</Link> // 移行対象
      <Link to="/mypage">📚 マイページ</Link>            // 移行対象
      <Link to="/dashboard">📊 ダッシュボード</Link>     // 残存（1番目）
    </>
  )}
  
  {/* 全ユーザー共通 */}
  <Link to="/timeline">🌟 タイムライン</Link>           // 残存（2番目）
  
  {/* 認証済みユーザー向け（続き） */}
  {isAuthenticated && (
    <Link to="/settings">⚙️ 設定</Link>               // 残存（3番目）
  )}
  
  {/* 全ユーザー共通（続き） */}
  <Link to="/qa">❓ Q&A</Link>                        // 残存（4番目）
  
  {/* 外部リンク（区切り線付き） */}
  <div className="border-t border-orange-100 mt-2 pt-2">
    <a href="https://ichidan-dokusho-place-frontend.onrender.com/" target="_blank">
      📍 場所を探す
    </a>
  </div>
  
  {/* 認証済みユーザーのログアウト */}
  {isAuthenticated && (
    <button onClick={handleLogout}>🚪 ログアウト</button>
  )}
</div>
```

### 技術スタック
参照元: `frontend/package.json`、`frontend/tsconfig.app.json`
- **フレームワーク**: React 19.1.0 + TypeScript 5.8.3
- **ルーティング**: React Router DOM 7.7.0
- **スタイリング**: Tailwind CSS 3.4.17
- **ビルドツール**: Vite 7.0.4

### 現在のルート構造
```tsx
// 対象ルート
<Route path="/reading" element={<ReadingPage />} />
<Route path="/input" element={<InputForm />} />
<Route path="/draft-output" element={<DraftOutputPage />} />
```

## 新システム設計

### Bottom Navigation Bar仕様

#### コンポーネント設計
```tsx
interface BottomNavigationBarProps {
  currentPath: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  requiresAuth: boolean;
}
```

#### ナビゲーションアイテム定義
```tsx
const navigationItems: NavigationItem[] = [
  {
    id: 'mypage',
    label: 'マイページ',
    icon: '📚',
    path: '/mypage',
    requiresAuth: true
  },
  {
    id: 'read',
    label: '読む',
    icon: '📖',
    path: '/reading',
    requiresAuth: true
  },
  {
    id: 'memo',
    label: 'メモ',
    icon: '📝',
    path: '/input',
    requiresAuth: true
  },
  {
    id: 'write',
    label: '書く',
    icon: '✍️',
    path: '/draft-output',
    requiresAuth: true
  }
];
```

**注意**: ハンバーガーメニューには以下が残存し、Bottom Navigation Barとの機能分離を実現
- ダッシュボード、設定（認証済みユーザー向け）
- タイムライン、Q&A（全ユーザー共通）
- 場所を探す（外部リンク）
- ログアウト（認証機能）

### レスポンシブ対応
- **デスクトップ**: 非表示 (`hidden lg:hidden`)
- **タブレット**: 条件付き表示 (`hidden md:block lg:hidden`)
- **モバイル**: 常時表示 (`block md:hidden`)

### スタイリング仕様
```css
.bottom-nav {
  /* Tailwind Classes */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(251, 146, 60, 0.1);
  padding: 0.75rem 0;
  z-index: 40;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.nav-item.active {
  background: rgba(251, 146, 60, 0.1);
  color: rgb(234, 88, 12);
}
```

## 実装計画

### Phase 1: Bottom Navigation Barコンポーネント作成
1. **ファイル作成**: `src/components/BottomNavigationBar.tsx`
2. **型定義**: インターフェースとタイプの定義
3. **基本機能**: ナビゲーション表示とルーティング
4. **スタイリング**: Tailwind CSSによるデザイン実装

### Phase 2: App.tsxの修正
1. **インポート**: BottomNavigationBarコンポーネントの追加
2. **ハンバーガーメニュー**: 該当リンクの削除（Lines 94-128）
3. **ハンバーガーメニュー**: 残存項目の並び順変更（Issue #168対応）
4. **レイアウト**: Bottom Navigation Barの配置
5. **認証チェック**: 認証状態に応じた表示制御

### Phase 3: レスポンシブ対応
1. **ブレークポイント**: Tailwind CSSブレークポイントの設定
2. **条件付きレンダリング**: デバイスサイズによる表示制御
3. **レイアウト調整**: コンテンツエリアの下部マージン追加

### Phase 4: アクセシビリティ対応
1. **ARIA属性**: 適切なaria-labelの付与
2. **キーボード対応**: Tab navigationの実装
3. **スクリーンリーダー**: 適切な読み上げ対応

## UI/UX要件

### デザイン原則
- **モバイルファースト**: スマートフォンでの利用を最優先
- **一貫性**: 既存のデザインシステムとの統一
- **直感性**: アイコンとラベルによる分かりやすい表示
- **アクセシビリティ**: WCAG 2.1 AA準拠

### ビジュアルデザイン
- **配色**: 既存のオレンジ系カラーパレット（orange-50〜orange-600）を継承
- **タイポグラフィ**: システムフォント使用（system-ui, Avenir, Helvetica, Arial）
- **アイコン**: 絵文字ベースアイコンで統一
- **アニメーション**: 0.2s transitionでスムーズな操作感

### インタラクション
- **アクティブ状態**: 現在ページの視覚的フィードバック
- **ホバー効果**: デスクトップでの追加インタラクション
- **タップ効果**: モバイルでの適切なタップ領域（最小44x44px）

## 技術仕様

### コンポーネント設計

#### BottomNavigationBar.tsx
```tsx
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  requiresAuth: boolean;
}

const BottomNavigationBar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // コンポーネントロジック
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-orange-100 py-3 z-40 block md:hidden">
      {/* ナビゲーション実装 */}
    </nav>
  );
};

export default BottomNavigationBar;
```

### ルーティング統合
- **既存ルート**: `/reading`, `/input`, `/draft-output`の維持
- **新規追加**: なし（既存ルート構造を活用）
- **リダイレクト**: 必要に応じて未認証ユーザーの適切な誘導

### 状態管理
- **認証状態**: `AuthContext`による認証状態の取得
- **現在パス**: `useLocation`フックによる現在パスの取得
- **ローカル状態**: React.useStateによるコンポーネント内状態管理

## テスト計画

### 品質保証要件
1. **機能テスト**: 全ナビゲーション機能の動作確認
2. **UI/UXテスト**: デザイン仕様に従った表示確認
3. **レスポンシブテスト**: 各デバイスサイズでの表示確認
4. **アクセシビリティテスト**: スクリーンリーダー等での動作確認
5. **パフォーマンステスト**: レンダリング性能の確認

## テスト観点

### 機能観点
- **ナビゲーション動作**: 各ボタンタップ時の正確なページ遷移
- **認証連携**: 未認証状態での適切な制御
- **アクティブ状態**: 現在ページの正確な表示
- **ルーティング**: React Routerとの正常な連携

### UI/UX観点
- **レスポンシブデザイン**: 各ブレークポイントでの適切な表示/非表示
- **視覚的フィードバック**: アクティブ状態、ホバー状態の視認性
- **カラーコントラスト**: アクセシビリティ基準への適合
- **レイアウト**: コンテンツとの重複防止

### パフォーマンス観点
- **レンダリング速度**: 初回描画時間の最適化
- **メモリ使用量**: 不要な再レンダリングの防止
- **バンドルサイズ**: 新規コンポーネント追加による影響確認
- **アニメーション性能**: 60FPSでのスムーズな動作

### 互換性観点
- **ブラウザ対応**: モダンブラウザでの動作確認
- **モバイル対応**: iOS Safari, Android Chromeでの確認
- **タッチデバイス**: 適切なタップ領域とジェスチャー対応
- **アクセシビリティ**: スクリーンリーダーでの読み上げ確認

## テストパターン

### 正常系パターン
1. **基本操作パターン**
   - 各ナビゲーションボタンのタップ
   - 正常なページ遷移の確認
   - アクティブ状態の表示確認

2. **認証状態パターン**
   - 認証済みユーザーでの全機能アクセス
   - 未認証ユーザーでの制限機能の非表示

3. **レスポンシブパターン**
   - モバイル表示（〜768px）
   - タブレット表示（768px〜1024px）
   - デスクトップ表示（1024px〜）

### 異常系パターン
1. **エラー処理パターン**
   - 存在しないルートへのアクセス
   - ネットワークエラー時の動作
   - JavaScript無効環境での動作

2. **認証エラーパターン**
   - 認証切れ時の動作
   - 権限不足時のリダイレクト
   - セッション切れ時の表示

3. **デバイス制限パターン**
   - 極小画面での表示
   - 高DPI画面での表示
   - 横向き時の表示崩れ

### 境界値パターン
1. **画面サイズ境界**
   - 767px, 768px, 769px（モバイル/タブレット境界）
   - 1023px, 1024px, 1025px（タブレット/デスクトップ境界）

2. **コンテンツ境界**
   - 長いページタイトルでの表示
   - 多数のナビゲーション項目での表示
   - コンテンツの最下部でのオーバーラップ確認

## テストケース

### TC001: 基本ナビゲーション動作
**前提条件**: 認証済みユーザーでモバイル表示
**テスト手順**:
1. アプリケーションを開く
2. 「マイページ」ボタンをタップ
3. MyPageが表示されることを確認
4. Bottom Navigation Barで「マイページ」がアクティブ状態になることを確認
5. 「読む」ボタンをタップ
6. ReadingPageが表示されることを確認
7. Bottom Navigation Barで「読む」がアクティブ状態になることを確認
8. 「メモ」ボタンをタップ
9. InputFormページが表示されることを確認
10. Bottom Navigation Barで「メモ」がアクティブ状態になることを確認
11. 「書く」ボタンをタップ
12. DraftOutputPageが表示されることを確認
13. Bottom Navigation Barで「書く」がアクティブ状態になることを確認

**期待結果**: 4つの全ボタンタップで正常にページ遷移し、アクティブ状態が正確に表示される

### TC002: 未認証ユーザー制御
**前提条件**: 未認証ユーザーでモバイル表示
**テスト手順**:
1. ログアウト状態でアプリケーションを開く
2. Bottom Navigation Barの表示を確認
3. 「読む」「メモ」「書く」ボタンの表示状態を確認
4. 「ホーム」ボタンの動作を確認

**期待結果**: 認証が必要な機能は適切に制御され、ホームボタンのみ利用可能

### TC003: レスポンシブ表示制御
**前提条件**: 認証済みユーザーで各デバイスサイズ
**テスト手順**:
1. モバイルサイズ（320px〜767px）でアクセス
2. Bottom Navigation Barが表示されることを確認
3. タブレットサイズ（768px〜1023px）でアクセス
4. Bottom Navigation Barの表示状態を確認
5. デスクトップサイズ（1024px以上）でアクセス
6. Bottom Navigation Barが非表示になることを確認

**期待結果**: 各ブレークポイントで適切な表示/非表示制御が行われる

### TC004: アクセシビリティ確認
**前提条件**: スクリーンリーダー有効環境
**テスト手順**:
1. スクリーンリーダーを有効化
2. Bottom Navigation Barにフォーカスを移動
3. 各ナビゲーションボタンの読み上げ内容を確認
4. Tabキーでの移動動作を確認
5. Enterキーでの選択動作を確認

**期待結果**: 適切なaria-labelと読み上げ順序で操作可能

### TC005: ハンバーガーメニュー削除確認
**前提条件**: 認証済みユーザーでモバイル表示
**テスト手順**:
1. ハンバーガーメニューを開く
2. メニュー内容を確認
3. 「読む」「メモ」「書く」「マイページ」リンクが存在しないことを確認
4. 以下の項目が新しい並び順で正常に表示されることを確認：
   - 📊 ダッシュボード（1番目）
   - 🌟 タイムライン（2番目）
   - ⚙️ 設定（3番目）
   - ❓ Q&A（4番目）
   - 📍 場所を探す（5番目、外部リンク、区切り線付き）
   - 🚪 ログアウト（6番目）

**期待結果**: 対象の4つのリンクが削除され、他の6つの機能は正常に動作

### TC006: パフォーマンス確認
**前提条件**: Chrome DevToolsでPerformanceタブを開く
**テスト手順**:
1. パフォーマンス計測を開始
2. アプリケーションを読み込み
3. Bottom Navigation Barでの画面遷移を5回実行
4. 計測を停止
5. First Contentful Paint、Largest Contentful Paintを確認
6. フレームレートを確認

**期待結果**: FCP < 1.5s、LCP < 2.5s、フレームレート > 55fps

### TC007: エラーハンドリング確認
**前提条件**: ネットワーク制限環境
**テスト手順**:
1. ネットワークを一時的に切断
2. Bottom Navigation Barのボタンをタップ
3. エラー表示または適切なフォールバック動作を確認
4. ネットワークを復旧
5. 正常動作に復帰することを確認

**期待結果**: エラー時は適切にハンドリングされ、復旧後は正常動作

### TC008: 境界値テスト（画面サイズ）
**前提条件**: ブラウザのレスポンシブモード
**テスト手順**:
1. 画面幅を767pxに設定
2. Bottom Navigation Barの表示を確認
3. 画面幅を768pxに変更
4. 表示状態の変化を確認
5. 画面幅を1023pxに設定
6. Bottom Navigation Barの表示を確認
7. 画面幅を1024pxに変更
8. 非表示への変化を確認

**期待結果**: 各ブレークポイントで正確に表示が切り替わる

### TC009: ハンバーガーメニュー並び順確認（Issue #168対応）
**前提条件**: 認証済みユーザーでデスクトップ表示
**テスト手順**:
1. ハンバーガーメニューを開く
2. 各項目の表示順序を上から順番に確認
3. 各項目のタップ/クリック動作を確認
4. 区切り線が「場所を探す」の前に表示されることを確認
5. 外部リンクが新しいタブで開くことを確認

**期待結果**: 
- ダッシュボード → タイムライン → 設定 → Q&A → 区切り線 → 場所を探す → ログアウトの順序
- 各項目が正常に動作し、視覚的な区切りが適切に表示される

---

## 実装上の注意事項

1. **既存機能への影響**: ハンバーガーメニューからのリンク削除時に、他の機能に影響しないよう注意
2. **z-index管理**: 既存のモーダルやドロップダウンとの重複表示を防ぐ
3. **パフォーマンス**: useLocationフックの適切な使用によりレンダリング最適化
4. **アクセシビリティ**: ARIA属性とセマンティックHTMLの適切な使用

## 成果物

1. **新規ファイル**:
   - `src/components/BottomNavigationBar.tsx`
   
2. **修正ファイル**:
   - `src/App.tsx`（ハンバーガーメニューの修正とBottom Navigation Bar追加）
   
3. **テストファイル**（必要に応じて）:
   - `src/components/__tests__/BottomNavigationBar.test.tsx`

---

*この設計書は実装の詳細指針として機能し、開発チーム間の認識統一を目的とします。実装過程で仕様変更が必要な場合は、この文書を更新し関係者に共有してください。*