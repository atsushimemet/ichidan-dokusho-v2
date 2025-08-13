import axios from 'axios';

interface GPTServiceRequest {
  title: string;
  learning: string;
  action?: string;
}

interface GPTServiceResponse {
  learningInsights: string;
  actionPlan?: string;
}

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

  /**
   * 学びとアクションから下書きを生成する
   */
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
   * 学び・気づき生成用のプロンプト作成（harmony response format対応）
   */
  private generateLearningPromptWithHarmony(title: string, learning: string): string {
    return `あなたは読書記録の整理を専門とするAIアシスタントです。以下の読書記録から、今日の学びを体系的に整理してください。

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
- 実践的で価値のある洞察の提供`;
  }

  /**
   * アクション生成用のプロンプト作成（harmony response format対応）
   */
  private generateActionPromptWithHarmony(title: string, learning: string, action: string): string {
    return `あなたは行動計画の最適化を専門とするAIアシスタントです。以下の情報から、実行可能な行動計画を設計してください。

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
- 継続可能性を考慮した実践的な提案`;
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

  /**
   * モックレスポンスを生成（開発・テスト用）
   */
  private generateMockResponse(request: GPTServiceRequest): GPTServiceResponse {
    const learningInsights = `【${request.title}からの学びと気づき】

${request.learning}から得られた核心的なポイントを整理すると、以下の3つの重要な洞察が浮かび上がります：

1. **実践的な価値**: この学びは日常生活や仕事において、具体的な改善をもたらす実用性の高い知識です。

2. **継続的な成長**: 一時的な理解ではなく、長期的な成長と発展に寄与する基盤となる洞察です。

3. **応用可能性**: この学びは複数の場面や状況に応用でき、柔軟な思考力を育む要素を含んでいます。

これらの気づきを通じて、あなたの認識や行動パターンに新たな視点が加わり、より効果的な判断や行動につながることが期待できます。`;

    let actionPlan: string | undefined = undefined;

    if (request.action?.trim()) {
      actionPlan = `【具体的な実行プラン】

現在設定されているアクション「${request.action}」を、より実行可能で測定可能なステップに分解します：

**今日から始める小さなステップ:**
• 明日の朝、まず5分間この学びについて振り返る時間を作る
• ${request.action}を実行するための具体的な準備を今日中に整える
• 実行した結果を記録するための簡単なメモ環境を用意する

**継続のための工夫:**
• 週末に今週の実行状況を振り返る時間を15分間設ける
• うまくいかなかった場合の代替案を事前に2つ準備しておく
• 成功した時の自分への小さなご褒美を設定する

**成功の指標:**
• 1週間継続できた場合は「習慣化の第一段階クリア」
• 2週間継続できた場合は「定着化成功」として次のレベルに進む

このプランにより、学びを実際の行動変化につなげ、持続可能な成長サイクルを構築できます。`;
    }

    return {
      learningInsights,
      actionPlan
    };
  }
}

// シングルトンインスタンス
export const gptService = new GPTService();

export { GPTService, GPTServiceRequest, GPTServiceResponse };