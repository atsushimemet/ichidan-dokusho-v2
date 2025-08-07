import { useState } from 'react';

interface Location {
  id: number;
  name: string;
  type: 'library' | 'bookstore' | 'cafe' | 'other';
  address: string;
  description: string;
  rating?: number;
  distance?: string;
}

function FindLocationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [locations, setLocations] = useState<Location[]>([
    {
      id: 1,
      name: '中央図書館',
      type: 'library',
      address: '東京都渋谷区神宮前1-1-1',
      description: '静かな環境で読書に集中できる図書館です。',
      rating: 4.5,
      distance: '0.5km'
    },
    {
      id: 2,
      name: '紀伊國屋書店 新宿本店',
      type: 'bookstore',
      address: '東京都新宿区新宿3-17-7',
      description: '幅広いジャンルの書籍を取り揃えています。',
      rating: 4.3,
      distance: '1.2km'
    },
    {
      id: 3,
      name: 'スターバックス 原宿店',
      type: 'cafe',
      address: '東京都渋谷区神宮前4-4-1',
      description: 'コーヒーを飲みながら読書できるカフェです。',
      rating: 4.1,
      distance: '0.8km'
    },
    {
      id: 4,
      name: '蔦屋書店 代官山店',
      type: 'bookstore',
      address: '東京都渋谷区猿楽町17-5',
      description: '美しい建築と豊富な書籍で知られる書店です。',
      rating: 4.7,
      distance: '2.1km'
    },
    {
      id: 5,
      name: '国立国会図書館',
      type: 'library',
      address: '東京都千代田区永田町1-10-1',
      description: '日本最大の図書館で、研究や学習に最適です。',
      rating: 4.8,
      distance: '3.5km'
    }
  ]);

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || location.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'library':
        return '📚';
      case 'bookstore':
        return '📖';
      case 'cafe':
        return '☕';
      default:
        return '📍';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'library':
        return '図書館';
      case 'bookstore':
        return '書店';
      case 'cafe':
        return 'カフェ';
      default:
        return 'その他';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">場所を探す</h1>
              <p className="text-gray-600 text-sm">読書に最適な場所を見つけましょう</p>
            </div>
          </div>

          {/* 検索フィルター */}
          <div className="mb-6 space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                場所を検索
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="図書館、書店、カフェなどを検索..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                種類で絞り込み
              </label>
              <select
                id="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="library">図書館</option>
                <option value="bookstore">書店</option>
                <option value="cafe">カフェ</option>
              </select>
            </div>
          </div>

          {/* 検索結果 */}
          <div className="space-y-4">
            {filteredLocations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">場所が見つかりません</h3>
                <p className="text-gray-600">
                  検索条件を変更してお試しください
                </p>
              </div>
            ) : (
              filteredLocations.map((location) => (
                <div key={location.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">{getTypeIcon(location.type)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{location.name}</h3>
                          <span className="text-sm text-gray-500">{getTypeLabel(location.type)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                      <p className="text-sm text-gray-700 mb-3">{location.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {location.rating && (
                            <div className="flex items-center">
                              <span className="text-yellow-500 mr-1">⭐</span>
                              <span className="text-sm text-gray-600">{location.rating}</span>
                            </div>
                          )}
                          {location.distance && (
                            <span className="text-sm text-gray-500">📍 {location.distance}</span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            // Google Mapsで場所を開く
                            const query = encodeURIComponent(`${location.name} ${location.address}`);
                            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          地図で見る
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 説明 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">💡 場所を探すについて</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 読書に最適な図書館、書店、カフェを検索できます</li>
              <li>• 場所名、住所、説明文で検索が可能です</li>
              <li>• 種類別に絞り込み検索ができます</li>
              <li>• 「地図で見る」ボタンでGoogle Mapsで場所を確認できます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindLocationPage; 
