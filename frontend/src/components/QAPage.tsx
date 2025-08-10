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
        {/* 私たちについて */}
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
            <span className="mr-2">📖</span>
            私たちについて
          </h2>
          <p className="text-gray-700 mb-4">
            一段読書について詳しく知りたい方は、以下のリンクから詳細をご確認ください。
          </p>
          <div className="text-center">
            <a
              href="/landing_page"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-600 focus:ring-4 focus:ring-purple-300 transition-all duration-200"
            >
              <span className="mr-2">📖</span>
              私たちについて詳しく見る
            </a>
          </div>
        </div>

        {/* 各アイコンの使い方 */}
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
            <span className="mr-2">🔍</span>
            各アイコンの使い方
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </span>
              <span><b>投稿を編集</b>：記録内容を編集できます。押下すると編集フォームが開きます。</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </span>
              <span><b>投稿を削除</b>：記録を削除します。押下後、確認ダイアログが表示されます。</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </span>
              <span><b>Google TODOに追加</b>：アクション内容をGoogle Todoに追加できます。押下するとGoogle Todoが開き、内容を貼り付けて登録できます。</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </span>
              <span><b>Xでシェア / noteのネタに</b>：学び・アクション内容をSNSでシェアできます。学びとアクションの合計が500文字以内ならX（旧Twitter）、超過時はnoteのネタとして利用できます。500文字以内なら青色、超過時は緑色で表示されます。</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span><b>機能の使い方</b>：このボタンを押すと、QAページへのリンク付きツールチップが表示されます。</span>
            </li>
          </ul>
        </div>
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

        {/* 意見の匿名送信 */}
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
            <span className="mr-2">💭</span>
            意見の匿名送信
          </h2>
          <p className="text-gray-700 mb-4">
            匿名でご意見やご提案をお送りいただけます。お気軽にご利用ください。
          </p>
          <div className="text-center">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdPDR8vn1mH0tI9PdU3tyfZcrjEJer-gdTOYx2QKdCzK5Aouw/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-600 focus:ring-4 focus:ring-purple-300 transition-all duration-200"
            >
              <span className="mr-2">💭</span>
              匿名で意見を送信
            </a>
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
    <div className="pb-20"></div>
  );
}

export default QAPage; 
