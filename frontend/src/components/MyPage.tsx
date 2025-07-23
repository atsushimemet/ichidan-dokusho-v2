import { useEffect, useState } from 'react';
import { isAmazonLink } from '../utils/amazonUtils';
import { trackShare } from '../utils/analytics';
import BookIcon from './BookIcon';

interface ReadingRecord {
  id: number;
  title: string;
  link?: string;
  reading_amount: string;
  learning: string;
  action: string;
  user_id?: string;
  user_email?: string;
  created_at: string;
  updated_at: string;
}

function MyPage() {
  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // 環境変数からAPI URLを取得
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/my-records`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setRecords(result.data || []);
    } catch (error) {
      console.error('レコード取得エラー:', error);
      setError('レコードの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReadingAmountIcon = (amount: string) => {
    switch (amount) {
      case '1文だけ': return '💬';
      case '1段落': return '📝';
      case '1章': return '📖';
      case '1冊・全文': return '📚';
      default: return '📖';
    }
  };

  const getReadingAmountColor = (amount: string) => {
    switch (amount) {
      case '1文だけ': return 'bg-blue-500';
      case '1段落': return 'bg-green-500';
      case '1章': return 'bg-orange-500';
      case '1冊・全文': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // 学びとアクションを統合して140文字以内のテキストを生成
  const generateSocialText = (learning: string, action: string, title: string) => {
    const combinedText = `📖 ${title}\n💡 ${learning}\n🎯 ${action}\n#1段読書 #読書習慣\n👇 今すぐチェック！\nhttps://ichidan-dokusho.netlify.app/`;
    return combinedText;
  };

  // 文字数チェック（140文字以内かどうか）
  const isWithinLimit = (text: string) => {
    return text.length <= 140;
  };

  // X（Twitter）でシェア
  const shareOnTwitter = (learning: string, action: string, title: string) => {
    const text = generateSocialText(learning, action, title);
    const encodedText = encodeURIComponent(text);
    const url = `https://twitter.com/intent/tweet?text=${encodedText}`;
    
    // Google Analytics シェア追跡
    trackShare('twitter', text.length);
    
    window.open(url, '_blank');
  };

  // noteでシェア
  const shareOnNote = (learning: string, action: string, title: string) => {
    const text = generateSocialText(learning, action, title);
    
    // Google Analytics シェア追跡
    trackShare('note', text.length);
    
    // クリップボードにコピー
    navigator.clipboard.writeText(text).then(() => {
      // noteのトップページに遷移
      window.open('https://note.com/', '_blank');
    }).catch(err => {
      console.error('クリップボードへのコピーに失敗しました:', err);
      // フォールバック: 古いブラウザ対応
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      window.open('https://note.com/', '_blank');
    });
  };

  // Google Todoを開く
  const openGoogleTodo = (action: string, title: string) => {
    // Google TodoのURLを生成
    const todoText = `${action} (${title}より)`;
    const encodedText = encodeURIComponent(todoText);
    const googleTodoUrl = `https://tasks.google.com/`;
    
    // Google Analytics 追跡（必要に応じて）
    // trackShare('google-todo', todoText.length);
    
    // クリップボードにタスクをコピー
    navigator.clipboard.writeText(todoText).then(() => {
      // Google Todoを新しいタブで開く
      window.open(googleTodoUrl, '_blank');
      
      // コピー完了の通知
      setTimeout(() => {
        alert(`✅ 明日のアクションをクリップボードにコピーしました！\n\n📝 コピーされた内容：\n${todoText}\n\nGoogle Todoが開きました。Ctrl+V（またはCmd+V）でタスクを貼り付けてください。`);
      }, 500);
    }).catch(err => {
      console.error('クリップボードへのコピーに失敗しました:', err);
      // フォールバック: 古いブラウザ対応
      const textArea = document.createElement('textarea');
      textArea.value = todoText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // Google Todoを新しいタブで開く
      window.open(googleTodoUrl, '_blank');
      
      // コピー完了の通知
      setTimeout(() => {
        alert(`✅ 明日のアクションをクリップボードにコピーしました！\n\n📝 コピーされた内容：\n${todoText}\n\nGoogle Todoが開きました。Ctrl+V（またはCmd+V）でタスクを貼り付けてください。`);
      }, 500);
    });
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100">
        <div className="flex items-center justify-center mb-8">
          <BookIcon size={48} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-orange-800 ml-3 leading-tight">
            マイページ
          </h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100">
        <div className="flex items-center justify-center mb-8">
          <BookIcon size={48} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-orange-800 ml-3 leading-tight">
            マイページ
          </h1>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchRecords}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100">
      <div className="flex items-center justify-center mb-8">
        <BookIcon size={48} />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-orange-800 ml-3 leading-tight">
          マイページ
        </h1>
      </div>
      
      {records.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">まだ読書記録がありません</p>
          <p className="text-gray-500">最初の読書記録を作成してみましょう！</p>
        </div>
      ) : (
        <div className="space-y-6">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl shadow-md border border-orange-100 p-6 hover:shadow-lg transition-shadow"
            >
              {/* ヘッダー */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getReadingAmountIcon(record.reading_amount)}</span>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{record.title}</h3>
                    <p className="text-sm text-gray-500">{formatDate(record.created_at)}</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full ${getReadingAmountColor(record.reading_amount)} flex-shrink-0`}></div>
              </div>

              {/* リンク */}
              {record.link && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <a
                      href={record.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline break-all"
                    >
                      📎 リンクを開く
                    </a>
                    {isAmazonLink(record.link) && (
                      <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
                        PR
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 学び */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">💡 今日の学び</h4>
                <p className="text-gray-800 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                  {record.learning}
                </p>
              </div>

              {/* アクション */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">🎯 明日のアクション</h4>
                <p className="text-gray-800 bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                  {record.action}
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => openGoogleTodo(record.action, record.title)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    <span>📝</span>
                    <span>Google Todoに追加</span>
                  </button>
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600 text-lg">💡</span>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">使い方：</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>ボタンを押すと明日のアクションがクリップボードにコピーされます</li>
                          <li>Google Todoが自動で開きます</li>
                          <li>Ctrl+V（Macの場合はCmd+V）でタスクを貼り付けてください</li>
                          <li>読書から得た学びを実際の行動に移すことができます</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ソーシャルメディアシェア */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">📱 シェア</h4>
                  <div className="text-sm text-gray-500">
                    {(() => {
                      const text = generateSocialText(record.learning, record.action, record.title);
                      const charCount = text.length;
                      const isWithinCharLimit = isWithinLimit(text);
                      return (
                        <span className={isWithinCharLimit ? 'text-green-500' : 'text-orange-500'}>
                          {charCount}/140文字 {isWithinCharLimit ? '(Xでシェア可能)' : '(noteでシェア)'}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                
                {(() => {
                  const text = generateSocialText(record.learning, record.action, record.title);
                  const isWithinCharLimit = isWithinLimit(text);
                  
                  return (
                    <div className="flex space-x-2">
                      {isWithinCharLimit ? (
                        // 140文字以内の場合：Xでシェア
                        <button
                          onClick={() => shareOnTwitter(record.learning, record.action, record.title)}
                          className="flex-1 px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                          Xでシェア
                        </button>
                      ) : (
                        // 140文字を超える場合：noteでシェア
                        <button
                          onClick={() => shareOnNote(record.learning, record.action, record.title)}
                          className="flex-1 px-4 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                        >
                          noteでシェア
                        </button>
                      )}
                    </div>
                  );
                })()}
                
                {(() => {
                  const text = generateSocialText(record.learning, record.action, record.title);
                  const isWithinCharLimit = isWithinLimit(text);
                  
                  if (!isWithinCharLimit) {
                    return (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-orange-500">
                          ※ 140文字を超えているため、noteでシェアします。
                        </p>
                        <p className="text-xs text-gray-500">
                          ※ 内容がクリップボードにコピーされ、noteのトップページが開きます。
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPage; 
