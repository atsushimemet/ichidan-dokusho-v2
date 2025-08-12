import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Tag {
  id: string;
  name: string;
}

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
    tags: [] as Tag[]
  });
  const [currentTag, setCurrentTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 認証チェック（フロントエンドでのチェック）
      if (loginForm.username === 'noap3b69n' && loginForm.password === '19930322') {
        setIsAuthenticated(true);
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
    setBookForm({ title: '', amazon_link: '', tags: [] });
    setSuccess('');
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
      
      const response = await fetch(`${API_BASE_URL}/api/admin/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: bookForm.title,
          amazon_link: bookForm.amazon_link,
          tags: bookForm.tags.map(tag => tag.name),
          username: loginForm.username,
          password: loginForm.password
        }),
      });

      if (!response.ok) {
        throw new Error('書籍登録に失敗しました');
      }

      const data = await response.json();
      setSuccess('書籍が正常に登録されました');
      setBookForm({ title: '', amazon_link: '', tags: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : '書籍登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">書籍登録</h1>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                ログアウト
              </button>
            </div>

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
                      {bookForm.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => removeTag(tag.id)}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-600 hover:bg-blue-200"
                          >
                            ×
                          </button>
                        </span>
                      ))}
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
                  onClick={() => navigate('/')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  キャンセル
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
    </div>
  );
};

export default BookRegisterPage;