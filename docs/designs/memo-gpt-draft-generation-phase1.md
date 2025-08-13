# メモ画面GPT下書き生成機能 Phase1設計書

## 概要

GitHub Issue #170「メモ画面にGPT APIを使った下書き生成機能の実装」のPhase1実装として、既存実装の分析結果とgpt-oss-20b API統合のアーキテクチャ設計を記載する。

## プロジェクト背景

### 現在の問題
- ユーザーがChatGPTを利用する際にアプリケーションを離れる必要がある
- 外部サービスへの遷移によりユーザーエクスペリエンスが中断される
- 学びとアクションの整理プロセスがアプリ外で行われるため、継続性が損なわれる

### 目標
- アプリ内で下書き生成を完結させ、UX中断を防ぐ
- gpt-oss-20b APIを活用した「今日の学び・気づき」と「明日の小さなアクション」の自動生成
- 生成されたテキストの簡単なコピー機能による外部活用

## 既存実装分析

### InputForm.tsxの現在の実装（Lines 883-934）

#### 現在のフローの分析
```tsx
// 現在のChatGPTボタン実装
<button
  type="button"
  onClick={() => {
    if (formData.action?.trim()) {
      // プロンプト生成
      const prompt = `以下の読書から得た学びとアクションについて、...`;
      
      // クリップボードにコピー → ChatGPT.comを新規タブで開く
      navigator.clipboard.writeText(prompt).then(() => {
        window.open('https://chat.openai.com/', '_blank');
      })
    } else {
      alert('明日の小さなアクションを入力してからお試しください。');
    }
  }}
  disabled={!formData.action?.trim()}
>
```

#### 分析結果
1. **条件**: `formData.action`が入力されている場合のみ有効
2. **プロンプト構造**: 書籍名、学び、アクションを含む構造化されたプロンプト
3. **実行フロー**: クリップボードコピー → 外部サイト（ChatGPT）オープン
4. **エラーハンドリング**: クリップボードAPIのフォールバック実装あり

### FormDataインターフェース分析
```tsx
interface FormData {
  title: string;          // 書籍タイトル
  readingAmount: string;  // 読書量
  learning: string;       // 今日の学び
  action?: string;        // 明日の小さなアクション（任意）
  notes: string;          // その他メモ
  isNotBook: boolean;     // 本以外フラグ
  customLink: string;     // カスタムリンク
  themeId: number | null; // テーマID
}
```

## GPT-OSS-20B統合アーキテクチャ設計

### GPT-OSS-20Bの実際の仕様
- **モデルサイズ**: 21.5Bパラメータ
- **ライセンス**: Apache 2.0
- **推論レベル**: Low, Medium, High（設定可能な reasoning effort）
- **特徴**: Full chain-of-thought reasoning、agentic capabilities
- **レスポンス形式**: harmony response format使用

### 推論方法の選択肢
1. **vLLM（推奨）**: OpenAI互換webserver
   - インストール: `uv pip install --pre vllm`
   - OpenAI互換APIを提供、既存SDKパターン活用可能

2. **Ollama**: ローカル実行
   - セットアップ: `ollama pull gpt-oss:20b`
   - ローカル開発・テスト環境向け

3. **Transformers**: 直接Python統合
   - インストール: `pip install -U transformers kernels torch`
   - カスタム統合が必要

### APIエンドポイント設計
```
POST /api/gpt-draft-generation
```

#### リクエスト仕様
```typescript
interface GPTDraftRequest {
  title: string;
  learning: string;
  action?: string; // 任意フィールド
  userId: string;  // 認証トークンから取得
}
```

#### レスポンス仕様
```typescript
interface GPTDraftResponse {
  success: boolean;
  data?: {
    learningInsights: string;    // 今日の学び・気づき by GPT
    actionPlan?: string;         // 明日の小さなアクション by GPT（actionがある場合のみ）
  };
  error?: string;
}
```

### フロントエンド統合設計

#### 新しい状態管理
```typescript
// InputForm.tsx に追加予定のstate
const [isDraftGenerating, setIsDraftGenerating] = useState(false);
const [draftResult, setDraftResult] = useState<{
  learningInsights: string;
  actionPlan?: string;
} | null>(null);
const [showDraftAreas, setShowDraftAreas] = useState(false);
```

#### UI表示ロジック
```typescript
// 条件付き表示の実装方針
const shouldShowActionArea = formData.action?.trim() && draftResult?.actionPlan;
```

### バックエンド実装設計

#### APIエンドポイント実装
```typescript
// backend/src/index.ts に追加予定
app.post('/api/gpt-draft-generation', authenticateToken, async (req, res) => {
  try {
    const { title, learning, action } = req.body;
    const userId = req.user.id;
    
    // gpt-oss-20b API呼び出し
    const gptResponse = await callGPTAPI({
      title,
      learning,
      action
    });
    
    res.json({
      success: true,
      data: gptResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GPT API呼び出しに失敗しました'
    });
  }
});
```

#### GPT-OSS-20B統合サービス設計
```typescript
// 新規作成予定: backend/src/services/gptService.ts
interface GPTServiceRequest {
  title: string;
  learning: string;
  action?: string;
}

class GPTService {
  private apiUrl: string;      // vLLM OpenAI互換サーバーのURL
  private model: string;       // 'gpt-oss-20b'
  private reasoningLevel: 'low' | 'medium' | 'high';

  constructor() {
    this.apiUrl = process.env.VLLM_API_URL || 'http://localhost:8000';
    this.model = 'gpt-oss-20b';
    this.reasoningLevel = 'medium'; // デフォルト推論レベル
  }

  async generateDraft(request: GPTServiceRequest): Promise<GPTDraftResponse['data']> {
    // vLLMのOpenAI互換APIを使用
    // harmony response formatでのプロンプト設計
    // chain-of-thought reasoningの活用
  }
}
```

## プロンプト戦略（GPT-OSS-20B対応）

### Harmony Response Formatの活用
GPT-OSS-20Bの特徴であるharmony response formatを活用し、structured outputと chain-of-thought reasoning を組み合わせる。

### 学び・気づき生成プロンプト（更新版）
```
あなたは読書記録の整理を専門とするAIアシスタントです。以下の読書記録から、今日の学びを体系的に整理してください。

<reasoning_level>medium</reasoning_level>

【読んだ本】
${title}

【今日の学び】
${learning}

【タスク】
以下の観点から学びを分析し、1000文字以内で構造化して整理してください：
1. 実践的な価値の分析
2. 長期的な成長への寄与
3. 他領域への応用可能性

【出力形式】
以下のマークダウン形式で出力してください：

【${title}からの学びと気づき】

<思考過程>
（あなたの分析プロセスをここに記載）
</思考過程>

（整理された学びの内容）

【要求】
- chain-of-thought reasoning を活用した深い分析
- harmony response format に準拠した構造化出力
- 実践的で価値のある洞察の提供
```

### アクション生成プロンプト（更新版）
```
あなたは行動計画の最適化を専門とするAIアシスタントです。以下の情報から、実行可能な行動計画を設計してください。

<reasoning_level>high</reasoning_level>

【読んだ本】
${title}

【今日の学び】
${learning}

【現在のアクション】
${action}

【タスク】
現在のアクションを分析し、より具体的で実行可能なステップに最適化してください。

【出力形式】
以下のマークダウン形式で出力してください：

【具体的な実行プラン】

<分析プロセス>
（現在のアクションの分析と改善点の特定）
</分析プロセス>

（最適化されたアクションプラン）

【要求】
- chain-of-thought reasoning による段階的な分析
- SMART原則（Specific, Measurable, Achievable, Relevant, Time-bound）の適用
- 継続可能性を考慮した実践的な提案
```

## エラーハンドリング設計

### フロントエンドエラー対応
1. **APIコール失敗**: ユーザーフレンドリーなエラーメッセージ表示
2. **ネットワークエラー**: リトライ機能の提供
3. **レスポンス解析失敗**: デフォルトメッセージでの代替表示

### バックエンドエラー対応
1. **gpt-oss-20b APIエラー**: 適切なHTTPステータスコード返却
2. **リクエストバリデーション**: 入力データの検証
3. **認証エラー**: 認証状態の確認とエラー返却

## セキュリティ考慮事項

### 認証・認可
- 既存のJWT認証システムを活用
- ユーザーごとのリクエスト制限の実装検討

### データ保護
- ユーザーの読書記録データの適切な取り扱い
- gpt-oss-20b APIへのデータ送信時の暗号化

## パフォーマンス考慮事項

### フロントエンド
- API呼び出し中のローディング状態表示
- 不要なリレンダリングの防止

### バックエンド
- gpt-oss-20b APIレスポンス時間の監視
- タイムアウト設定とエラー処理

## 次のPhase準備

### Phase2で実装予定の項目
1. モックUI実装（API呼び出しなし）
2. テキストエリアの条件付き表示
3. 基本的なレイアウトとスタイリング

### Phase2.5で実装予定の項目
1. コピー機能実装
2. クリップボードAPI統合
3. フォールバック対応

---

*この設計書は実装の基礎となるアーキテクチャを定義しており、次のPhaseでの具体的な実装に向けた指針を提供する。*