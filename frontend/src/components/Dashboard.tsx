import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import BookIcon from './BookIcon';

interface ReadingRecord {
  id: number;
  title: string;
  link?: string;
  reading_amount: string;
  learning: string;
  action?: string;
  notes?: string;
  user_id?: string;
  user_email?: string;
  created_at: string;
  updated_at: string;
  theme_id?: number | null;
}

interface DailyRecord {
  date: string;
  count: number;
}

function Dashboard() {
  const { token, isAuthenticated } = useAuth();
  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // テーマ関連のstate
  const [allThemeStats, setAllThemeStats] = useState<any[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null); // null = 未分類
  const [dailyTrends, setDailyTrends] = useState<any[]>([]);

  // 認証状態の初期化を監視
  useEffect(() => {
    setAuthInitialized(true);
  }, []);

  useEffect(() => {
    if (authInitialized && isAuthenticated && token) {
      fetchRecords();
      fetchAllThemeStats();
      fetchDailyTrends(); // 初期表示時にも日次推移を取得
    }
  }, [authInitialized, isAuthenticated, token]);

  // テーマが変更されたときに統計を更新
  useEffect(() => {
    fetchDailyTrends();
  }, [selectedThemeId]);

  const fetchRecords = async () => {
    // 認証チェック
    if (!isAuthenticated || !token) {
      setError('ログインが必要です。');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 環境変数からAPI URLを取得
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/my-records`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const fetchedRecords = result.data || [];
      setRecords(fetchedRecords);

      // 全ユーザーに日次データを生成
      generateDailyRecords(fetchedRecords);
    } catch (error) {
      console.error('レコード取得エラー:', error);
      setError('レコードの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // 全テーマ統計を取得（プルダウン表示用）
  const fetchAllThemeStats = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/all-theme-reading-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setAllThemeStats(result.data || []);
      }
    } catch (error) {
      console.error('テーマ統計取得エラー:', error);
    }
  };



  // 日次推移データを取得
  const fetchDailyTrends = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const themeParam = selectedThemeId !== null ? `&themeId=${selectedThemeId}` : '';
      const url = `${API_BASE_URL}/api/daily-theme-reading-trends?days=14${themeParam}`;
      console.log('fetchDailyTrends URL:', url);
      console.log('selectedThemeId:', selectedThemeId);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('fetchDailyTrends response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('fetchDailyTrends result:', result);
        setDailyTrends(result.data || []);
      } else {
        console.error('fetchDailyTrends HTTP error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('日次推移取得エラー:', error);
    }
  };

  const generateDailyRecords = (records: ReadingRecord[]) => {
    const today = new Date();
    const dailyData: { [key: string]: number } = {};

    // 過去14日間の日付を初期化（13日前〜今日）
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = 0;
    }

    // レコードを日付ごとに集計
    records.forEach(record => {
      const recordDate = new Date(record.created_at).toISOString().split('T')[0];
      if (dailyData[recordDate] !== undefined) {
        dailyData[recordDate]++;
      }
    });

    // グラフ用データに変換
    const chartData: DailyRecord[] = Object.entries(dailyData)
      .map(([date, count]) => ({
        date: formatDateForChart(date),
        count,
        originalDate: date // ソート用に元の日付を保持
      }))
      .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
      .map(({ date, count }) => ({ date, count })); // originalDateを除去

    setDailyRecords(chartData);
  };

  const formatDateForChart = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    
    // 今日から何日前かを計算
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays}`;
  };

  if (!authInitialized || loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100 mt-8 sm:mt-0">
        <div className="flex items-center justify-center mb-8">
          <BookIcon size={48} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-orange-800 ml-3 leading-tight">
            ダッシュボード
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
            ダッシュボード
          </h1>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (authInitialized && !isAuthenticated) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100 mt-8 sm:mt-0">
        <div className="flex items-center justify-center mb-8">
          <BookIcon size={48} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-orange-800 ml-3 leading-tight">
            ダッシュボード
          </h1>
        </div>
        <div className="text-center py-12">
          <p className="text-orange-600">ログインが必要です。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100 mt-8 sm:mt-0">
      <div className="flex items-center justify-center mb-8">
        <BookIcon size={48} />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-orange-800 ml-3 leading-tight">
          ダッシュボード
        </h1>
      </div>



      {/* 累積読書記録数 */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 mb-8 border border-orange-200">
        <h2 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          累積読書記録数
        </h2>
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-600 mb-2">
            {records.length}
          </div>
          <p className="text-orange-700">件の読書記録</p>
        </div>
      </div>

      {/* 日次推移グラフ（全ユーザーに表示） */}
      {dailyRecords.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
            <span className="mr-2">📈</span>
            読書記録数の日次推移
          </h2>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRecords}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ color: '#374151' }}
                  formatter={(value) => [value, '読書記録数']}
                  labelFormatter={(label) => `${label}日前`}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {/* 「日前」ラベルを右端に追加 */}
            <div className="absolute bottom-6 right-8 text-xs text-gray-500">
              日前
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2 text-center">
            過去14日間（13日前〜今日）の読書記録数を表示しています
          </p>
        </div>
      )}

      {/* テーマ別統計セクション */}
      {isAuthenticated && (
        <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
          <h2 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
            📊 テーマ別読書統計
          </h2>
          
          {/* テーマ選択プルダウン */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              表示するテーマを選択
            </label>
            <select
              value={selectedThemeId || ''}
              onChange={(e) => setSelectedThemeId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">未分類</option>
              {allThemeStats.filter(theme => theme.theme_id !== null && theme.theme_id !== -1).map((theme) => (
                <option key={theme.theme_id} value={theme.theme_id}>
                  {theme.theme_name} ({theme.total_records}記録)
                </option>
              ))}
            </select>
          </div>

          {/* 累積読書記録数 */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 mb-6 border border-orange-200">
            <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              累積読書記録数
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {selectedThemeId === null 
                  ? allThemeStats.find(t => t.theme_id === null)?.total_records || 0
                  : allThemeStats.find(t => t.theme_id === selectedThemeId)?.total_records || 0
                }
              </div>
              <p className="text-orange-700">件の読書記録</p>
            </div>
          </div>

          {/* 日次推移グラフ（折れ線グラフ） */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
            <h3 className="text-lg font-medium text-gray-800 mb-3">📈 過去14日間の推移</h3>
            {dailyTrends.length > 0 ? (
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrends.slice(-14).map(day => ({
                    date: formatDateForChart(day.date),
                    count: parseInt(day.count)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#374151' }}
                      formatter={(value) => [value, '読書記録数']}
                      labelFormatter={(label) => `${label}日前`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                {/* 「日前」ラベルを右端に追加 */}
                <div className="absolute bottom-6 right-8 text-xs text-gray-500">
                  日前
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">データを読み込み中...</p>
              </div>
            )}
            <p className="text-sm text-blue-600 mt-2 text-center">
              過去14日間（13日前〜今日）の読書記録数を表示しています
            </p>
          </div>
        </div>
      )}


    </div>
  );
}

export default Dashboard; 
