import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditBookModal from './EditBookModal';

interface Tag {
  id: number;
  name: string;
  created_at: string;
}

interface Book {
  id: number;
  title: string;
  amazon_link: string;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

const AdminBooksPage: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  // 管理者認証
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'noap3b69n' && loginForm.password === '19930322') {
      setIsAuthenticated(true);
      setError('');
      fetchBooks();
    } else {
      setError('ユーザー名またはパスワードが間違っています');
    }
  };

  // 書籍一覧取得
  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/books');
      if (!response.ok) {
        throw new Error('書籍の取得に失敗しました');
      }
      const booksData = await response.json();
      setBooks(booksData);
    } catch (err) {
      setError('書籍の取得に失敗しました');
      console.error('Error fetching books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 書籍編集
  const handleEditBook = async (updatedBook: { title: string; amazon_link: string; tags: string[] }) => {
    if (!editingBook) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/books/${editingBook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedBook),
      });

      if (!response.ok) {
        throw new Error('書籍の更新に失敗しました');
      }

      // 書籍一覧を再取得
      await fetchBooks();
      setEditingBook(null);
    } catch (err) {
      setError('書籍の更新に失敗しました');
      console.error('Error updating book:', err);
    }
  };

  // 書籍削除
  const handleDeleteBook = async (bookId: number, bookTitle: string) => {
    if (!window.confirm(`「${bookTitle}」を削除しますか？\nこの操作は元に戻せません。`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('書籍の削除に失敗しました');
      }

      // 書籍一覧を再取得
      await fetchBooks();
    } catch (err) {
      setError('書籍の削除に失敗しました');
      console.error('Error deleting book:', err);
    }
  };

  // ログアウト
  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
    setBooks([]);
    setError('');
  };

  // 管理者認証画面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-orange-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">管理者ログイン</h1>
            <p className="text-gray-600">書籍管理システム</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                ユーザー名
              </label>
              <input
                type="text"
                id="username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              ログイン
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* ヘッダー */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">📚 書籍管理</h1>
              <p className="text-sm text-gray-600">{books.length}冊の書籍</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin/register')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                ＋ 新規登録
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-gray-600">読み込み中...</span>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 mb-4">登録された書籍がありません</p>
            <button
              onClick={() => navigate('/admin/register')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              最初の書籍を登録する
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-orange-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* カードヘッダー */}
                <div className="p-4 border-b border-orange-100">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-800 text-sm leading-5 flex-1 pr-2">
                      {book.title}
                    </h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => setEditingBook(book)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="編集"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id, book.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="削除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* カードボディ */}
                <div className="p-4">
                  {/* タグ */}
                  {book.tags && book.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {book.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Amazon リンク */}
                  <div className="mb-3">
                    <a
                      href={book.amazon_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Amazon で見る
                    </a>
                  </div>

                  {/* 登録日時 */}
                  <div className="text-xs text-gray-500">
                    登録日: {new Date(book.created_at).toLocaleString('ja-JP')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      {editingBook && (
        <EditBookModal
          book={editingBook}
          onSave={handleEditBook}
          onCancel={() => setEditingBook(null)}
        />
      )}
    </div>
  );
};

export default AdminBooksPage;