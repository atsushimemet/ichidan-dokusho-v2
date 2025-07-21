import { useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import InputForm from './components/InputForm';
import MyPage from './components/MyPage';
import Timeline from './components/Timeline';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Router>
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
            <div className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-orange-100 min-w-48">
              <div className="py-2">
                <Link
                  to="/"
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
                <Link
                  to="/timeline"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  🌟 タイムライン
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* メインコンテンツ */}
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Routes>
            <Route path="/" element={<InputForm />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/timeline" element={<Timeline />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
