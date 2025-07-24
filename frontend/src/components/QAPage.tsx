import BookIcon from './BookIcon';

function QAPage() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100">
      <div className="flex items-center justify-center mb-8">
        <BookIcon size={48} />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-orange-800 ml-3 leading-tight">
          Q&A
        </h1>
      </div>
      
      <div className="space-y-8">
        {/* 読んだ量の色について */}
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <h2 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
            <span className="mr-2">🎨</span>
            読んだ量の色について
          </h2>
          <p className="text-gray-700 mb-4">
            タイムラインでは、読んだ量に応じて色分けされたマーカーが表示されます。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-orange-100">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex-shrink-0"></div>
              <div>
                <span className="font-medium text-gray-800">1文だけ</span>
                <p className="text-sm text-gray-600">短い文章を読んだ場合</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-orange-100">
              <div className="w-6 h-6 rounded-full bg-green-500 flex-shrink-0"></div>
              <div>
                <span className="font-medium text-gray-800">1段落</span>
                <p className="text-sm text-gray-600">段落単位で読んだ場合</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-orange-100">
              <div className="w-6 h-6 rounded-full bg-orange-500 flex-shrink-0"></div>
              <div>
                <span className="font-medium text-gray-800">1章</span>
                <p className="text-sm text-gray-600">章単位で読んだ場合</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-orange-100">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex-shrink-0"></div>
              <div>
                <span className="font-medium text-gray-800">1冊・全文</span>
                <p className="text-sm text-gray-600">本全体を読んだ場合</p>
              </div>
            </div>
          </div>
        </div>

        {/* よくある質問 */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
            <span className="mr-2">❓</span>
            よくある質問
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-gray-800 mb-2">Q: 読書記録は誰でも見えますか？</h3>
              <p className="text-gray-600">A: タイムラインでは全てのユーザーの読書記録が表示されますが、備考欄はマイページでのみ表示されるプライベート情報です。</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-gray-800 mb-2">Q: 書籍以外の記事も記録できますか？</h3>
              <p className="text-gray-600">A: はい、書籍以外の記事やブログ、論文なども記録できます。入力画面で「書籍以外」を選択してください。</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-gray-800 mb-2">Q: 記録を削除できますか？</h3>
              <p className="text-gray-600">A: 現在、記録の削除機能は提供していません。記録は永続的に保存されます。</p>
            </div>
          </div>
        </div>

        {/* Googleフォーム */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            <span className="mr-2">📝</span>
            お問い合わせ・フィードバック
          </h2>
          <p className="text-gray-700 mb-4">
            ご質問やご意見、改善提案などがございましたら、以下のフォームからお気軽にお送りください。
          </p>
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <iframe
              src="https://forms.gle/KiRMCHHv6PYFEJZS6"
              width="100%"
              height="600"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              title="お問い合わせフォーム"
              className="rounded-lg"
            >
              お問い合わせフォームを読み込んでいます...
            </iframe>
          </div>
        </div>

        {/* 戻るボタン */}
        <div className="text-center pt-4">
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 focus:ring-4 focus:ring-orange-300 transition-all duration-200"
          >
            ← 戻る
          </button>
        </div>
      </div>
    </div>
  );
}

export default QAPage; 
