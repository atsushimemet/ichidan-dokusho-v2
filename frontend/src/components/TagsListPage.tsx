import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Tag {
  id: number;
  name: string;
  created_at: string;
}

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
              <h1 className="text-2xl font-bold text-gray-800">タグ一覧</h1>
            </div>
            <p className="text-gray-600">
              {tags.length}個のタグが登録されています
            </p>
          </div>
        </div>

        {/* タグ一覧 */}
        {tags.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏷️</div>
            <p className="text-gray-600 text-lg">まだタグが登録されていません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag) => (
              <div
                key={tag.id}
                onClick={() => handleTagClick(tag.name)}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100 hover:shadow-xl hover:bg-white/90 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white text-lg shadow-md group-hover:shadow-lg transition-shadow">
                      🏷️
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-700 transition-colors">
                        {tag.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        /{encodeURIComponent(tag.name)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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

export default TagsListPage;