import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import AuthScreen from './components/AuthScreen';
import InputForm from './components/InputForm';
import MyPage from './components/MyPage';
import ProtectedRoute from './components/ProtectedRoute';
import SelectionScreen from './components/SelectionScreen';
import Timeline from './components/Timeline';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* ハンバーガーメニュー */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleMenu}
          className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg hover:bg-white transition-colors"
          aria-label="メニュー"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
            <span className={`block w-5 h-0.5 bg-orange-600 transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-orange-600 transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-orange-600 transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </div>
        </button>
        
        {/* ドロップダウンメニュー */}
        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-orange-100 min-w-64 max-w-80">
            <div className="py-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
              >
                🏠 ホーム
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/input"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                  >
                    📖 入力画面
                  </Link>
                  <Link
                    to="/mypage"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                  >
                    📚 マイページ
                  </Link>
                </>
              )}
              <Link
                to="/timeline"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
              >
                🌟 タイムライン
              </Link>
              
              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  🚪 ログアウト
                </button>
              )}
              
              {/* 区切り線 */}
              <div className="border-t border-orange-100 my-2"></div>
              
              {/* Q&A セクション */}
              <div className="px-4 py-3">
                <h3 className="font-semibold text-gray-800 mb-3">❓ Q&A</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">読んだ量の色について</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0"></div>
                        <span className="text-gray-600">1文だけ</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
                        <span className="text-gray-600">1段落</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500 flex-shrink-0"></div>
                        <span className="text-gray-600">1章</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-purple-500 flex-shrink-0"></div>
                        <span className="text-gray-600">1冊・全文</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 pt-0 pb-8 max-w-2xl">
        <Routes>
          <Route path="/" element={<SelectionScreen />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route 
            path="/input" 
            element={
              <ProtectedRoute>
                <InputForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mypage" 
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/timeline" element={<Timeline />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
