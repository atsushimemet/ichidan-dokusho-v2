import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileConsole from './MobileConsole';
import AdminFooter from './AdminFooter';

interface Tag {
  id: string;
  name: string;
}

// ランダムカラーパレット（視認性を考慮した色の組み合わせ）
const colorPalettes = [
  { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
];

// タグにランダムカラーを割り当てる関数
const getRandomColor = (tagName: string) => {
  // タグ名をハッシュ化して一貫した色を割り当て
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    const char = tagName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  const index = Math.abs(hash) % colorPalettes.length;
  return colorPalettes[index];
};

const BookRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [bookForm, setBookForm] = useState({
    title: '',
    amazon_link: '',
    tags: [] as Tag[],
    summary_link1: '',
    summary_link2: '',
    summary_link3: ''
  });
  const [currentTag, setCurrentTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMobileConsoleVisible, setIsMobileConsoleVisible] = useState(false);

  // コンポーネントマウント時に認証状態をチェック
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuthenticated');
    const savedUsername = localStorage.getItem('adminUsername');
    const savedPassword = localStorage.getItem('adminPassword');
    
    if (authStatus === 'true' && savedUsername && savedPassword) {
      setIsAuthenticated(true);
      setLoginForm({
        username: savedUsername,
        password: savedPassword
      });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 認証チェック（フロントエンドでのチェック）
      if (loginForm.username === 'noap3b69n' && loginForm.password === '19930322') {
        setIsAuthenticated(true);
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminUsername', loginForm.username);
        localStorage.setItem('adminPassword', loginForm.password);
        setSuccess('認証に成功しました');
      } else {
        setError('ユーザー名またはパスワードが間違っています');
      }
    } catch (err) {
      setError('認証に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !bookForm.tags.some(tag => tag.name === currentTag.trim())) {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: currentTag.trim()
      };
      setBookForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagId: string) => {
    setBookForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag.id !== tagId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      
      console.log('書籍登録を開始しています...', {
        title: bookForm.title,
        amazon_link: bookForm.amazon_link,
        tags: bookForm.tags.map(tag => tag.name),
        api_url: `${API_BASE_URL}/api/admin/books`
      });
      
      const response = await fetch(`${API_BASE_URL}/api/admin/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: bookForm.title,
          amazon_link: bookForm.amazon_link,
          tags: bookForm.tags.map(tag => tag.name),
          summary_link1: bookForm.summary_link1 || null,
          summary_link2: bookForm.summary_link2 || null,
          summary_link3: bookForm.summary_link3 || null,
          username: loginForm.username,
          password: loginForm.password
        }),
      });

      console.log('APIレスポンス受信:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('書籍登録エラー:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`書籍登録に失敗しました (${response.status}: ${response.statusText})`);
      }

      const result = await response.json();
      console.log('書籍登録成功:', result);
      setSuccess('書籍が正常に登録されました');
      setBookForm({ title: '', amazon_link: '', tags: [], summary_link1: '', summary_link2: '', summary_link3: '' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '書籍登録に失敗しました';
      console.error('書籍登録エラー:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMobileConsole = () => {
    setIsMobileConsoleVisible(!isMobileConsoleVisible);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
              <h2 className="text-center text-3xl font-extrabold text-gray-900">
                管理者ログイン
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                書籍登録システムにアクセスするための認証が必要です
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  ユーザー名
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  パスワード
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'ログイン中...' : 'ログイン'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <button
                onClick={() => navigate('/')}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
              >
                ← トップページに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* 管理者ナビゲーションヘッダー */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">📝 書籍登録</h1>
              <p className="text-sm text-gray-600">新しい書籍を登録できます</p>
            </div>
            <div className="flex items-center space-x-2 pr-16">
              <button
                onClick={() => navigate('/admin/register')}
                className="bg-blue-600 text-white w-10 h-10 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                title="書籍登録"
                aria-label="書籍登録"
              >
                📝
              </button>
              <button
                onClick={() => navigate('/admin/books')}
                className="bg-orange-600 text-white w-10 h-10 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
                title="書籍一覧"
                aria-label="書籍一覧"
              >
                📚
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('adminAuthenticated');
                  localStorage.removeItem('adminUsername');
                  localStorage.removeItem('adminPassword');
                  setIsAuthenticated(false);
                  setLoginForm({ username: '', password: '' });
                }}
                className="bg-red-600 text-white w-10 h-10 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                title="ログアウト"
                aria-label="ログアウト"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        <div className="bg-white/90 backdrop-blur-sm shadow-xl sm:rounded-2xl border border-orange-100">
          <div className="px-4 py-5 sm:p-6">
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  書籍名 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={bookForm.title}
                    onChange={(e) => setBookForm(prev => ({ ...prev, title: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="例: 7つの習慣"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="amazon_link" className="block text-sm font-medium text-gray-700">
                  Amazonリンク <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="amazon_link"
                    name="amazon_link"
                    type="url"
                    required
                    value={bookForm.amazon_link}
                    onChange={(e) => setBookForm(prev => ({ ...prev, amazon_link: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://www.amazon.co.jp/dp/..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="summary_link1" className="block text-sm font-medium text-gray-700">
                  要約リンク1 <span className="text-gray-500 text-xs">(任意)</span>
                </label>
                <div className="mt-1">
                  <input
                    id="summary_link1"
                    name="summary_link1"
                    type="url"
                    value={bookForm.summary_link1}
                    onChange={(e) => setBookForm(prev => ({ ...prev, summary_link1: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://example.com/summary または https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="summary_link2" className="block text-sm font-medium text-gray-700">
                  要約リンク2 <span className="text-gray-500 text-xs">(任意)</span>
                </label>
                <div className="mt-1">
                  <input
                    id="summary_link2"
                    name="summary_link2"
                    type="url"
                    value={bookForm.summary_link2}
                    onChange={(e) => setBookForm(prev => ({ ...prev, summary_link2: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://example.com/summary または https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="summary_link3" className="block text-sm font-medium text-gray-700">
                  要約リンク3 <span className="text-gray-500 text-xs">(任意)</span>
                </label>
                <div className="mt-1">
                  <input
                    id="summary_link3"
                    name="summary_link3"
                    type="url"
                    value={bookForm.summary_link3}
                    onChange={(e) => setBookForm(prev => ({ ...prev, summary_link3: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://example.com/summary または https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  タグ
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    id="tags"
                    name="tags"
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="タグを入力してEnterまたは追加ボタンを押してください"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    追加
                  </button>
                </div>

                {bookForm.tags.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {bookForm.tags.map((tag) => {
                        const colors = getRandomColor(tag.name);
                        return (
                          <span
                            key={tag.id}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            <span className="mr-1">🏷️</span>
                            {tag.name}
                            <button
                              type="button"
                              onClick={() => removeTag(tag.id)}
                              className={`ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full ${colors.text} hover:bg-red-200 hover:text-red-600 transition-colors`}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/books')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  書籍一覧へ
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !bookForm.title || !bookForm.amazon_link}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? '登録中...' : '書籍を登録'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 管理者フッター */}
      <AdminFooter 
        onMobileConsoleToggle={toggleMobileConsole}
        isMobileConsoleVisible={isMobileConsoleVisible}
      />

      {/* モバイルコンソール */}
      <MobileConsole
        isVisible={isMobileConsoleVisible}
        onToggle={toggleMobileConsole}
      />
    </div>
  );
};

export default BookRegisterPage;