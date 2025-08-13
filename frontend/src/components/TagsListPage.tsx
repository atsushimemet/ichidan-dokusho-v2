import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Tag {
  id: number;
  name: string;
  created_at: string;
}

// ランダムカラーパレット（視認性を考慮した色の組み合わせ）
const colorPalettes = [
  { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', hover: 'hover:bg-red-200' },
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', hover: 'hover:bg-blue-200' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', hover: 'hover:bg-green-200' },
  { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', hover: 'hover:bg-yellow-200' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', hover: 'hover:bg-purple-200' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200', hover: 'hover:bg-pink-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', hover: 'hover:bg-indigo-200' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', hover: 'hover:bg-teal-200' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', hover: 'hover:bg-orange-200' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200', hover: 'hover:bg-cyan-200' },
  { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-200', hover: 'hover:bg-lime-200' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', hover: 'hover:bg-emerald-200' },
  { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200', hover: 'hover:bg-violet-200' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200', hover: 'hover:bg-rose-200' },
  { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200', hover: 'hover:bg-sky-200' },
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

const TagsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(`${API_BASE_URL}/api/tags`);
        if (!response.ok) {
          throw new Error('タグの取得に失敗しました');
        }
        const data = await response.json();
        setTags(data);

      } catch (err) {
        console.error('Error fetching tags:', err);
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [API_BASE_URL]);

  const handleTagClick = (tagName: string) => {
    // タグ名をそのままURLエンコードして使用
    navigate(`/${encodeURIComponent(tagName)}`);
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
      {/* ヘッダー - 固定位置 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-orange-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-orange-600 hover:text-orange-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              戻る
            </button>
            
            <div className="flex items-center">
              <span className="text-2xl mr-3">🏷️</span>
              <div>
                <h1 className="text-xl font-bold text-gray-800">タグ一覧</h1>
                <p className="text-sm text-gray-600">{tags.length}個のタグ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-6">
        {tags.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🏷️</div>
            <p className="text-gray-600 text-xl">まだタグが登録されていません</p>
            <p className="text-gray-500 text-sm mt-2">書籍を登録するとタグが表示されます</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            {tags.map((tag) => {
              const colors = getRandomColor(tag.name);
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.name)}
                  className={`
                    inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                    border-2 transition-all duration-200 transform hover:scale-105
                    ${colors.bg} ${colors.text} ${colors.border} ${colors.hover}
                    hover:shadow-lg active:scale-95
                    min-w-[80px] max-w-[200px] truncate
                  `}
                  title={tag.name}
                >
                  <span className="mr-2">🏷️</span>
                  <span className="truncate">{tag.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* フッター情報 */}
      <div className="text-center py-8 text-gray-500 text-sm">
        <p>気になるタグをクリックして、関連する書籍を探してみましょう</p>
      </div>
    </div>
  );
};

export default TagsListPage;