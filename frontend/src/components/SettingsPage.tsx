import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserSettings {
  hideSpoilers: boolean;
}

function SettingsPage() {
  const { user, token } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    hideSpoilers: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadSettings();
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

  const handleSettingChange = (key: keyof UserSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
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
