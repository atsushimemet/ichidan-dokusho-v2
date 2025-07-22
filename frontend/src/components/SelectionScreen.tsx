import React from 'react';
import { useNavigate } from 'react-router-dom';
import BookIcon from './BookIcon';

const SelectionScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleViewOnly = () => {
    navigate('/timeline');
  };

  const handleUse = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-start sm:items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100 max-w-md w-full mt-8 sm:mt-0">
        <div className="flex items-center justify-center mb-6">
          <BookIcon size={48} />
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-orange-800 ml-3">
            1段読書へようこそ
          </h1>
        </div>
        
        <p className="text-center text-gray-600 mb-8 text-sm">
          完璧じゃなくていい。<br />
          1ページの前進が、思考と行動を変えていく。
        </p>

        <div className="space-y-4">
          <button
            onClick={handleViewOnly}
            className="w-full bg-gray-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-600 transition-colors"
          >
            👀 見るだけ
          </button>
          
          <button
            onClick={handleUse}
            className="w-full bg-orange-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors"
          >
            ✍️ 使う
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>「見るだけ」: みんなの読書記録を閲覧</p>
          <p>「使う」: Google認証でログインして投稿</p>
        </div>
      </div>
    </div>
  );
};

export default SelectionScreen; 
