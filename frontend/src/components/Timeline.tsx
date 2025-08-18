import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Timeline() {
  const navigate = useNavigate();

  useEffect(() => {
    // タイムライン機能はプライバシー保護のため停止されました
    // マイページにリダイレクトします
    const timer = setTimeout(() => {
      navigate('/mypage', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-4">
          <span className="text-4xl">🔒</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          タイムライン機能について
        </h1>
        <p className="text-gray-600 mb-6">
          プライバシー保護のため、タイムライン機能は停止いたしました。<br />
          あなたの読書記録は「マイページ」でご確認いただけます。
        </p>
        <p className="text-sm text-gray-500 mb-4">
          3秒後にマイページへ自動で移動します...
        </p>
        <button
          onClick={() => navigate('/mypage', { replace: true })}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          マイページへ移動
        </button>
      </div>
    </div>
  );
}

export default Timeline;