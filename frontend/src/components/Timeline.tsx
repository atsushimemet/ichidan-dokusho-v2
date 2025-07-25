import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isAmazonLink } from '../utils/amazonUtils';
import BookIcon from './BookIcon';

interface ReadingRecord {
  id: number;
  title: string;
  link?: string;
  reading_amount: string;
  learning: string;
  action: string;
  created_at: string;
  updated_at: string;
  like_count?: number | string;
  is_liked?: boolean;
  containsSpoiler?: boolean;
  user_email?: string;
}

interface UserSettings {
  hideSpoilers: boolean;
}

function Timeline() {
  const { token, user } = useAuth();
  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ReadingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [userSettings, setUserSettings] = useState<UserSettings>({ hideSpoilers: false });

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    if (sessionId) {
      fetchRecords();
    }
  }, [sessionId]);

  useEffect(() => {
    if (token) {
      loadUserSettings();
    }
  }, [token]);

  useEffect(() => {
    console.log('=== フィルタリング処理開始 ===');
    console.log('userSettings.hideSpoilers:', userSettings.hideSpoilers);
    console.log('user.email:', user?.email);
    console.log('records:', records);
    
    // ネタバレ設定に基づいてレコードをフィルタリング
    if (userSettings.hideSpoilers) {
      const filtered = records.filter(record => {
        console.log('フィルタリング対象レコード:', {
          id: record.id,
          title: record.title,
          user_email: record.user_email,
          containsSpoiler: record.containsSpoiler,
          isOwnPost: user && record.user_email === user.email
        });
        
        // 自分の投稿は常に表示
        if (user && record.user_email === user.email) {
          console.log('自分の投稿なので表示:', record.title);
          return true;
        }
        // 他人のネタバレ投稿は非表示
        const shouldShow = !record.containsSpoiler;
        console.log('他人の投稿:', record.title, 'ネタバレ:', record.containsSpoiler, '表示:', shouldShow);
        return shouldShow;
      });
      console.log('フィルタリング結果:', filtered);
      setFilteredRecords(filtered);
    } else {
      console.log('ネタバレ非表示設定がOFFなので全件表示');
      setFilteredRecords(records);
    }
  }, [records, userSettings.hideSpoilers, user]);

  const loadUserSettings = async () => {
    try {
      console.log('=== ユーザー設定読み込み開始 ===');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/user-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const settings = await response.json();
        console.log('取得したユーザー設定:', settings);
        setUserSettings(settings);
      } else {
        console.log('ユーザー設定の取得に失敗:', response.status);
      }
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
    }
  };

  const initializeSession = async () => {
    try {
      // ローカルストレージからセッションIDを取得
      let storedSessionId = localStorage.getItem('sessionId');
      
      if (!storedSessionId) {
        // 環境変数からAPI URLを取得
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
        // 新しいセッションIDを生成
        const response = await fetch(`${API_BASE_URL}/api/session`, {
          method: 'POST',
        });
        
        if (response.ok) {
          const result = await response.json();
          storedSessionId = result.sessionId;
          if (storedSessionId) {
            localStorage.setItem('sessionId', storedSessionId);
          }
        }
      }
      
      setSessionId(storedSessionId || '');
    } catch (error) {
      console.error('Session initialization error:', error);
      setError('セッションの初期化に失敗しました。');
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // 環境変数からAPI URLを取得
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/reading-records?sessionId=${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('タイムライン取得データ:', result.data);
      
      // バックエンドのスネークケースをキャメルケースに変換
      const convertedRecords = (result.data || []).map((record: any) => ({
        ...record,
        containsSpoiler: record.contains_spoiler
      }));
      console.log('タイムライン変換後データ:', convertedRecords);
      
      setRecords(convertedRecords);
    } catch (error) {
      console.error('レコード取得エラー:', error);
      setError('レコードの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (recordId: number, isLiked: boolean) => {
    try {
      // 環境変数からAPI URLを取得
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const url = `${API_BASE_URL}/api/reading-records/${recordId}/like`;
      const method = isLiked ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        // ローカル状態を更新してページの再レンダリングを防ぐ
        setRecords(prevRecords => 
          prevRecords.map(record => 
            record.id === recordId 
              ? {
                  ...record,
                  is_liked: !isLiked,
                  like_count: isLiked 
                    ? Math.max(0, Number(record.like_count ?? 0) - 1)
                    : Number(record.like_count ?? 0) + 1
                }
              : record
          )
        );
        
        // デバッグ用ログ
        console.log('Like action:', { recordId, isLiked, newLikeCount: isLiked ? Math.max(0, Number(records.find(r => r.id === recordId)?.like_count ?? 0) - 1) : Number(records.find(r => r.id === recordId)?.like_count ?? 0) + 1 });
      }
    } catch (error) {
      console.error('いいねエラー:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100 mt-8 sm:mt-0">
        <div className="flex items-center justify-center mb-8">
          <BookIcon size={48} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-orange-800 ml-3 leading-tight">
            タイムライン
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
            タイムライン
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
          タイムライン
        </h1>
      </div>
      
      {records.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">まだ読書記録がありません</p>
          <p className="text-gray-500">最初の読書記録を作成してみましょう！</p>
        </div>
      ) : (
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl shadow-md border border-orange-100 p-6 hover:shadow-lg transition-shadow"
            >
              {/* ヘッダー */}
              <div className="mb-4">
                {/* 書籍タイトルとネタバレインジケーター */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-base text-gray-800 line-clamp-2 leading-tight flex-1 min-w-0">
                    <span className="sm:hidden">
                      {record.title.length > 30 ? `${record.title.substring(0, 30)}...` : record.title}
                    </span>
                    <span className="hidden sm:block">
                      {record.title}
                    </span>
                  </h3>
                  {record.containsSpoiler && (
                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex-shrink-0">
                      ⚠️ ネタバレ
                    </span>
                  )}
                </div>
                
                {/* 読んだ量の丸といいねボタン */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${getReadingAmountColor(record.reading_amount)} flex-shrink-0`}></div>
                  <button
                    onClick={() => handleLike(record.id, record.is_liked || false)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      record.is_liked 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className={record.is_liked ? 'text-red-500' : 'text-gray-400'}>
                      {record.is_liked ? '❤️' : '🤍'}
                    </span>
                    <span>{Number(record.like_count ?? 0)}</span>
                  </button>
                </div>
                
                {/* 登録日 */}
                <p className="text-sm text-gray-500">{formatDate(record.created_at)}</p>
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
              <div>
                <h4 className="font-medium text-gray-700 mb-2">🎯 明日のアクション</h4>
                <p className="text-gray-800 bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                  {record.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Timeline; 
