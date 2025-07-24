import { useState } from 'react';
import { trackError, trackPostCreation } from '../utils/analytics';
import BookIcon from './BookIcon';

interface FormData {
  title: string;
  readingAmount: string;
  learning: string;
  action: string;
  notes: string;
  isNotBook: boolean;
  customLink: string;
}

function InputForm() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    readingAmount: '',
    learning: '',
    action: '',
    notes: '',
    isNotBook: false,
    customLink: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingAmazon, setIsSearchingAmazon] = useState(false);
  const [amazonLinkFound, setAmazonLinkFound] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // タイトルからAmazonリンクを検索する関数
  const searchAmazonByTitle = async (title: string) => {
    if (!title || title.length < 3) {
      return;
    }

    setIsSearchingAmazon(true);
    setAmazonLinkFound(false);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/search-amazon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAmazonLinkFound(true);
        }
      }
    } catch (error) {
      console.error('Amazon検索エラー:', error);
    } finally {
      setIsSearchingAmazon(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // タイトルが入力された場合、Amazonリンクを自動検索（書籍の場合のみ）
    if (name === 'title' && value && value.length >= 3 && !formData.isNotBook) {
      // デバウンス処理（2秒後に実行）
      setTimeout(() => {
        if (formData.title === value) {
          searchAmazonByTitle(value);
        }
      }, 2000);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      readingAmount: '',
      learning: '',
      action: '',
      notes: '',
      isNotBook: false,
      customLink: ''
    });
    setAmazonLinkFound(false);
    setIsAccordionOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // X (Twitter) イベントピクセル - 入力画面の押下（ボタンクリック時）
    if (typeof window !== 'undefined' && (window as any).twq) {
      (window as any).twq('event', 'tw-pyzg5-pyzg5');
    }

    try {
      // 環境変数からAPI URLを取得
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      
      // バックエンドAPIを呼び出し
      const response = await fetch(`${API_BASE_URL}/api/reading-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          reading_amount: formData.readingAmount,
          learning: formData.learning,
          action: formData.action,
          notes: formData.notes,
          isNotBook: formData.isNotBook,
          customLink: formData.customLink
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('送信成功:', result);
      
      // Google Analytics 投稿作成追跡
      trackPostCreation(formData.readingAmount);
      
      // X (Twitter) イベントピクセル - 入力画面の押下
      if (typeof window !== 'undefined' && (window as any).twq) {
        (window as any).twq('event', 'tw-pyzg5-pyzg5');
      }
      
      // 成功時の処理
      alert('投稿が完了しました！');
      resetForm();
    } catch (error) {
      console.error('送信エラー:', error);
      trackError('post_creation_failed', error instanceof Error ? error.message : 'Unknown error');
      alert('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100">
      <div className="flex items-center justify-center mb-4">
        <BookIcon size={48} />
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-orange-800 ml-3 leading-tight">
          今日も1ページ読んだ？
        </h1>
      </div>
      <p className="text-center text-gray-600 mb-8 text-xs sm:text-sm">
        完璧じゃなくていい。<br />
        1ページの前進が、思考と行動を変えていく。
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. 読んだ本、文章のタイトル */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            1. 読んだ本、文章のタイトル
            <span className="text-xs text-gray-500 ml-2">
              （書籍タイトルを入力するとAmazonリンクが自動で取得されます）
            </span>
          </label>
          {!formData.isNotBook && (
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">
                    正確な書籍タイトルを入力してください
                  </span>
                </div>
                <svg
                  className={`h-5 w-5 text-blue-400 transition-transform ${isAccordionOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {isAccordionOpen && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-700 space-y-2">
                    <p>• 正確な書籍タイトルを入力してください（例：「7つの習慣」「星の王子さま」）</p>
                    <p>• 曖昧なタイトルや存在しないタイトルを入力すると、異なる書籍が検索される可能性があります</p>
                    <p>• 書籍が見つからない場合は、タイトルを確認して再度お試しください</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="relative">
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
            {isSearchingAmazon && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>
          {amazonLinkFound && !formData.isNotBook && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Amazonリンクが自動取得されました
            </p>
          )}
        </div>

        {/* 書籍以外の場合はAmazon検索をスキップ */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isNotBook: !prev.isNotBook }))}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                formData.isNotBook
                  ? 'bg-orange-100 border-orange-300 text-orange-700'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {formData.isNotBook ? '✓ 書籍じゃありません' : '📚 書籍じゃありません'}
            </button>
            <span className="text-xs text-gray-500">
              （記事、ブログ、YouTubeなど書籍以外の場合はチェックしてください）
            </span>
          </div>
          {formData.isNotBook && (
            <div className="mt-3">
              <p className="text-xs text-orange-600 mb-2">
                ✓ Amazonリンクの自動取得をスキップします
              </p>
              <div>
                <label htmlFor="customLink" className="block text-sm font-medium text-gray-700 mb-2">
                  リンクを直接入力（任意）
                </label>
                <textarea
                  id="customLink"
                  name="customLink"
                  value={formData.customLink}
                  onChange={handleInputChange}
                  placeholder="https://example.com/article や https://youtube.com/watch?v=... など、関連するリンクがあれば入力してください"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  記事やブログのURL、YouTube動画、参考資料のリンクなどを入力できます
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. 今日読んだ量 */}
        <div>
          <label htmlFor="readingAmount" className="block text-sm font-medium text-gray-700 mb-2">
            2. 今日読んだ量
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

        {/* 3. 今日の学び or 気づき */}
        <div>
          <label htmlFor="learning" className="block text-sm font-medium text-gray-700 mb-2">
            3. 今日の学び or 気づき
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

        {/* 4. 明日の小さなアクション */}
        <div>
          <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-2">
            4. 明日の小さなアクション
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

        {/* 5. 備考（マイページでのみ表示） */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            5. 備考 <span className="text-xs text-gray-500">（マイページでのみ表示）</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="どこで読んだのか、何ページ目か、どんなきっかけで読んだのか、教えてくれた人は誰かなど"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            この情報はあなたのマイページでのみ表示され、他のユーザーには公開されません
          </p>
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
  );
}

export default InputForm; 
