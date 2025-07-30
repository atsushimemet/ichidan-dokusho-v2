import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserSettings {
  hideSpoilers: boolean;
}

interface WritingTheme {
  id: number;
  user_id: string;
  theme_name: string;
  created_at: string;
  updated_at: string;
}

function SettingsPage() {
  const { user, token } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    hideSpoilers: false
  });
  const [themes, setThemes] = useState<WritingTheme[]>([]);
  const [newTheme, setNewTheme] = useState('');
  const [editingTheme, setEditingTheme] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeLoading, setThemeLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadSettings();
      loadThemes();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/user-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userSettings = await response.json();
        setSettings(userSettings);
      } else {
        // デフォルト設定を使用
        setSettings({ hideSpoilers: false });
      }
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
      setSettings({ hideSpoilers: false });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/user-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage('設定を保存しました');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('設定の保存に失敗しました');
      }
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      setMessage('設定の保存に失敗しました');
    } finally {
      setSaving(false);
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

  const handleSettingChange = (key: keyof UserSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addTheme = async () => {
    if (!newTheme.trim()) {
      setMessage('テーマ名を入力してください');
      return;
    }

    if (newTheme.length > 100) {
      setMessage('テーマ名は100文字以内で入力してください');
      return;
    }

    if (themes.length >= 10) {
      setMessage('テーマは最大10個まで設定できます。新しいテーマを追加するには、既存のテーマを削除してください。');
      return;
    }

    setThemeLoading(true);
    setMessage('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/writing-themes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ theme_name: newTheme.trim() }),
      });

      if (response.ok) {
        setNewTheme('');
        await loadThemes();
        setMessage('テーマを追加しました');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'テーマの追加に失敗しました');
      }
    } catch (error) {
      console.error('テーマの追加に失敗しました:', error);
      setMessage('テーマの追加に失敗しました');
    } finally {
      setThemeLoading(false);
    }
  };

  const startEditTheme = (theme: WritingTheme) => {
    setEditingTheme({ id: theme.id, name: theme.theme_name });
  };

  const cancelEditTheme = () => {
    setEditingTheme(null);
  };

  const saveEditTheme = async () => {
    if (!editingTheme) return;

    if (!editingTheme.name.trim()) {
      setMessage('テーマ名を入力してください');
      return;
    }

    if (editingTheme.name.length > 100) {
      setMessage('テーマ名は100文字以内で入力してください');
      return;
    }

    setThemeLoading(true);
    setMessage('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/writing-themes/${editingTheme.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ theme_name: editingTheme.name.trim() }),
      });

      if (response.ok) {
        setEditingTheme(null);
        await loadThemes();
        setMessage('テーマを更新しました');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'テーマの更新に失敗しました');
      }
    } catch (error) {
      console.error('テーマの更新に失敗しました:', error);
      setMessage('テーマの更新に失敗しました');
    } finally {
      setThemeLoading(false);
    }
  };

  const deleteTheme = async (themeId: number, themeName: string) => {
    if (!window.confirm(`「${themeName}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    setThemeLoading(true);
    setMessage('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/writing-themes/${themeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadThemes();
        setMessage('テーマを削除しました');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'テーマの削除に失敗しました');
      }
    } catch (error) {
      console.error('テーマの削除に失敗しました:', error);
      setMessage('テーマの削除に失敗しました');
    } finally {
      setThemeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">設定</h1>
          
          {/* ネタバレ設定 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">タイムライン設定</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">ネタバレを非表示</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    タイムラインでネタバレを含む投稿を非表示にします
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.hideSpoilers}
                    onChange={(e) => handleSettingChange('hideSpoilers', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 書きたいテーマ設定 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">書きたいテーマ設定</h2>
              <div className="text-sm text-gray-500">
                {themes.length}/10 テーマ
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              あなたが書きたいテーマを設定・管理できます。将来的にテーマ別の草稿生成機能で活用されます。
            </p>
            <p className="text-xs text-orange-600 mb-4">
              器用貧乏から抜け出すため、テーマは最大10個まで設定可能です。
            </p>
            
            {/* テーマ追加フォーム */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  placeholder="新しいテーマを入力... (例: キャリア、サウナ、プログラミング)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  maxLength={100}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTheme();
                    }
                  }}
                />
                <button
                  onClick={addTheme}
                  disabled={themeLoading || !newTheme.trim() || themes.length >= 10}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {themeLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>追加中...</span>
                    </>
                  ) : (
                    <span>追加</span>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                100文字以内で入力してください
                {themes.length >= 10 && (
                  <span className="text-orange-600 block mt-1">
                    ※ テーマの上限（10個）に達しています。新しいテーマを追加するには既存のテーマを削除してください。
                  </span>
                )}
              </p>
            </div>

            {/* テーマ一覧 */}
            <div className="space-y-3">
              {themes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>まだテーマが設定されていません</p>
                  <p className="text-sm">上記のフォームから新しいテーマを追加してみましょう</p>
                </div>
              ) : (
                themes.map((theme) => (
                  <div
                    key={theme.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    {editingTheme?.id === theme.id ? (
                      // 編集モード
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingTheme.name}
                          onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          maxLength={100}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              saveEditTheme();
                            } else if (e.key === 'Escape') {
                              cancelEditTheme();
                            }
                          }}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={saveEditTheme}
                            disabled={themeLoading}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            保存
                          </button>
                          <button
                            onClick={cancelEditTheme}
                            disabled={themeLoading}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      // 表示モード
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{theme.theme_name}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            作成日: {new Date(theme.created_at).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditTheme(theme)}
                            disabled={themeLoading}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors disabled:opacity-50"
                            title="編集"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteTheme(theme.id, theme.theme_name)}
                            disabled={themeLoading}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors disabled:opacity-50"
                            title="削除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>保存中...</span>
                </>
              ) : (
                <span>保存</span>
              )}
            </button>
          </div>

          {/* メッセージ表示 */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.includes('失敗') 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage; 
