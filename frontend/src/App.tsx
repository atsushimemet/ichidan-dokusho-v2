import { useState } from 'react';
import './App.css';
import './test.css';

interface ReadingRecord {
  title: string;
  link: string;
  readingAmount: string;
  learning: string;
  action: string;
}

function App() {
  const [formData, setFormData] = useState<ReadingRecord>({
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
      console.log('Form submitted:', formData);
      // TODO: API call to backend
      
      // 成功時の処理
      alert('記録が保存されました！');
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* 通常のCSSテスト要素 */}
      <div className="test-red">
        🔴 通常のCSSテスト - この赤い背景が見えればCSSは正常です！
      </div>
      
      {/* Tailwind CSS テスト要素 */}
      <div className="bg-red-500 text-white p-4 text-center">
        🎨 Tailwind CSS テスト - この赤い背景が見えればTailwind CSSは正常です！
      </div>
      
      {/* 追加のTailwind CSS テスト要素 */}
      <div className="bg-blue-500 text-white p-4 text-center m-4">
        🔵 Tailwind CSS 青いテスト要素
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100">
          <h1 className="text-4xl font-bold text-center text-orange-800 mb-8">
            📖 今日も1段、読んだ？
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-orange-700 mb-2">
                読んだ本、文章のタイトル
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="例：『7つの習慣』"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 bg-white/70"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* リンク */}
            <div>
              <label htmlFor="link" className="block text-sm font-semibold text-orange-700 mb-2">
                読んだ本、文章のリンク
              </label>
              <input
                type="url"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://www.amazon.co.jp/dp/..."
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 bg-white/70"
                disabled={isSubmitting}
              />
            </div>

            {/* 読んだ量 */}
            <div>
              <label htmlFor="readingAmount" className="block text-sm font-semibold text-orange-700 mb-2">
                今日読んだ量
              </label>
              <select
                id="readingAmount"
                name="readingAmount"
                value={formData.readingAmount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 bg-white/70"
                required
                disabled={isSubmitting}
              >
                <option value="">選択してください</option>
                <option value="1文だけ">1文だけ</option>
                <option value="1段落">1段落</option>
                <option value="1章">1章</option>
                <option value="1冊・全文">1冊・全文</option>
              </select>
            </div>

            {/* 学び・気づき */}
            <div>
              <label htmlFor="learning" className="block text-sm font-semibold text-orange-700 mb-2">
                今日の学び or 気づき
              </label>
              <textarea
                id="learning"
                name="learning"
                value={formData.learning}
                onChange={handleInputChange}
                placeholder="例：「人の話を聴くとは、同意することではない」"
                rows={3}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 bg-white/70 resize-none"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* 明日のアクション */}
            <div>
              <label htmlFor="action" className="block text-sm font-semibold text-orange-700 mb-2">
                明日の小さなアクション
              </label>
              <textarea
                id="action"
                name="action"
                value={formData.action}
                onChange={handleInputChange}
                placeholder="例：「朝会で相手の話をさえぎらずに聞く」"
                rows={3}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 bg-white/70 resize-none"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-200 transform ${
                isSubmitting 
                  ? 'bg-orange-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:scale-105 active:scale-95'
              } text-white shadow-lg hover:shadow-xl`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  送信中...
                </span>
              ) : (
                '✅ 完了'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
