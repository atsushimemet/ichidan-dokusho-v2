import { useEffect, useState } from 'react';

interface ReadingRecord {
  id: number;
  title: string;
  link?: string;
  reading_amount: string;
  learning: string;
  action: string;
  created_at: string;
  updated_at: string;
}

function Timeline() {
  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/reading-records');
      
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
      case '1文だけ': return 'bg-blue-100 text-blue-700';
      case '1段落': return 'bg-green-100 text-green-700';
      case '1章': return 'bg-orange-100 text-orange-700';
      case '1冊・全文': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-orange-800 mb-8 leading-tight">
          🌟 タイムライン
        </h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-orange-800 mb-8 leading-tight">
          🌟 タイムライン
        </h1>
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
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-orange-800 mb-8 leading-tight">
        🌟 タイムライン
      </h1>
      
      <div className="text-center mb-6">
        <p className="text-gray-600">みんなの読書記録をチェックしよう！</p>
        <p className="text-sm text-gray-500 mt-1">新しい発見や学びがきっと見つかります</p>
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReadingAmountColor(record.reading_amount)}`}>
                  {record.reading_amount}
                </span>
              </div>

              {/* リンク */}
              {record.link && (
                <div className="mb-4">
                  <a
                    href={record.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline break-all"
                  >
                    📎 リンクを開く
                  </a>
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
