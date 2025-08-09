import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import DraftOutputPage from './components/DraftOutputPage';
import InputForm from './components/InputForm';
import LandingPage from './components/LandingPage';
import MyPage from './components/MyPage';
import QAPage from './components/QAPage';
import ReadingPage from './components/ReadingPage';
import SelectionScreen from './components/SelectionScreen';
import SettingsPage from './components/SettingsPage';
import Timeline from './components/Timeline';
import BottomNavigationBar from './components/BottomNavigationBar';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Google Analytics の型定義
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Google Analytics ページビュー追跡コンポーネント
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Google Analytics ページビューを送信
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-NEMWYXHV2P', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    // ログアウト後はホームページ（SelectionScreen）にリダイレクト
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Google Analytics ページビュー追跡 */}
      <PageTracker />
      
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
              {!isAuthenticated && (
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  🏠 ホーム
                </Link>
              )}

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                  >
                    📊 ダッシュボード
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
                <Link
                  to="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  ⚙️ 設定
                </Link>
              )}
              
              <Link
                to="/qa"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
              >
                ❓ Q&A
              </Link>
              
              <div className="border-t border-orange-100 mt-2 pt-2">
                <a
                  href="https://ichidan-dokusho-place-frontend.onrender.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  📍 場所を探す
                </a>
              </div>
              
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  🚪 ログアウト
                </button>
              )}
              


            </div>
          </div>
        )}
      </div>

      {/* メインコンテンツ */}
      <Routes>
        <Route path="/landing_page" element={<LandingPage />} />
        <Route path="/" element={
          <div className="container mx-auto px-1 sm:px-4 pt-0 pb-2 sm:pb-8 max-w-2xl w-full overflow-x-hidden mb-20 md:mb-2">
            {isAuthenticated ? <Timeline /> : <SelectionScreen />}
          </div>
        } />
        <Route path="/auth" element={
          <div className="container mx-auto px-1 sm:px-4 pt-0 pb-2 sm:pb-8 max-w-2xl w-full overflow-x-hidden mb-20 md:mb-2">
            <AuthScreen />
          </div>
        } />
        <Route 
          path="/reading" 
          element={
            <div className="container mx-auto px-0 sm:px-4 pt-0 pb-0 sm:pb-8 max-w-2xl w-full overflow-x-hidden mb-20 md:mb-0">
              <ReadingPage />
            </div>
          }
        />
        <Route 
          path="/input" 
          element={
            <div className="container mx-auto px-0 sm:px-4 pt-0 pb-0 sm:pb-8 max-w-2xl w-full overflow-x-hidden mb-20 md:mb-0">
              <InputForm />
            </div>
          } 
        />
        <Route 
          path="/draft-output" 
          element={
            <div className="container mx-auto px-1 sm:px-4 pt-0 pb-2 sm:pb-8 max-w-2xl w-full overflow-x-hidden mb-20 md:mb-2">
              <DraftOutputPage />
            </div>
          } 
        />
        <Route 
          path="/mypage" 
          element={
            <div className="container mx-auto px-1 sm:px-4 pt-0 pb-2 sm:pb-8 max-w-2xl w-full overflow-x-hidden mb-20 md:mb-2">
              <MyPage />
            </div>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <div className="container mx-auto px-1 sm:px-4 pt-0 pb-2 sm:pb-8 max-w-2xl w-full overflow-x-hidden mb-20 md:mb-2">
              <Dashboard />
            </div>
          } 
        />
        <Route path="/timeline" element={
          <div className="container mx-auto px-1 sm:px-4 pt-0 pb-2 sm:pb-8 max-w-2xl w-full overflow-x-hidden mb-20 md:mb-2">
            <Timeline />
          </div>
        } />
        <Route path="/qa" element={
          <div className="container mx-auto px-1 sm:px-4 pt-0 pb-2 sm:pb-8 max-w-2xl w-full overflow-x-hidden mb-20 md:mb-2">
            <QAPage />
          </div>
        } />
        <Route path="/settings" element={
          <div className="container mx-auto px-1 sm:px-4 pt-0 pb-2 sm:pb-8 max-w-2xl w-full overflow-x-hidden mb-20 md:mb-2">
            <SettingsPage />
          </div>
        } />

      </Routes>
      
      {/* Bottom Navigation Bar */}
      <BottomNavigationBar />
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
