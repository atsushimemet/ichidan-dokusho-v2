import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

const TagPage: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [tagName, setTagName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

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
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100 hover:shadow-xl hover:bg-white/90 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start space-x-4">
                  {/* 書籍アイコン */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white text-2xl shadow-md group-hover:shadow-lg transition-shadow">
                      📖
                    </div>
                  </div>
                  
                  {/* 書籍情報 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-orange-700 transition-colors">
                      {book.title}
                    </h3>
                    
                    {/* タグ一覧 */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {book.tags.map((bookTag) => (
                        <span
                          key={bookTag.id}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            bookTag.name === tagName
                              ? 'bg-orange-200 text-orange-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {bookTag.name}
                        </span>
                      ))}
                    </div>
                    
                    {/* 登録日 */}
                    <p className="text-sm text-gray-500">
                      登録日: {new Date(book.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  
                  {/* 外部リンクアイコン */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagPage;