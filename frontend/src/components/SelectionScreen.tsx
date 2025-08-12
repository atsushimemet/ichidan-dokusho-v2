import React from 'react';
import { useNavigate } from 'react-router-dom';
import BookIcon from './BookIcon';
import { isWebView, handleExternalBrowserOpen } from '../utils/webview';

const SelectionScreen: React.FC = () => {
  const navigate = useNavigate();

  // タイムライン機能除却: 「見るだけ」導線を廃止
  // プライバシー保護のため、認証なしアクセスを完全停止

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

        {/* WebView検知時の注意メッセージ */}
        {isWebView() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <div>
                <p className="text-sm text-yellow-800 font-medium mb-1">
                  アプリ内ブラウザで開いています
                </p>
                <p className="text-xs text-yellow-700">
                  ログイン機能を正常に利用するには外部ブラウザをご利用ください
                </p>
                <button
                  onClick={handleExternalBrowserOpen}
                  className="text-xs text-yellow-800 underline hover:text-yellow-900 mt-2"
                >
                  → 外部ブラウザで開く
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WebView環境では「はじめる」ボタンを非表示 */}
        {!isWebView() && (
          <div className="space-y-4">
            {/* タイムライン機能除却: 「見るだけ」ボタンを削除 */}
            {/* プライバシー保護のため、認証不要アクセスを完全停止 */}
            
            <button
              onClick={handleUse}
              className="w-full bg-orange-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors"
            >
              ✍️ はじめる
            </button>
          </div>
        )}

        {/* WebView環境では説明文も非表示 */}
        {!isWebView() && (
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>「はじめる」: Google認証でログインして、あなただけの読書記録を作成</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectionScreen; 
