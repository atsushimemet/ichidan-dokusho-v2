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
      // TODO: 実際の草稿生成APIを実装
      // 現在はプレースホルダー
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage('草稿生成機能は開発中です。近日中に実装予定です。');
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

          {/* 草稿生成ボタン */}
          {availableThemes.length > 0 && (
            <div className="mb-6">
              <button
                onClick={handleGenerateDraft}
                disabled={!selectedThemeId || generating || !isThemeReady(selectedThemeId)}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-600 focus:ring-4 focus:ring-purple-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                    <span>草稿を生成</span>
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
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

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