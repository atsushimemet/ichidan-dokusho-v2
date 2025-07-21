import { useState } from 'react';
import './App.css';

interface FormData {
  title: string;
  link: string;
  readingAmount: string;
  learning: string;
  action: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    link: '',
    readingAmount: '',
    learning: '',
    action: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      link: '',
      readingAmount: '',
      learning: '',
      action: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: API呼び出しを実装
      console.log('送信データ:', formData);
      
      // 成功時の処理
      alert('投稿が完了しました！');
      resetForm();
    } catch (error) {
      console.error('送信エラー:', error);
      alert('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100">
          <h1 className="text-4xl font-bold text-center text-orange-800 mb-8">
            📖 今日も1段、読んだ？
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. 読んだ本、文章のタイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                1. 読んだ本、文章のタイトル
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="例：『7つの習慣』"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            {/* 2. 読んだ本、文章のリンク */}
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                2. 読んだ本、文章のリンク
              </label>
              <input
                type="url"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="例：https://www.amazon.co.jp/dp/ASIN/ref=nosim?tag=あなたのアソシエイトID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                ※ 書籍の場合はamazonリンク。開発者のアフィリエイトリンクに変換されます。
              </p>
            </div>

            {/* 3. 今日読んだ量 */}
            <div>
              <label htmlFor="readingAmount" className="block text-sm font-medium text-gray-700 mb-2">
                3. 今日読んだ量
              </label>
              <select
                id="readingAmount"
                name="readingAmount"
                value={formData.readingAmount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                required
              >
                <option value="">選択してください</option>
                <option value="1文だけ">1文だけ</option>
                <option value="1段落">1段落</option>
                <option value="1章">1章</option>
                <option value="1冊・全文">1冊・全文</option>
              </select>
            </div>

            {/* 4. 今日の学び or 気づき */}
            <div>
              <label htmlFor="learning" className="block text-sm font-medium text-gray-700 mb-2">
                4. 今日の学び or 気づき
              </label>
              <textarea
                id="learning"
                name="learning"
                value={formData.learning}
                onChange={handleInputChange}
                placeholder="例：「人の話を聴くとは、同意することではない」"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                required
              />
            </div>

            {/* 5. 明日の小さなアクション */}
            <div>
              <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-2">
                5. 明日の小さなアクション
              </label>
              <textarea
                id="action"
                name="action"
                value={formData.action}
                onChange={handleInputChange}
                placeholder="例：「朝会で相手の話をさえぎらずに聞く」"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                required
              />
            </div>

            {/* 送信ボタン */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 focus:ring-4 focus:ring-orange-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>送信中...</span>
                  </>
                ) : (
                  <>
                    <span>✅ 完了</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
