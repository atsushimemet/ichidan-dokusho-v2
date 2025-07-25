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
  notes?: string;
  user_id?: string;
  user_email?: string;
  created_at: string;
  updated_at: string;
}

function MyPage() {
  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAccordions, setExpandedAccordions] = useState<{ [key: number]: boolean }>({});
  const [editingRecord, setEditingRecord] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    reading_amount: string;
    learning: string;
    action: string;
    notes: string;
    link: string;
  }>({
    title: '',
    reading_amount: '',
    learning: '',
    action: '',
    notes: '',
    link: ''
  });

  const toggleAccordion = (recordId: number) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

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

  // 投稿削除処理
  const deleteRecord = async (id: number, title: string) => {
    // 削除確認
    if (!window.confirm(`「${title}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/reading-records/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // 削除成功時、レコードリストから削除
        setRecords(prevRecords => prevRecords.filter(record => record.id !== id));
        alert('投稿を削除しました。');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : '削除中にエラーが発生しました');
    }
  };

  // 編集開始
  const startEdit = (record: ReadingRecord) => {
    setEditingRecord(record.id);
    setEditFormData({
      title: record.title,
      reading_amount: record.reading_amount,
      learning: record.learning,
      action: record.action,
      notes: record.notes || '',
      link: record.link || ''
    });
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingRecord(null);
    setEditFormData({
      title: '',
      reading_amount: '',
      learning: '',
      action: '',
      notes: '',
      link: ''
    });
  };

  // 投稿更新処理
  const updateRecord = async (id: number) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/reading-records/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedRecord = await response.json();
        // レコードリストを更新
        setRecords(prevRecords => 
          prevRecords.map(record => 
            record.id === id ? { ...record, ...updatedRecord.data } : record
          )
        );
        setEditingRecord(null);
        alert('投稿を更新しました。');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '更新に失敗しました');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert(error instanceof Error ? error.message : '更新中にエラーが発生しました');
    }
  };

  // 編集フォームの入力変更処理
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    const googleTodoUrl = `https://tasks.google.com/`;
    
    // Google Analytics 追跡（必要に応じて）
    // trackShare('google-todo', todoText.length);
    
    // クリップボードにタスクをコピー
    navigator.clipboard.writeText(todoText).then(() => {
      // Google Todoを新しいタブで開く
      window.open(googleTodoUrl, '_blank');
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
    });
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100 mt-8 sm:mt-0">
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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100 mt-8 sm:mt-0">
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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100 mt-8 sm:mt-0">
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
        <div className="space-y-6 max-h-96 overflow-y-auto">
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
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${getReadingAmountColor(record.reading_amount)} flex-shrink-0`}></div>
                  <button
                    onClick={() => startEdit(record)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1 rounded-full transition-colors"
                    title="投稿を編集"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteRecord(record.id, record.title)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-colors"
                    title="投稿を削除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 編集モード */}
              {editingRecord === record.id ? (
                <div className="space-y-4">
                  {/* 編集フォーム */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      タイトル
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      読書量・読んだ量
                    </label>
                    <select
                      name="reading_amount"
                      value={editFormData.reading_amount}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1文だけ">💬 1文だけ</option>
                      <option value="1段落">📝 1段落</option>
                      <option value="1章">📖 1章</option>
                      <option value="1冊・全文">📚 1冊・全文</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      学び・気づき
                    </label>
                    <textarea
                      name="learning"
                      value={editFormData.learning}
                      onChange={handleEditInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      今日のアクション
                    </label>
                    <textarea
                      name="action"
                      value={editFormData.action}
                      onChange={handleEditInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      備考・メモ（任意）
                    </label>
                    <textarea
                      name="notes"
                      value={editFormData.notes}
                      onChange={handleEditInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      リンク
                    </label>
                    <input
                      type="url"
                      name="link"
                      value={editFormData.link}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* 編集ボタン */}
                  <div className="flex space-x-2 pt-4">
                    <button
                      onClick={() => updateRecord(record.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* 通常表示モード */}
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
                <div className="min-h-[80px] bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400 flex items-center">
                  <p className="text-gray-800">{record.learning}</p>
                </div>
              </div>

              {/* アクション */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">🎯 明日のアクション</h4>
                <div className="min-h-[80px] bg-green-50 p-3 rounded-lg border-l-4 border-green-400 flex items-center">
                  <p className="text-gray-800">{record.action}</p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => openGoogleTodo(record.action, record.title)}
                    className="w-full h-12 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    <span>📝</span>
                    <span>Google Todoに追加</span>
                  </button>
                </div>
              </div>

              {/* 備考（マイページでのみ表示） */}
              {record.notes && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">📝 備考</h4>
                  <div className="min-h-[80px] bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400 flex items-center">
                    <p className="text-gray-800">{record.notes}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    この情報はあなたのマイページでのみ表示されています
                  </p>
                </div>
              )}

              {/* ソーシャルメディアシェア */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-end mb-3">
                  <div className="text-sm text-gray-500">
                    {(() => {
                      const text = generateSocialText(record.learning, record.action, record.title);
                      const charCount = text.length;
                      const isWithinCharLimit = isWithinLimit(text);
                      return (
                        <span className={isWithinCharLimit ? 'text-green-500' : 'text-orange-500'}>
                          {charCount}/140文字 {isWithinCharLimit ? '(Xでシェア可能)' : '(noteのネタに)'}
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
                          className="flex-1 h-12 flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                          Xでシェア
                        </button>
                      ) : (
                        // 140文字を超える場合：noteのネタに
                        <button
                          onClick={() => shareOnNote(record.learning, record.action, record.title)}
                          className="flex-1 h-12 flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                        >
                          noteのネタに
                        </button>
                      )}
                    </div>
                  );
                })()}
                
              </div>

              {/* アコーディオン - 使い方ガイド */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => toggleAccordion(record.id)}
                  className="w-full h-12 flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-700">📖 機能の使い方</span>
                  <span className={`transform transition-transform ${expandedAccordions[record.id] ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {expandedAccordions[record.id] && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-4">
                      {/* Google Todo */}
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">📝 Google Todoに追加</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• アクションがクリップボードにコピーされます</li>
                          <li>• Google Todoが開くので、Ctrl+V（MacはCmd+V）で貼り付け</li>
                        </ul>
                      </div>
                      
                      {/* シェア機能 */}
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">📱 シェア機能</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 140文字以内：Xでシェア</li>
                          <li>• 140文字超過：noteのネタに</li>
                          <li>• 内容は自動でクリップボードにコピー</li>
                          {(() => {
                            const text = generateSocialText(record.learning, record.action, record.title);
                            const isWithinCharLimit = isWithinLimit(text);
                            
                            if (!isWithinCharLimit) {
                              return (
                                <li className="text-orange-500">• ※ 140文字超過のためnoteのネタに</li>
                              );
                            }
                            return null;
                          })()}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPage; 
