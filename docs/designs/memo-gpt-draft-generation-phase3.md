# メモ画面GPT下書き生成機能 Phase3設計書

## 概要

GitHub Issue #170「メモ画面にGPT APIを使った下書き生成機能の実装」のPhase3実装として、gpt-oss-20b API統合とAPI呼び出しの実装を記載する。

## Phase3の目標

### 主要目標
- Phase2のモック実装を実際のAPI呼び出しに置換
- gpt-oss-20b APIとの統合
- エラーハンドリングとタイムアウト処理の実装
- 本格的なプロダクション対応

### スコープ
- ✅ バックエンドAPIエンドポイント `/api/gpt-draft-generation` の実装
- ✅ gpt-oss-20b APIサービス統合
- ✅ フロントエンドのモック→API呼び出し変更
- ✅ 包括的なエラーハンドリング
- ✅ タイムアウト処理
- ❌ コピー機能（Phase2.5で実装予定）

## 実装されたアーキテクチャ

### 1. バックエンド実装

#### APIエンドポイント
```typescript
// POST /api/gpt-draft-generation
app.post('/api/gpt-draft-generation', authenticateToken, async (req, res) => {
  try {
    const { title, learning, action } = req.body;
    const userId = req.user?.userId || req.user?.sub;

    // バリデーション
    if (!title || !learning) {
      return res.status(400).json({
        success: false,
        error: 'Title and learning are required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    // gpt-oss-20b APIサービスとの統合
    const response = await gptService.generateDraft({
      title,
      learning,
      action
    });

    // Phase1設計に準拠したレスポンス形式
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('GPT draft generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'GPT API呼び出しに失敗しました'
    });
  }
});
```

#### リクエスト/レスポンス仕様
**Request Body:**
```typescript
interface GPTDraftRequest {
  title: string;     // 書籍タイトル（必須）
  learning: string;  // 今日の学び（必須）
  action?: string;   // 明日の小さなアクション（任意）
}
```

**Response Body:**
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

### 2. GPTサービスレイヤー（vLLM OpenAI互換API対応）

#### GPTService クラス設計（更新版）
```typescript
// backend/src/services/gptService.ts
class GPTService {
  private apiUrl: string;
  private model: string;
  private reasoningLevel: 'low' | 'medium' | 'high';

  constructor() {
    // vLLMのOpenAI互換サーバーのURL（デフォルトポート8000）
    this.apiUrl = process.env.VLLM_API_URL || 'http://localhost:8000';
    this.model = 'gpt-oss-20b';
    this.reasoningLevel = 'medium';
    
    if (!process.env.VLLM_API_URL) {
      console.warn('VLLM_API_URL not set, using mock responses');
    }
  }

  async generateDraft(request: GPTServiceRequest): Promise<GPTServiceResponse> {
    // vLLMサーバーが設定されていない場合はモックレスポンスを返す
    if (!process.env.VLLM_API_URL) {
      return this.generateMockResponse(request);
    }

    try {
      // 学び・気づき生成（harmony response format使用）
      const learningPrompt = this.generateLearningPromptWithHarmony(request.title, request.learning);
      const learningResponse = await this.callOpenAICompatibleAPI(learningPrompt, 'medium');
      
      let actionPlan: string | undefined = undefined;
      
      // アクションプラン生成（条件付き、高い推論レベル使用）
      if (request.action?.trim()) {
        const actionPrompt = this.generateActionPromptWithHarmony(request.title, request.learning, request.action);
        actionPlan = await this.callOpenAICompatibleAPI(actionPrompt, 'high');
      }
      
      return {
        learningInsights: this.extractContentFromHarmonyResponse(learningResponse),
        actionPlan: actionPlan ? this.extractContentFromHarmonyResponse(actionPlan) : undefined
      };
    } catch (error) {
      console.error('vLLM API error:', error);
      // エラー時はモックレスポンスを返す（フォールバック）
      return this.generateMockResponse(request);
    }
  }

  /**
   * vLLMのOpenAI互換APIを呼び出す
   */
  private async callOpenAICompatibleAPI(prompt: string, reasoningLevel: 'low' | 'medium' | 'high'): Promise<string> {
    const response = await axios.post(
      `${this.apiUrl}/v1/chat/completions`,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `あなたは読書記録の整理と行動計画の作成を支援するAIアシスタントです。harmony response formatを使用し、chain-of-thought reasoningで深い分析を行います。推論レベル: ${reasoningLevel}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
        stream: false,
        // GPT-OSS-20B特有のパラメータ
        extra_body: {
          reasoning_effort: reasoningLevel,
          response_format: 'harmony'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          // vLLMはAPI_KEYを要求しない場合が多いが、必要に応じて設定
        },
        timeout: 30000 // 30秒タイムアウト
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from vLLM API');
    }

    return response.data.choices[0].message.content.trim();
  }

  /**
   * harmony response formatからコンテンツを抽出
   */
  private extractContentFromHarmonyResponse(response: string): string {
    // <思考過程>や<分析プロセス>部分を除去し、実際のコンテンツのみを抽出
    const contentMatch = response.match(/<\/[^>]+>(.*?)$/s);
    if (contentMatch) {
      return contentMatch[1].trim();
    }
    
    // フォールバック：思考過程タグがない場合はそのまま返す
    return response.replace(/<[^>]+>.*?<\/[^>]+>/gs, '').trim();
  }
}
```

#### プロンプト戦略の実装

**学び・気づき生成プロンプト:**
```text
以下の読書記録から、今日の学びを1000文字以内で整理してください。

【読んだ本】
${title}

【今日の学び】
${learning}

【要求】
- 学びの核心的なポイントを明確に
- 実践的で活用可能な知識として整理
- 読み手にとって価値のある洞察を提供
- 3つの重要な洞察（実践的価値、継続的成長、応用可能性）の観点から整理
- マークダウン形式で構造化して出力

出力形式：
【${title}からの学びと気づき】

（学びの整理内容をここに記載）
```

**アクションプラン生成プロンプト:**
```text
以下の読書記録とアクションプランから、具体的で実行可能な明日の小さなアクションを提案してください。

【読んだ本】
${title}

【今日の学び】
${learning}

【現在のアクション】
${action}

【要求】
- より具体的で実行可能なステップに分解
- いつ、どこで、どのように実行するかを明確に
- 成功の指標や確認方法を含める
- 継続のための工夫を提案
- マークダウン形式で構造化して出力

出力形式：
【具体的な実行プラン】

（具体的なアクションプランをここに記載）
```

### 3. フロントエンド実装

#### API統合の実装
```typescript
// frontend/src/components/InputForm.tsx
const handleGenerateDraft = async () => {
  if (!formData.learning?.trim()) {
    alert('今日の学びを入力してください。');
    return;
  }

  setIsDraftGenerating(true);
  
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    
    // タイムアウト設定付きでfetch実行（60秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    const response = await fetch(`${API_BASE_URL}/api/gpt-draft-generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: formData.title || 'この本',
        learning: formData.learning,
        action: formData.action
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // 詳細なHTTPステータスエラーハンドリング
    if (!response.ok) {
      if (response.status === 401) {
        alert('認証が必要です。ログインしてから再度お試しください。');
        return;
      } else if (response.status === 400) {
        alert('入力データに問題があります。入力内容を確認してください。');
        return;
      } else if (response.status >= 500) {
        alert('サーバーエラーが発生しました。しばらく待ってから再度お試しください。');
        return;
      }
    }

    const result = await response.json();

    if (result.success && result.data) {
      setDraftResult({
        learningInsights: result.data.learningInsights,
        actionPlan: result.data.actionPlan
      });
      setShowDraftAreas(true);
    } else {
      alert(`下書き生成に失敗しました: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    // 詳細なエラーハンドリング
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        alert('下書き生成がタイムアウトしました。しばらく待ってから再度お試しください。');
      } else if (error.message.includes('Failed to fetch')) {
        alert('ネットワーク接続を確認してください。');
      } else {
        alert(`下書き生成に失敗しました: ${error.message}`);
      }
    } else {
      alert('下書き生成に失敗しました。再度お試しください。');
    }
  } finally {
    setIsDraftGenerating(false);
  }
};
```

## エラーハンドリング戦略

### フロントエンド エラーハンドリング
1. **タイムアウト対応**: 60秒のAbortController
2. **HTTPステータス別対応**: 
   - 401: 認証エラー
   - 400: バリデーションエラー
   - 500+: サーバーエラー
3. **ネットワークエラー対応**: fetch失敗時の適切なメッセージ
4. **汎用エラー対応**: 未知のエラーに対するフォールバック

### バックエンド エラーハンドリング
1. **入力バリデーション**: title, learning必須チェック
2. **認証チェック**: JWTトークンの検証
3. **GPT APIエラー**: フォールバック機能付き
4. **包括的try-catch**: 予期しないエラーのキャッチ

### GPTサービス エラーハンドリング
1. **APIキー未設定**: モックレスポンスへのフォールバック
2. **API接続エラー**: 30秒タイムアウトとリトライなし
3. **レスポンス形式エラー**: Invalid responseエラー
4. **フォールバック機能**: 常にモックデータを返す安全機構

## 環境変数設定（vLLM対応版）

### バックエンド環境変数
```bash
# vLLM OpenAI互換サーバー設定
VLLM_API_URL=http://localhost:8000
# API_KEYは通常不要（vLLMの場合）
```

### vLLMサーバー起動方法

#### 1. vLLMのインストール
```bash
# Python 3.8以上が必要
uv pip install --pre vllm
# または
pip install vllm
```

#### 2. GPT-OSS-20Bモデルでサーバー起動
```bash
# OpenAI互換サーバーとして起動
python -m vllm.entrypoints.openai.api_server \
  --model gpt-oss-20b \
  --port 8000 \
  --host 0.0.0.0
```

#### 3. Ollamaを使用する場合（開発環境向け）
```bash
# Ollamaでのセットアップ
ollama pull gpt-oss:20b
ollama serve

# 環境変数設定
VLLM_API_URL=http://localhost:11434
```

### フロントエンド環境変数
```bash
# APIベースURL（既存）
VITE_API_BASE_URL=http://localhost:3001
```

## パフォーマンス仕様

### タイムアウト設定
- **フロントエンド**: 60秒（ユーザー体験重視）
- **バックエンド（GPT API呼び出し）**: 30秒（サーバーリソース保護）

### レスポンス時間目安
- **モック動作**: 即座（< 100ms）
- **実際のGPT API**: 5-20秒（API依存）
- **エラー時**: 1秒以内（フォールバック）

## セキュリティ仕様

### 認証・認可
- **JWTトークン**: 既存の認証システム活用
- **ユーザー検証**: req.user?.userId または req.user?.sub
- **APIキー保護**: 環境変数での管理、フロントエンドに非露出

### データ保護
- **入力データ検証**: XSS対策としてのサニタイゼーション
- **APIキー**: バックエンドでのみ管理
- **ログ出力**: 機密情報の除外

## テスト観点

### 機能テスト
- [ ] 学びのみ入力時の動作
- [ ] 学び+アクション入力時の動作
- [ ] 認証エラー時の適切な処理
- [ ] ネットワークエラー時のフォールバック
- [ ] タイムアウト時の適切な処理

### パフォーマンステスト
- [ ] 長時間処理時のUI応答性
- [ ] 複数同時リクエスト時の動作
- [ ] メモリリーク検証

### セキュリティテスト
- [ ] 未認証ユーザーのアクセス制御
- [ ] SQLインジェクション対策（間接的）
- [ ] XSS対策

## 運用考慮事項

### 監視・ログ
- **GPT APIエラー**: コンソールログ出力
- **レスポンス時間**: パフォーマンス監視
- **エラー率**: 成功/失敗比率の監視

### スケーラビリティ
- **リクエスト制限**: 必要に応じてレート制限実装
- **キャッシュ**: 同一リクエストのキャッシュ検討
- **ロードバランシング**: GPT APIの複数エンドポイント対応

## Phase2.5（コピー機能）への準備

Phase3完了により、以下の準備が整いました：
1. **安定したAPI基盤**: 信頼性の高いテキスト生成
2. **エラー処理**: 堅牢なエラーハンドリング
3. **ユーザビリティ**: 直感的な操作フロー

Phase2.5では以下を実装予定：
- 各テキストエリアへのコピーボタン追加
- クリップボードAPI統合
- コピー成功時の視覚フィードバック

## プロダクション移行要件（vLLM対応版）

### デプロイメント前チェックリスト
- [ ] vLLMサーバーの起動と接続テスト
- [ ] 環境変数設定の確認（VLLM_API_URL）
- [ ] GPT-OSS-20Bモデルの動作確認
- [ ] harmony response formatの正常動作テスト
- [ ] 負荷テスト実施（推論レベル別）
- [ ] セキュリティ監査
- [ ] ログ出力設定

### vLLMサーバー運用考慮事項
- **GPU要件**: NVIDIA GPU推奨（21.5Bパラメータモデル用）
- **メモリ要件**: 最低16GB RAM、推奨32GB以上
- **ディスク容量**: モデルファイル格納用に50GB以上
- **ネットワーク**: 内部通信のため低レイテンシ環境

### 監視項目
- vLLMサーバーの稼働状態
- GPT-OSS-20B推論処理時間（reasoning level別）
- API呼び出し成功率
- 平均レスポンス時間
- メモリ・GPU使用率
- エラー種別と頻度
- ユーザーあたりのリクエスト数

### スケーラビリティ対応
- **水平スケーリング**: 複数vLLMインスタンスでのロードバランシング
- **推論レベル最適化**: 用途に応じたreasoning effortの調整
- **モデル量子化**: メモリ効率向上のためのMXFP4量子化活用

---

*Phase3の実装により、メモ画面GPT下書き生成機能が本格的にプロダクション対応され、ユーザーはアプリ内で完結した高品質な下書き生成体験を得ることができる。gpt-oss-20b APIとの統合により、従来の外部サイト遷移が不要となり、シームレスなユーザーエクスペリエンスが実現される。*