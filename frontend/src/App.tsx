import { useState } from 'react';
import './App.css';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: API call to backend
    alert('記録が保存されました！');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            📖 今日も1段、読んだ？
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                読んだ本、文章のタイトル
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="例：『7つの習慣』"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* リンク */}
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                読んだ本、文章のリンク
              </label>
              <input
                type="url"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://www.amazon.co.jp/dp/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* 読んだ量 */}
            <div>
              <label htmlFor="readingAmount" className="block text-sm font-medium text-gray-700 mb-2">
                今日読んだ量
              </label>
              <select
                id="readingAmount"
                name="readingAmount"
                value={formData.readingAmount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
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
              <label htmlFor="learning" className="block text-sm font-medium text-gray-700 mb-2">
                今日の学び or 気づき
              </label>
              <textarea
                id="learning"
                name="learning"
                value={formData.learning}
                onChange={handleInputChange}
                placeholder="例：「人の話を聴くとは、同意することではない」"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* 明日のアクション */}
            <div>
              <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-2">
                明日の小さなアクション
              </label>
              <textarea
                id="action"
                name="action"
                value={formData.action}
                onChange={handleInputChange}
                placeholder="例：「朝会で相手の話をさえぎらずに聞く」"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105"
            >
              ✅ 完了
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
