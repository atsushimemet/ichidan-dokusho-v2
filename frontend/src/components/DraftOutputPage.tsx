import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface WritingTheme {
  id: number;
  theme_name: string;
}

interface ThemeStats {
  theme_id: number | null;
  theme_name: string;
  total_records: number;
}

interface UserSettings {
  hideSpoilers: boolean;
  draftThreshold: number;
}

function DraftOutputPage() {
  const { user, token } = useAuth();
  const [themes, setThemes] = useState<WritingTheme[]>([]);
  const [themeStats, setThemeStats] = useState<ThemeStats[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    hideSpoilers: false,
    draftThreshold: 5
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [draftMode, setDraftMode] = useState<'fact' | 'essay'>('fact');
  const [draftText, setDraftText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'x' | 'note' | 'zenn'>('x');
  const [formattedText, setFormattedText] = useState('');
  const [showDraftFormatter, setShowDraftFormatter] = useState(false);

  useEffect(() => {
    if (user && token) {
      loadData();
    }
  }, [user, token]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadThemes(),
        loadThemeStats(),
        loadUserSettings()
      ]);
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThemes = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/writing-themes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setThemes(result.data || []);
      } else {
        console.error('テーマの読み込みに失敗しました');
        setThemes([]);
      }
    } catch (error) {
      console.error('テーマの読み込みに失敗しました:', error);
      setThemes([]);
    }
  };

  const loadThemeStats = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/theme-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setThemeStats(result.data || []);
      } else {
        console.error('テーマ統計の読み込みに失敗しました');
        setThemeStats([]);
      }
    } catch (error) {
      console.error('テーマ統計の読み込みに失敗しました:', error);
      setThemeStats([]);
    }
  };

  const loadUserSettings = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/user-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const settings = await response.json();
        setUserSettings(settings);
      } else {
        // デフォルト設定を使用
        setUserSettings({ hideSpoilers: false, draftThreshold: 5 });
      }
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
      setUserSettings({ hideSpoilers: false, draftThreshold: 5 });
    }
  };

  const getThemeRecordCount = (themeId: number | null): number => {
    const stat = themeStats.find(s => s.theme_id === themeId);
    return stat ? stat.total_records : 0;
  };

  const isThemeReady = (themeId: number | null): boolean => {
    const count = getThemeRecordCount(themeId);
    return count >= userSettings.draftThreshold;
  };

  const generatePrompt = async (): Promise<string> => {
    const selectedTheme = themes.find(t => t.id === selectedThemeId);
    const themeName = selectedTheme?.theme_name || 'テーマ';
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    
    // 読書記録を取得
    const recordsResponse = await fetch(`${API_BASE_URL}/api/theme-reading-records/${selectedThemeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    let recordsText = '';
    if (recordsResponse.ok) {
      const result = await recordsResponse.json();
      const records = result.data || [];
      recordsText = records.map((record: any) => 
        `【${record.title}】\n学び: ${record.learning}\nアクション: ${record.action}`
      ).join('\n\n');
    }
    
    // プロンプトテンプレートを取得
    try {
      const templateResponse = await fetch(`${API_BASE_URL}/api/prompt-templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (templateResponse.ok) {
        const templateResult = await templateResponse.json();
        const templates = templateResult.data || [];
        const template = templates.find((t: any) => t.mode === draftMode);
        
        if (template) {
          // プロンプトテンプレートのプレースホルダーを置換
          return template.template_text
            .replace(/{themeName}/g, themeName)
            .replace(/{recordsText}/g, recordsText);
        }
      }
    } catch (error) {
      console.warn('プロンプトテンプレートの取得に失敗しました、デフォルトを使用します:', error);
    }
    
    // フォールバック：デフォルトプロンプト
    if (draftMode === 'fact') {
      return `以下は「${themeName}」というテーマで蓄積した読書記録です。これらの記録から客観的なファクトを抽出し、整理してください。\n\n${recordsText}\n\n# 指示\n- 客観的事実のみを抽出\n- データや統計、専門家の見解を重視\n- 個人的な感想や主観は除外\n- 論理的で体系的な構成\n- 引用元を明確に`;
    } else {
      return `以下は「${themeName}」というテーマで蓄積した読書記録です。これらの記録から個人的な意見や洞察を抽出し、エッセイ形式で整理してください。\n\n${recordsText}\n\n# 指示\n- 個人的な体験や感想を重視\n- 主観的な洞察や気づきを表現\n- ストーリー性のある構成\n- 読者の共感を呼ぶ内容\n- 具体的なエピソードを交える`;
    }
  };

  // プラットフォーム別フォーマッター
  const formatTextForPlatform = (text: string, platform: 'x' | 'note' | 'zenn'): string => {
    if (!text.trim()) return '';

    switch (platform) {
      case 'x':
        // Xの場合: 140文字制限で分割、区切り文字を挿入
        const chunks = [];
        const sentences = text.split(/[。！？\n]/);
        let currentChunk = '';
        
        for (const sentence of sentences) {
          if (!sentence.trim()) continue;
          
          const proposedChunk = currentChunk + sentence + '。';
          if (proposedChunk.length <= 140) {
            currentChunk = proposedChunk;
          } else {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = sentence + '。';
          }
        }
        
        if (currentChunk) chunks.push(currentChunk.trim());
        return chunks.join('\n\n----------\n\n');

      case 'note':
      case 'zenn':
        // note/zennの場合: プレーンテキスト、見出しは#で表現
        return text
          .replace(/^【(.+)】/gm, '# $1')  // 【見出し】→ # 見出し
          .replace(/^\*\*(.+)\*\*/gm, '# $1')  // **見出し**→ # 見出し
          .replace(/^■(.+)/gm, '## $1')  // ■見出し→ ## 見出し
          .replace(/^▼(.+)/gm, '### $1')  // ▼見出し→ ### 見出し
          .replace(/^(\d+)\.\s/gm, '$1. ')  // 番号付きリストの整形
          .replace(/^・/gm, '- ')  // 箇条書きの整形
          .trim();

      default:
        return text;
    }
  };

  // プラットフォーム情報
  const platformInfo = {
    x: {
      name: 'X (Twitter)',
      description: '140文字制限で自動分割',
      url: 'https://x.com/compose/tweet',
      icon: '🐦'
    },
    note: {
      name: 'note',
      description: 'Markdown形式で整形',
      url: 'https://note.com/',
      icon: '📝'
    },
    zenn: {
      name: 'Zenn',
      description: 'Markdown形式で整形',
      url: 'https://zenn.dev/',
      icon: '⚡'
    }
  };

  // 草稿フォーマット処理
  const handleFormatDraft = () => {
    const formatted = formatTextForPlatform(draftText, selectedPlatform);
    setFormattedText(formatted);
  };

  // プラットフォームに遷移
  const handleNavigateToPlatform = async () => {
    if (!formattedText) {
      setMessage('まず草稿をフォーマットしてください');
      return;
    }

    try {
      // クリップボードにコピー
      const copySuccess = await copyToClipboard(formattedText);
      
      if (copySuccess) {
        // プラットフォームのURLを開く
        window.open(platformInfo[selectedPlatform].url, '_blank');
        setMessage(`${platformInfo[selectedPlatform].name}を開き、フォーマット済みテキストをクリップボードにコピーしました。`);
      } else {
        setMessage('クリップボードへのコピーに失敗しました。テキストを手動でコピーしてください。');
      }
    } catch (error) {
      console.error('Platform navigation error:', error);
      setMessage('エラーが発生しました。');
    }
  };

  // クリップボードにコピー（フォールバック付き）
  const copyToClipboard = async (text: string): Promise<boolean> => {
    // 現代的なClipboard APIを試行（セキュリティコンテキストの条件を緩和）
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.warn('Clipboard API failed, falling back to legacy method:', error);
      }
    }

    // フォールバック：レガシーメソッド
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // レガシーメソッドでは、document.execCommand('copy')がfalseを返すことがあるが、
      // 実際にはコピーが成功している場合がある。モバイル環境では特に信頼性が低い。
      if (successful) {
        return true;
      } else {
        // モバイル環境ではレガシーメソッドの戻り値が信頼できないため、
        // 成功したと仮定する（ユーザーがクリップボードを確認できる）
        if (/Mobi|Android/i.test(navigator.userAgent)) {
          return true;
        }
        return false;
      }
    } catch (error) {
      console.warn('Legacy clipboard method failed:', error);
    }

    return false;
  };

  const handleGenerateDraft = async () => {
    if (!selectedThemeId) {
      setMessage('テーマを選択してください');
      return;
    }

    if (!isThemeReady(selectedThemeId)) {
      const selectedTheme = themes.find(t => t.id === selectedThemeId);
      const count = getThemeRecordCount(selectedThemeId);
      setMessage(`「${selectedTheme?.theme_name}」の記録数が不足しています。（${count}/${userSettings.draftThreshold}件）`);
      return;
    }

    setGenerating(true);
    setMessage('');

    try {
      // プロンプトを生成
      const prompt = await generatePrompt();
      
      // クリップボードにコピー（フォールバック付き）
      const copySuccess = await copyToClipboard(prompt);
      
      if (copySuccess) {
        // ChatGPTに遷移
        window.open('https://chatgpt.com/', '_blank');
        setMessage('プロンプトをクリップボードにコピーし、ChatGPTを開きました。ChatGPTにプロンプトを貼り付けて実行してください。');
      } else {
        // クリップボードコピーに失敗した場合は、プロンプトを表示
        setMessage(`クリップボードへのコピーに失敗しました。以下のプロンプトを手動でコピーしてChatGPTで使用してください：\n\n${prompt}`);
        // ChatGPTも開く
        window.open('https://chatgpt.com/', '_blank');
      }
    } catch (error) {
      console.error('草稿生成エラー:', error);
      setMessage('草稿生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const availableThemes = themes.filter(theme => isThemeReady(theme.id));
  const unavailableThemes = themes.filter(theme => !isThemeReady(theme.id));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">草稿出力（書く）</h1>
              <p className="text-gray-600 text-sm">テーマ別に蓄積した読書記録から草稿を生成します</p>
            </div>
          </div>

          {/* 設定情報 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-blue-800">現在の設定</h3>
            </div>
            <p className="text-sm text-blue-700">
              草稿出力には各テーマごとに<strong>{userSettings.draftThreshold}件</strong>以上の記録が必要です
            </p>
            <p className="text-xs text-blue-600 mt-1">
              設定は<a href="/settings" className="underline hover:text-blue-800">設定ページ</a>で変更できます
            </p>
          </div>

          {/* テーマ選択 */}
          <div className="mb-6">
            <label htmlFor="themeSelect" className="block text-sm font-medium text-gray-700 mb-2">
              テーマを選択してください
            </label>

            {/* 利用可能なテーマ */}
            {availableThemes.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-green-700 mb-2">✅ 草稿生成可能</h4>
                <select
                  id="themeSelect"
                  value={selectedThemeId || ''}
                  onChange={(e) => setSelectedThemeId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">テーマを選択...</option>
                  {availableThemes.map((theme) => {
                    const count = getThemeRecordCount(theme.id);
                    return (
                      <option key={theme.id} value={theme.id}>
                        {theme.theme_name} ({count}件の記録)
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* 利用不可能なテーマ */}
            {unavailableThemes.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">⏳ 記録数不足</h4>
                <div className="space-y-2">
                  {unavailableThemes.map((theme) => {
                    const count = getThemeRecordCount(theme.id);
                    const remaining = userSettings.draftThreshold - count;
                    return (
                      <div key={theme.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">{theme.theme_name}</span>
                          <span className="text-sm text-gray-500">
                            {count}/{userSettings.draftThreshold}件 (あと{remaining}件)
                          </span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((count / userSettings.draftThreshold) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* テーマが設定されていない場合 */}
            {themes.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">テーマが設定されていません</h3>
                <p className="text-gray-600 mb-4">
                  草稿出力を利用するには、まずテーマを設定する必要があります
                </p>
                <a
                  href="/settings"
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  テーマを設定する
                </a>
              </div>
            )}
          </div>

          {/* モード選択 */}
          {availableThemes.length > 0 && selectedThemeId && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 草稿出力モード</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* ファクトモード */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    draftMode === 'fact'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setDraftMode('fact')}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="draftMode"
                      value="fact"
                      checked={draftMode === 'fact'}
                      onChange={() => setDraftMode('fact')}
                      className="mr-3"
                    />
                    <h4 className="font-semibold text-gray-900">📊 ファクトモード</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">客観重視</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• 客観的事実のみを抽出</li>
                    <li>• データや統計を重視</li>
                    <li>• 論理的で体系的な構成</li>
                  </ul>
                </div>

                {/* エッセイモード */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    draftMode === 'essay'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setDraftMode('essay')}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="draftMode"
                      value="essay"
                      checked={draftMode === 'essay'}
                      onChange={() => setDraftMode('essay')}
                      className="mr-3"
                    />
                    <h4 className="font-semibold text-gray-900">✍️ エッセイモード</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">主観重視</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• 個人的な体験や感想を重視</li>
                    <li>• 主観的な洞察を表現</li>
                    <li>• ストーリー性のある構成</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 草稿生成ボタン */}
          {availableThemes.length > 0 && (
            <div className="mb-6">
              <button
                onClick={handleGenerateDraft}
                disabled={!selectedThemeId || generating || !isThemeReady(selectedThemeId)}
                className={`w-full font-semibold py-4 px-6 rounded-lg focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                  draftMode === 'fact'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 focus:ring-blue-300'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 focus:ring-purple-300'
                }`}
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>草稿生成中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>{draftMode === 'fact' ? 'ファクト草稿を生成' : 'エッセイ草稿を生成'}</span>
                  </>
                )}
              </button>
              {selectedThemeId && !isThemeReady(selectedThemeId) && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  選択したテーマの記録数が不足しています
                </p>
              )}
            </div>
          )}

          {/* メッセージ表示 */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('失敗') || message.includes('不足')
                ? 'bg-red-100 text-red-700' 
                : message.includes('開発中')
                ? 'bg-yellow-100 text-yellow-700'
                : message.includes('クリップボードへのコピーに失敗')
                ? 'bg-orange-100 text-orange-700'
                : 'bg-green-100 text-green-700'
            }`}>
              <div className="whitespace-pre-wrap break-words">
                {message}
              </div>
              {message.includes('以下のプロンプトを手動でコピー') && (
                <div className="mt-2 text-xs text-orange-600">
                  💡 ヒント: 上記のテキストを長押し（またはダブルタップ）して選択し、コピーしてください
                </div>
              )}
            </div>
          )}

          {/* 草稿を整備する */}
          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-indigo-800 flex items-center">
                <span className="mr-2">✨</span>
                草稿を整備する
              </h3>
              <button
                onClick={() => setShowDraftFormatter(!showDraftFormatter)}
                className="text-indigo-600 hover:text-indigo-800 text-sm underline"
              >
                {showDraftFormatter ? '閉じる' : '開く'}
              </button>
            </div>
            
            <p className="text-sm text-indigo-700 mb-4">
              ChatGPTで生成した草稿をX、note、zennなどのプラットフォーム向けに自動整形・共有できます
            </p>

            {showDraftFormatter && (
              <div className="space-y-6">
                {/* 草稿入力 */}
                <div>
                  <label htmlFor="draftInput" className="block text-sm font-medium text-gray-700 mb-2">
                    草稿テキストを入力
                  </label>
                  <textarea
                    id="draftInput"
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder="ChatGPTで生成した草稿をここに貼り付けてください..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* プラットフォーム選択 */}
                <div>
                  <label htmlFor="platformSelect" className="block text-sm font-medium text-gray-700 mb-2">
                    投稿先プラットフォーム
                  </label>
                  <select
                    id="platformSelect"
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value as 'x' | 'note' | 'zenn')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {Object.entries(platformInfo).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.icon} {info.name} - {info.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* アクションボタン */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleFormatDraft}
                    disabled={!draftText.trim()}
                    className="flex-1 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    フォーマット実行
                  </button>
                  <button
                    onClick={handleNavigateToPlatform}
                    disabled={!formattedText}
                    className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 focus:ring-4 focus:ring-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {platformInfo[selectedPlatform].name}で投稿
                  </button>
                </div>

                {/* プレビュー */}
                {formattedText && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      📄 プレビュー ({platformInfo[selectedPlatform].name}形式)
                    </h4>
                    <div className="p-4 bg-white border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                      <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                        {formattedText}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => copyToClipboard(formattedText)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                      >
                        📋 クリップボードにコピー
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 説明 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">💡 草稿出力について</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• テーマごとに蓄積した読書記録を基に、関連する内容の草稿を自動生成します</li>
              <li>• 生成される草稿は、あなたの学びや気づき、アクションプランを整理したものです</li>
              <li>• 十分な記録数（{userSettings.draftThreshold}件以上）があるテーマでのみ利用可能です</li>
              <li>• 生成された草稿は、noteやX、その他媒体用の素材として活用できます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DraftOutputPage;