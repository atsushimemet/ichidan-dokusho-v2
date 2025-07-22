import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-orange-800">📖 1段読書</h1>
            <button
              onClick={handleGetStarted}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              始める
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* ヒーローセクション */}
        <section className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-orange-800 mb-6 leading-tight">
            完璧じゃなくていい。<br />
            1ページの前進が、<br />
            思考と行動を変えていく。
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            「1段読書」は、忙しい人でも「読んだ」「考えた」「次に活かす」を毎日たった5分で完結できる、超ミニマム設計の読書習慣アプリ。
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors shadow-lg"
          >
            🚀 今すぐ始める
          </button>
        </section>

        {/* 価値提案セクション */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">🌱 あなたの悩みを解決します</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-100">
              <h4 className="text-xl font-semibold text-orange-800 mb-3">📚 読書を続けられない</h4>
              <p className="text-gray-600">「1章 or 1段落だけ」を推奨。続ける心理的ハードルを下げます。</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-100">
              <h4 className="text-xl font-semibold text-orange-800 mb-3">💭 読んでも内容が残らない</h4>
              <p className="text-gray-600">学びを一言で記録 → 行動につなげるアウトプット構造。</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-100">
              <h4 className="text-xl font-semibold text-orange-800 mb-3">⏰ 忙しくて時間がない</h4>
              <p className="text-gray-600">入力3ステップ・5分以内で完了。</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-100">
              <h4 className="text-xl font-semibold text-orange-800 mb-3">🎯 インプットばかりで行動が伴わない</h4>
              <p className="text-gray-600">「明日やる1つのアクション」を書くことを必須に。</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-100">
              <h4 className="text-xl font-semibold text-orange-800 mb-3">👥 誰かに褒められたい、だけど匿名性は維持したい</h4>
              <p className="text-gray-600">いいね機能と匿名性機能（ユーザーはランダムな識別子の名前しか持てない）。</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-100">
              <h4 className="text-xl font-semibold text-orange-800 mb-3">📖 本以外の感想も書きたい</h4>
              <p className="text-gray-600">読んだ本・文章はリンクで登録。書籍ならamazonリンク、文章ならWebリンク。</p>
            </div>
          </div>
        </section>

        {/* 使い方セクション */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">✍️ 使い方</h3>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-orange-100">
            <h4 className="text-2xl font-semibold text-orange-800 mb-6 text-center">📖 今日も1段、読んだ？</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</span>
                <div>
                  <h5 className="font-semibold text-gray-800">読んだ本、文章のタイトル</h5>
                  <p className="text-gray-600 text-sm">例：『7つの習慣』</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</span>
                <div>
                  <h5 className="font-semibold text-gray-800">読んだ本、文章のリンク</h5>
                  <p className="text-gray-600 text-sm">※ 書籍の場合はamazonリンク。開発者のアフィリエイトリンクに変換されます。</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">3</span>
                <div>
                  <h5 className="font-semibold text-gray-800">今日読んだ量</h5>
                  <div className="text-gray-600 text-sm space-y-1 mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>1文だけ</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>1段落</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>1章</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>1冊・全文</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">4</span>
                <div>
                  <h5 className="font-semibold text-gray-800">今日の学び or 気づき</h5>
                  <p className="text-gray-600 text-sm">例：「人の話を聴くとは、同意することではない」</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">5</span>
                <div>
                  <h5 className="font-semibold text-gray-800">明日の小さなアクション</h5>
                  <p className="text-gray-600 text-sm">例：「朝会で相手の話をさえぎらずに聞く」</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 機能紹介セクション */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">🌟 主な機能</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-100 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h4 className="text-xl font-semibold text-orange-800 mb-3">マイページ</h4>
              <p className="text-gray-600">過去記録した感想が登録日降順で縦に並ぶ。縦スクロールで振り返ることができる。</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-100 text-center">
              <div className="text-4xl mb-4">👥</div>
              <h4 className="text-xl font-semibold text-orange-800 mb-3">タイムライン</h4>
              <p className="text-gray-600">全ユーザーの読書記録を閲覧。みんなの学びを共有できる。</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-100 text-center">
              <div className="text-4xl mb-4">👍</div>
              <h4 className="text-xl font-semibold text-orange-800 mb-3">いいね機能</h4>
              <p className="text-gray-600">匿名性を保ちながら、他の人の投稿にいいねできる。</p>
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-orange-100">
            <h3 className="text-3xl font-bold text-orange-800 mb-4">今日から始めませんか？</h3>
            <p className="text-gray-600 mb-6">たった5分で、あなたの読書習慣が変わります。</p>
            <button
              onClick={handleGetStarted}
              className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors shadow-lg"
            >
              🚀 無料で始める
            </button>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-orange-100 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">© 2024 1段読書. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 
