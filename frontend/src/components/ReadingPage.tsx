import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BookIcon from './BookIcon';


interface BookToRead {
  id: number;
  title: string;
  link: string;
  is_not_book: boolean;
  created_at: string;
}

function ReadingPage() {
  const { token, isAuthenticated } = useAuth();
  const [booksToRead, setBooksToRead] = useState<BookToRead[]>([]);
  const [newBook, setNewBook] = useState({
    title: '',
    link: '',
    isNotBook: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // データをAPIから読み込む関数
  const loadWishlistItems = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const items = await response.json();
        setBooksToRead(items);
      } else {
        console.error('ウィッシュリストの取得に失敗しました');
      }
    } catch (error) {
      console.error('ウィッシュリストの取得に失敗しました:', error);
    }
  };

  // コンポーネントマウント時にデータを読み込み
  useEffect(() => {
    if (isAuthenticated && token) {
      loadWishlistItems();
    }
  }, [isAuthenticated, token]);

  const handleAddBook = async () => {
    if (!newBook.title.trim()) {
      alert('タイトルを入力してください。');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newBook.title,
          link: newBook.link,
          isNotBook: newBook.isNotBook
        }),
      });

      if (response.ok) {
        // 成功したらリストを再読み込み
        await loadWishlistItems();
        setNewBook({
          title: '',
          link: '',
          isNotBook: false
        });
      } else {
        alert('追加に失敗しました。再度お試しください。');
      }
    } catch (error) {
      console.error('アイテムの追加に失敗しました:', error);
      alert('追加に失敗しました。再度お試しください。');
    }
  };

  const handleRemoveBook = async (itemId: number) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/wishlist/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // 成功したらリストを再読み込み
        await loadWishlistItems();
      } else {
        alert('削除に失敗しました。再度お試しください。');
      }
    } catch (error) {
      console.error('アイテムの削除に失敗しました:', error);
      alert('削除に失敗しました。再度お試しください。');
    }
  };


  const handleSave = async () => {
    if (booksToRead.length === 0) {
      alert('読みたい・見たいものを少なくとも1つ追加してください。');
      return;
    }

    setIsSubmitting(true);

    try {
      // データは既にAPIで自動保存されているため、
      // ここでは確認メッセージを表示
      console.log('現在の読みたい・見たいものリスト:', booksToRead);
      
      alert('リストが保存されました！データはサーバーに保存され、次回アクセス時も表示されます。');
    } catch (error) {
      console.error('保存に失敗しました:', error);
      alert('保存に失敗しました。再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">ログインしてください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー部分 - /input画面のheading 1スタイルを使用 */}
      <div className="flex items-center justify-center mb-8">
        <BookIcon size={48} />
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-orange-800 ml-3 leading-tight">
          読みたい本を登録しよう
        </h1>
      </div>

      {/* 新しい本を追加するフォーム */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">新しい本を追加</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル *
            </label>
            <input
              type="text"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder={newBook.isNotBook ? "記事や動画のタイトルを入力..." : "読みたい本のタイトルを入力..."}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              リンク（任意）
            </label>
            <input
              type="url"
              value={newBook.link}
              onChange={(e) => setNewBook({ ...newBook, link: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder={newBook.isNotBook ? "記事のURL、YouTubeリンクなど" : "Amazon URL や 書籍情報のリンク"}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isNotBook"
              checked={newBook.isNotBook}
              onChange={(e) => setNewBook({ ...newBook, isNotBook: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isNotBook" className="text-sm text-gray-700">
              本以外（記事、動画など）
            </label>
          </div>

          <button
            onClick={handleAddBook}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            追加
          </button>
        </div>
      </div>


      {/* 読みたい・見たいもののリスト */}
      {booksToRead.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">読みたい・見たいものリスト</h2>
          
          <div className="space-y-3">
            {booksToRead.map((book, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                <div>
                  <div className="font-medium text-gray-800">{book.title}</div>
                  {book.link && (
                    <a 
                      href={book.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      リンクを開く
                    </a>
                  )}
                  {book.is_not_book && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded ml-2">
                      本以外
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveBook(book.id)}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  削除
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="mt-4 w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-medium transition-colors"
          >
            {isSubmitting ? '保存中...' : '保存する'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ReadingPage;