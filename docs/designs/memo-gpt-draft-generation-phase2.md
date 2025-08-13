# メモ画面GPT下書き生成機能 Phase2設計書

## 概要

GitHub Issue #170「メモ画面にGPT APIを使った下書き生成機能の実装」のPhase2実装として、モックUI実装の詳細仕様とUI/UX設計を記載する。

## Phase2の目標

### 主要目標
- API呼び出しなしでのUI動作確認
- 条件付きテキストエリア表示ロジックの実装
- ユーザーインタラクションフローの検証

### スコープ
- ✅ モックデータを使用した下書き生成UI
- ✅ 条件付きテキストエリア表示（`formData.action`依存）
- ✅ ローディング状態表示
- ❌ 実際のAPI呼び出し（Phase3で実装）
- ❌ コピー機能（Phase2.5で実装）

## 実装された機能

### 1. 状態管理の拡張

#### 追加されたState
```typescript
// GPT下書き生成用のstate
const [isDraftGenerating, setIsDraftGenerating] = useState(false);
const [draftResult, setDraftResult] = useState<{
  learningInsights: string;
  actionPlan?: string;
} | null>(null);
const [showDraftAreas, setShowDraftAreas] = useState(false);
```

#### 状態の役割
- `isDraftGenerating`: API呼び出し中のローディング状態管理
- `draftResult`: 生成された下書きデータの保存
- `showDraftAreas`: テキストエリアの表示/非表示制御

### 2. UIの変更

#### ボタンの仕様変更
**変更前:**
```typescript
// 旧: ChatGPT.comへの遷移 + クリップボードコピー
disabled={!formData.action?.trim()}
onClick={() => {
  // プロンプト生成 → クリップボードコピー → 外部サイト開く
}}
```

**変更後:**
```typescript
// 新: アプリ内での下書き生成
disabled={!formData.learning?.trim() || isDraftGenerating}
onClick={handleGenerateDraft}
```

#### 有効化条件の変更
- **旧**: `formData.action`（明日の小さなアクション）が必須
- **新**: `formData.learning`（今日の学び）が必須
- **理由**: 学びから下書きを生成し、アクションは任意要素として扱う

#### ボタンテキストとアイコン
```typescript
{isDraftGenerating ? (
  <>
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
    <span>下書きを生成中...</span>
  </>
) : (
  <>
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
    <span>下書きを生成する</span>
  </>
)}
```

### 3. モックデータ生成ロジック

#### handleGenerateDraft関数の実装
```typescript
const handleGenerateDraft = async () => {
  if (!formData.learning?.trim()) {
    alert('今日の学びを入力してください。');
    return;
  }

  setIsDraftGenerating(true);
  
  // モックデータでの応答をシミュレート（2秒後に表示）
  setTimeout(() => {
    // 学び・気づきの生成（必須）
    const mockLearningInsights = `【${formData.title || 'この本'}からの学びと気づき】...`;
    
    // アクションプランの生成（actionがある場合のみ）
    let mockActionPlan: string | undefined = undefined;
    if (formData.action?.trim()) {
      mockActionPlan = `【具体的な実行プラン】...`;
    }

    setDraftResult({
      learningInsights: mockLearningInsights,
      actionPlan: mockActionPlan
    });
    setShowDraftAreas(true);
    setIsDraftGenerating(false);
  }, 2000);
};
```

#### モックデータの構造
1. **学び・気づき部分（常に生成）**:
   - 入力された学びを基にした3つの洞察
   - 実践的価値、継続的成長、応用可能性の観点
   - 約500-800文字の構造化されたテキスト

2. **アクションプラン部分（条件付き生成）**:
   - `formData.action`が入力されている場合のみ生成
   - 具体的な実行ステップの分解
   - 継続のための工夫と成功指標
   - 約400-600文字の実行可能なプラン

### 4. 条件付きUI表示

#### テキストエリアの表示ロジック
```typescript
{showDraftAreas && draftResult && (
  <div className="space-y-4">
    {/* 今日の学び・気づき by GPT（常に表示） */}
    <div>
      <textarea
        value={draftResult.learningInsights}
        readOnly
        rows={12}
        className="w-full px-4 py-3 border border-green-300 bg-green-50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
      />
    </div>

    {/* 明日の小さなアクション by GPT（条件付き表示） */}
    {draftResult.actionPlan && (
      <div>
        <textarea
          value={draftResult.actionPlan}
          readOnly
          rows={10}
          className="w-full px-4 py-3 border border-blue-300 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
        />
      </div>
    )}
  </div>
)}
```

#### 条件付き表示の仕様
1. **表示トリガー**: `showDraftAreas && draftResult`の両方が真の場合
2. **学び・気づきエリア**: 常に表示（緑色のスタイル）
3. **アクションプランエリア**: `draftResult.actionPlan`が存在する場合のみ表示（青色のスタイル）

## UI/UX設計

### デザイン原則
1. **一貫性**: 既存のInputFormのデザインシステムを継承
2. **直感性**: 色分けによる情報の種類の識別（緑=学び、青=アクション）
3. **レスポンシブ**: Tailwind CSSによる適切なスペーシング

### カラーパレット
- **学び・気づきエリア**: `border-green-300 bg-green-50`
- **アクションプランエリア**: `border-blue-300 bg-blue-50`
- **生成ボタン**: `bg-gradient-to-r from-purple-500 to-indigo-500`（既存の紫グラデーション）

### インタラクション設計
1. **ボタンクリック**: 学びが入力されていれば有効化
2. **ローディング**: 2秒間のアニメーション表示
3. **結果表示**: アニメーションなしでスムーズに表示
4. **読み取り専用**: 生成されたテキストは`readOnly`属性で編集不可

## ユーザーフローの検証

### 正常フロー
1. ユーザーが「今日の学び」を入力
2. （任意）「明日の小さなアクション」を入力
3. 「下書きを生成する」ボタンをクリック
4. 2秒間のローディング表示
5. 学び・気づきエリアが表示される
6. （actionが入力されていた場合）アクションプランエリアも表示される

### エラーフロー
1. 学びが未入力でボタンクリック
2. アラート表示: 「今日の学びを入力してください。」
3. ボタンが無効化される

### エッジケース
1. **学びのみ入力**: 学び・気づきエリアのみ表示
2. **学び + アクション入力**: 両方のエリア表示
3. **非常に短い入力**: モックデータは入力内容に関係なく固定長
4. **非常に長い入力**: textareaの`rows`属性で適切な高さを確保

## テスト観点

### 機能テスト
- [ ] 学びが入力されていない場合のボタン無効化
- [ ] 学びが入力された場合のボタン有効化
- [ ] ローディング状態の表示
- [ ] モックデータの正常表示
- [ ] actionの有無による条件付き表示

### UI/UXテスト
- [ ] ボタンのホバー状態
- [ ] ローディングアニメーション
- [ ] テキストエリアの読み取り専用状態
- [ ] レスポンシブ表示（モバイル/デスクトップ）
- [ ] 色分けによる視覚的区別

### ブラウザ互換性テスト
- [ ] Chrome（最新版）
- [ ] Safari（最新版）
- [ ] Firefox（最新版）
- [ ] モバイルブラウザ（iOS Safari, Android Chrome）

## パフォーマンス考慮事項

### 最適化されている点
1. **モックデータの事前定義**: 動的生成コストなし
2. **条件付きレンダリング**: 不要な要素は描画されない
3. **適切な状態管理**: 不要な再レンダリングを防止

### 今後の改善点
1. **メモリ使用量**: 長いモックテキストの最適化
2. **アニメーション**: ローディング状態の最適化
3. **リサイズ**: textareaの動的高さ調整

## Phase3への準備

### Phase3で実装予定の変更点
1. **API統合**: `setTimeout`を実際のAPI呼び出しに置換
2. **エラーハンドリング**: ネットワークエラーやAPI エラーの処理
3. **動的コンテンツ**: モックデータから実際のGPT応答に変更
4. **プロンプト最適化**: Phase1で設計したプロンプト戦略の適用

### Phase2.5（コピー機能）への準備
1. **コピーボタンの配置場所**: 各textareaの右上角
2. **コピー成功時の視覚フィードバック**: 一時的なチェックマーク表示
3. **フォールバック対応**: 古いブラウザ向けの代替コピー手段

## 品質保証

### コードレビュー観点
- [ ] TypeScriptの型安全性
- [ ] React Hooksの適切な使用
- [ ] 既存コードとの一貫性
- [ ] エラーハンドリングの妥当性

### セキュリティ考慮事項
- [ ] XSS対策（現在は静的モックデータのため影響なし）
- [ ] 入力データの適切な検証
- [ ] 状態管理のセキュリティ

---

*Phase2の実装により、ユーザーエクスペリエンスの基盤が構築され、Phase3でのAPI統合に向けた準備が完了した。モックUIによる動作確認を通じて、実際の機能実装における設計上の問題点を事前に特定できる。*