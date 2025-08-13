import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

const TagPage: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, token, user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [tagName, setTagName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedTags, setExpandedTags] = useState<{ [key: number]: boolean }>({});
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirmBook, setDeleteConfirmBook] = useState<Book | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchData = async () => {
      if (!tag) return;

      try {
        setIsLoading(true);
        setError('');

        // URLデコードしてタグ名を取得
        const decodedTagName = decodeURIComponent(tag);
        setTagName(decodedTagName);

        // そのタグの書籍を取得
        const booksResponse = await fetch(`${API_BASE_URL}/api/books/tag/${encodeURIComponent(decodedTagName)}`);
        if (!booksResponse.ok) {
          if (booksResponse.status === 404) {
            setError('指定されたタグが見つかりません');
          } else {
            throw new Error('書籍の取得に失敗しました');
          }
          return;
        }
        const booksData = await booksResponse.json();
        setBooks(booksData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tag, API_BASE_URL]);

  const handleBookClick = (amazonLink: string) => {
    window.open(amazonLink, '_blank', 'noopener,noreferrer');
  };

  const handleTagClick = (tagName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // イベントの伝播を停止してbook clickを防ぐ
    navigate(`/tags/${encodeURIComponent(tagName)}`);
  };

  const toggleTagAccordion = (bookId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // イベントの伝播を停止してbook clickを防ぐ
    setExpandedTags(prev => ({
      ...prev,
      [bookId]: !prev[bookId]
    }));
  };

  const handleEditClick = (book: Book, event: React.MouseEvent) => {
    event.stopPropagation(); // イベントの伝播を停止してbook clickを防ぐ
    setEditingBook(book);
    setShowEditModal(true);
  };

  const handleDeleteClick = (book: Book, event: React.MouseEvent) => {
    event.stopPropagation(); // イベントの伝播を停止してbook clickを防ぐ
    setDeleteConfirmBook(book);
  };

  const handleEditSave = async (updatedBook: { title: string; amazon_link: string; tags: string[] }) => {
    if (!editingBook || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${editingBook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedBook),
      });

      if (!response.ok) {
        throw new Error('書籍の更新に失敗しました');
      }

      const updatedBookData = await response.json();
      
      // ローカル状態を更新
      setBooks(prevBooks =>
        prevBooks.map(book =>
          book.id === editingBook.id ? updatedBookData : book
        )
      );

      setShowEditModal(false);
      setEditingBook(null);
    } catch (error) {
      console.error('Edit book error:', error);
      alert('書籍の更新に失敗しました');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmBook || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${deleteConfirmBook.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('書籍の削除に失敗しました');
      }

      // ローカル状態を更新
      setBooks(prevBooks =>
        prevBooks.filter(book => book.id !== deleteConfirmBook.id)
      );

      setDeleteConfirmBook(null);
    } catch (error) {
      console.error('Delete book error:', error);
      alert('書籍の削除に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/mypage')}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            マイページに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-orange-600 hover:text-orange-700 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">🏷️</span>
              <h1 className="text-2xl font-bold text-gray-800">{tagName}</h1>
            </div>
            <p className="text-gray-600">
              {books.length}冊の書籍が登録されています
            </p>
          </div>
        </div>

        {/* 書籍一覧 */}
        {books.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 text-lg">このタグに登録された書籍はまだありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookClick(book.amazon_link)}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-orange-100 hover:shadow-xl hover:bg-white/90 transition-all duration-200 cursor-pointer group"
              >
                {/* 第1セクション: 書籍タイトルとリンク遷移アイコン */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-orange-700 transition-colors leading-tight line-clamp-2 overflow-hidden">
                      {book.title}
                    </h3>
                  </div>
                  
                  {/* リンク遷移アイコン */}
                  <div className="flex-shrink-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 第2セクション: タグ一覧 */}
                <div className="mb-4">
                  {book.tags.length <= 3 ? (
                    // 3つ以下のタグはそのまま表示
                    <div className="flex flex-wrap gap-2">
                      {book.tags.map((bookTag) => {
                        const colors = getRandomColor(bookTag.name);
                        const isCurrentTag = bookTag.name === tagName;
                        return (
                          <span
                            key={bookTag.id}
                            onClick={(e) => handleTagClick(bookTag.name, e)}
                            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                              isCurrentTag
                                ? 'bg-orange-200 text-orange-800 border-orange-300 ring-2 ring-orange-300 hover:bg-orange-300'
                                : `${colors.bg} ${colors.text} ${colors.border} hover:scale-105 hover:shadow-sm`
                            }`}
                          >
                            <span className="mr-1">🏷️</span>
                            {bookTag.name}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    // 4つ以上のタグはアコーディオン形式で表示
                    <div>
                      {/* 最初の3つのタグを表示 */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {book.tags.slice(0, 3).map((bookTag) => {
                          const colors = getRandomColor(bookTag.name);
                          const isCurrentTag = bookTag.name === tagName;
                          return (
                            <span
                              key={bookTag.id}
                              onClick={(e) => handleTagClick(bookTag.name, e)}
                              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                                isCurrentTag
                                  ? 'bg-orange-200 text-orange-800 border-orange-300 ring-2 ring-orange-300 hover:bg-orange-300'
                                  : `${colors.bg} ${colors.text} ${colors.border} hover:scale-105 hover:shadow-sm`
                              }`}
                            >
                              <span className="mr-1">🏷️</span>
                              {bookTag.name}
                            </span>
                          );
                        })}
                      </div>

                      {/* アコーディオントグルボタン */}
                      <button
                        onClick={(e) => toggleTagAccordion(book.id, e)}
                        className="inline-flex items-center px-3 py-1 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <span className="mr-1">
                          {expandedTags[book.id] ? '▼' : '▶'}
                        </span>
                        {expandedTags[book.id] ? 'タグを隠す' : `タグを見る (+${book.tags.length - 3})`}
                      </button>

                      {/* 展開された残りのタグ */}
                      {expandedTags[book.id] && (
                        <div className="flex flex-wrap gap-2 mt-2 pl-4 border-l-2 border-orange-200">
                          {book.tags.slice(3).map((bookTag) => {
                            const colors = getRandomColor(bookTag.name);
                            const isCurrentTag = bookTag.name === tagName;
                            return (
                              <span
                                key={bookTag.id}
                                onClick={(e) => handleTagClick(bookTag.name, e)}
                                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                                  isCurrentTag
                                    ? 'bg-orange-200 text-orange-800 border-orange-300 ring-2 ring-orange-300 hover:bg-orange-300'
                                    : `${colors.bg} ${colors.text} ${colors.border} hover:scale-105 hover:shadow-sm`
                                }`}
                              >
                                <span className="mr-1">🏷️</span>
                                {bookTag.name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 第3セクション: 編集・削除ボタン */}
                {isAuthenticated && user?.userId === '115610079057789909588' && (
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={(e) => handleEditClick(book, e)}
                      className="flex items-center px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                      title="編集"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      編集
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(book, e)}
                      className="flex items-center px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                      title="削除"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      削除
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 編集モーダル */}
        {showEditModal && editingBook && (
          <EditBookModal
            book={editingBook}
            onSave={handleEditSave}
            onCancel={() => {
              setShowEditModal(false);
              setEditingBook(null);
            }}
          />
        )}

        {/* 削除確認ダイアログ */}
        {deleteConfirmBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">書籍を削除しますか？</h3>
              <p className="text-gray-600 mb-6">
                「{deleteConfirmBook.title}」を削除します。この操作は取り消せません。
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setDeleteConfirmBook(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagPage;