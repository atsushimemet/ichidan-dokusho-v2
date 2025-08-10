import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { trackError, trackPostCreation } from '../utils/analytics';
import BookIcon from './BookIcon';

interface FormData {
  title: string;
  readingAmount: string;
  learning: string;
  action?: string;
  notes: string;
  isNotBook: boolean;
  customLink: string;
  themeId: number | null;
}

function InputForm() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    readingAmount: '',
    learning: '',
    action: '',
    notes: '',
    isNotBook: false,
    customLink: '',
    themeId: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingAmazon, setIsSearchingAmazon] = useState(false);
  const [amazonLinkFound, setAmazonLinkFound] = useState(false);
  const [, setTitleExtractionSuccess] = useState(false);
  
  // テーマ選択用のstate
  const [userThemes, setUserThemes] = useState<Array<{
    id: number;
    theme_name: string;
  }>>([]);
  
  // Amazon検索機能は無効化（503エラー対応）
  // const [amazonSearchResults, setAmazonSearchResults] = useState<Array<{
  //   title: string;
  //   link: string;
  // }>>([]);
  // const [showAmazonSuggestions, setShowAmazonSuggestions] = useState(false);
  // const [isSearchingAmazonBooks, setIsSearchingAmazonBooks] = useState(false);
  
  // 過去読んだもの検索用の状態
  const [isPastBooksAccordionOpen, setIsPastBooksAccordionOpen] = useState(false);
  const [pastBooksSearchTerm, setPastBooksSearchTerm] = useState('');
  const [pastBooksSearchResults, setPastBooksSearchResults] = useState<Array<{
    title: string;
    link?: string;
    is_not_book?: boolean;
    custom_link?: string;
  }>>([]);
  const [isSearchingPastBooks, setIsSearchingPastBooks] = useState(false);
  
  // 読みたい・見たいものリスト関連のstate
  const [isWishlistAccordionOpen, setIsWishlistAccordionOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Array<{
    id: number;
    title: string;
    link: string;
    is_not_book: boolean;
  }>>([]);
  
  // デバウンス用のref
  const titleDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const linkDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const pastBooksSearchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const amazonSearchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // 初期状態設定
  useEffect(() => {
    // 初期状態では書籍ではない場合は常に有効
    if (formData.isNotBook) {
      setTitleExtractionSuccess(true);
    } else {
      // 書籍の場合は空の場合は無効
      setTitleExtractionSuccess(formData.title === '' ? false : isValidBookTitle(formData.title));
    }
  }, [formData.isNotBook, formData.title]);

  // ユーザーのテーマ一覧を取得
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUserThemes();
    }
  }, [isAuthenticated, token]);

  // 読みたい・見たいものリストを取得
  useEffect(() => {
    if (isAuthenticated && token) {
      loadWishlistItems();
    }
  }, [isAuthenticated, token]);

  // クリーンアップ処理
  useEffect(() => {
    return () => {
      if (titleDebounceRef.current) {
        clearTimeout(titleDebounceRef.current);
      }
      if (linkDebounceRef.current) {
        clearTimeout(linkDebounceRef.current);
      }
      if (pastBooksSearchDebounceRef.current) {
        clearTimeout(pastBooksSearchDebounceRef.current);
      }
      if (amazonSearchDebounceRef.current) {
        clearTimeout(amazonSearchDebounceRef.current);
      }
    };
  }, []);

  // Amazonリンクかどうかをチェックする関数
  const isAmazonLink = (url: string): boolean => {
    return url.includes('amazon.co.jp') || 
           url.includes('amazon.com') || 
           url.includes('amzn.to') ||
           url.includes('amzn.asia');
  };

  // 書籍タイトルが適切に抽出されているかチェック
  const isValidBookTitle = (title: string): boolean => {
    if (!formData.isNotBook && title) {
      // タイトルがAmazonリンクのままの場合は無効
      return !isAmazonLink(title);
    }
    return true; // 書籍ではない場合は常に有効
  };

  // AmazonリンクからタイトルとASINを取得する関数
  const extractTitleFromAmazonLink = async (amazonUrl: string) => {
    console.log('🔍 extractTitleFromAmazonLink called with:', amazonUrl);
    
    if (!amazonUrl) {
      console.log('❌ No amazonUrl provided');
      return;
    }

    // Amazonリンクかどうかチェック
    const isAmazon = isAmazonLink(amazonUrl);
    
    console.log('🔗 Is Amazon link:', isAmazon, 'for URL:', amazonUrl);
    
    if (!isAmazon) {
      console.log('❌ Not an Amazon link, skipping');
      return;
    }

    setIsSearchingAmazon(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      console.log('🌐 API_BASE_URL:', API_BASE_URL);
      console.log('📡 Making request to:', `${API_BASE_URL}/api/extract-amazon-info`);
      
      const response = await fetch(`${API_BASE_URL}/api/extract-amazon-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amazonUrl }),
      });

      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('📋 API Response:', result);
        
        if (result.success && result.data.title) {
          console.log('✅ Title extracted:', result.data.title);
          // タイトルが空または異なる場合のみ更新
          if (!formData.title || formData.title !== result.data.title) {
            console.log('🔄 Updating title from:', formData.title, 'to:', result.data.title);
            setFormData(prev => ({
              ...prev,
              title: result.data.title
            }));
          } else {
            console.log('⏭️ Title already matches, skipping update');
          }
          setAmazonLinkFound(true);
          setTitleExtractionSuccess(true);
        } else {
          console.log('❌ API call unsuccessful or no title found:', result);
          setTitleExtractionSuccess(false);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API response not ok:', response.status, errorText);
        setTitleExtractionSuccess(false);
      }
    } catch (error) {
      console.error('❌ Amazonタイトル取得エラー:', error);
      setTitleExtractionSuccess(false);
    } finally {
      setIsSearchingAmazon(false);
    }
  };

  // Amazon検索機能は無効化（503エラー対応）
  // const searchAmazonBooks = async (searchTerm: string) => {
  //   // Amazon側のボット検出により503エラーが発生するため無効化
  // };

  // 過去読んだものを検索する関数
  const searchPastBooks = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setPastBooksSearchResults([]);
      return;
    }

    setIsSearchingPastBooks(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/reading-records/search/title?q=${encodeURIComponent(searchTerm)}&limit=10`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('過去読んだもの検索結果:', result.data);
        setPastBooksSearchResults(result.data || []);
      } else {
        console.error('過去読んだもの検索エラー:', response.status);
        setPastBooksSearchResults([]);
      }
    } catch (error) {
      console.error('過去読んだもの検索エラー:', error);
      setPastBooksSearchResults([]);
    } finally {
      setIsSearchingPastBooks(false);
    }
  };

  // Amazon検索機能は無効化（503エラー対応）
  // const selectAmazonBook = (book: { title: string; link: string }) => {
  //   // Amazon側のボット検出により503エラーが発生するため無効化
  // };

  // 過去読んだものを選択する関数
  const selectPastBook = (book: { title: string; link?: string; is_not_book?: boolean; custom_link?: string }) => {
    setFormData(prev => ({
      ...prev,
      title: book.title,
      isNotBook: book.is_not_book || false,
      customLink: book.custom_link || ''
    }));
    
    // 検索結果をクリア
    setPastBooksSearchResults([]);
    setPastBooksSearchTerm('');
  };

  // 読みたい・見たいものリストを読み込む
  const loadWishlistItems = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const items = await response.json();
        setWishlistItems(items);
      }
    } catch (error) {
      console.error('読みたいものリストの取得に失敗しました:', error);
    }
  };

  // 読みたいものリストから選択
  const selectWishlistItem = (item: { id: number; title: string; link: string; is_not_book: boolean }) => {
    setFormData(prev => ({
      ...prev,
      title: item.title,
      isNotBook: item.is_not_book,
      customLink: item.link || ''
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // タイトルフィールドが変更された場合
    if (name === 'title') {
      console.log('📝 Title field changed:', value, 'isNotBook:', formData.isNotBook);
      
      // 状態をリセット
      setTitleExtractionSuccess(false);
      setAmazonLinkFound(false);
      // setShowAmazonSuggestions(false); // Amazon検索機能無効化
      
      // 既存のタイマーをクリア
      if (titleDebounceRef.current) {
        clearTimeout(titleDebounceRef.current);
        console.log('⏰ Cleared existing title timer');
      }
      if (amazonSearchDebounceRef.current) {
        clearTimeout(amazonSearchDebounceRef.current);
        console.log('⏰ Cleared existing amazon search timer');
      }
      
      if (value) {
        // 書籍・not書籍問わず、タイトル入力として有効とする
        setTitleExtractionSuccess(true);
        
        // Amazonリンクが入力された場合のみタイトル抽出を試行
        if (!formData.isNotBook && isAmazonLink(value)) {
          titleDebounceRef.current = setTimeout(() => {
            console.log('⏰ Timer triggered, calling extractTitleFromAmazonLink');
            extractTitleFromAmazonLink(value);
          }, 1000);
          console.log('⏰ Set new timer for Amazon link extraction');
        }
      }
    }

    // customLinkが入力された場合
    if (name === 'customLink' && value) {
      // 書籍の場合でAmazonリンクが入力された場合はタイトル抽出を試行
      if (!formData.isNotBook && isAmazonLink(value)) {
        // 既存のタイマーをクリア
        if (linkDebounceRef.current) {
          clearTimeout(linkDebounceRef.current);
        }
        
        linkDebounceRef.current = setTimeout(() => {
          console.log('⏰ Timer triggered from customLink, calling extractTitleFromAmazonLink');
          extractTitleFromAmazonLink(value);
        }, 1000);
        console.log('⏰ Set new timer for Amazon link extraction from customLink');
      } else if (formData.isNotBook) {
        // not書籍の場合は特別な処理は不要
        console.log('📝 CustomLink changed for non-book content:', value);
      }
    }

    // 「書籍ではない」チェックボックスが変更された場合
    if (name === 'isNotBook') {
      const isNotBook = (e.target as HTMLInputElement).checked;
      // 書籍ではない場合は常に有効
      if (isNotBook) {
        setTitleExtractionSuccess(true);
      } else {
        // 書籍の場合はタイトルの状態をチェック
        setTitleExtractionSuccess(isValidBookTitle(formData.title));
      }
    }
  };

  // 過去読んだもの検索の入力変更ハンドラー
  const handlePastBooksSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPastBooksSearchTerm(value);
    
    // 既存のタイマーをクリア
    if (pastBooksSearchDebounceRef.current) {
      clearTimeout(pastBooksSearchDebounceRef.current);
    }
    
    // デバウンス処理（500ms後に実行）
    pastBooksSearchDebounceRef.current = setTimeout(() => {
      searchPastBooks(value);
    }, 500);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      readingAmount: '',
      learning: '',
      action: '',
      notes: '',
      isNotBook: false,
      customLink: '',
      themeId: null
    });
    setAmazonLinkFound(false);
    setTitleExtractionSuccess(false);
    
    // Amazon検索機能は無効化（503エラー対応）
    // setAmazonSearchResults([]);
    // setShowAmazonSuggestions(false);
    // setIsSearchingAmazonBooks(false);
    
    // 過去読んだもの検索の状態もリセット
    setIsPastBooksAccordionOpen(false);
    setPastBooksSearchTerm('');
    setPastBooksSearchResults([]);
  };


  // ユーザーのテーマ一覧を取得
  const fetchUserThemes = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/writing-themes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setUserThemes(result.data || []);
      }
    } catch (error) {
      console.error('テーマ取得エラー:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 認証チェック
    if (!isAuthenticated || !token) {
      alert('ログインが必要です。ログインしてから再度お試しください。');
      return;
    }
    
    // 書籍の場合、タイトルが適切に取得されているかチェック
    if (!formData.isNotBook && !isValidBookTitle(formData.title)) {
      alert('書籍タイトルが正しく取得されていません。Amazonリンクから書籍タイトルが自動取得されるまでお待ちください。');
      return;
    }
    
    // タイトル取得中の場合は投稿を防ぐ
    if (isSearchingAmazon) {
      alert('書籍タイトルを取得中です。しばらくお待ちください。');
      return;
    }
    
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
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          reading_amount: formData.readingAmount,
          learning: formData.learning,
          action: formData.action,
          notes: formData.notes,
          isNotBook: formData.isNotBook,
          customLink: formData.customLink,
          themeId: formData.themeId
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
      alert('投稿が完了しました！マイページに遷移します。');
      resetForm();
      // マイページに遷移
      navigate('/mypage');
    } catch (error) {
      console.error('送信エラー:', error);
      trackError('post_creation_failed', error instanceof Error ? error.message : 'Unknown error');
      alert('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 border border-orange-100 min-h-screen sm:min-h-0 w-full max-w-full overflow-x-hidden">
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
      
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {/* 1. 読んだ対象の種類を選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            1. 読んだ対象の種類を選択してください
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* 書籍選択 */}
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                !formData.isNotBook
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, isNotBook: false }))}
            >
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  name="contentType"
                  value="book"
                  checked={!formData.isNotBook}
                  onChange={() => setFormData(prev => ({ ...prev, isNotBook: false }))}
                  className="mr-3"
                />
                <h4 className="font-semibold text-gray-900">📚 書籍</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">本、電子書籍など</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 小説、ビジネス書、技術書</li>
                <li>• 電子書籍、オーディオブック</li>
                <li>※ 将来的にタイトルからAmazonリンクを自動取得</li>
              </ul>
            </div>

            {/* not書籍選択 */}
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                formData.isNotBook
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, isNotBook: true }))}
            >
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  name="contentType"
                  value="notBook"
                  checked={formData.isNotBook}
                  onChange={() => setFormData(prev => ({ ...prev, isNotBook: true }))}
                  className="mr-3"
                />
                <h4 className="font-semibold text-gray-900">📄 その他のコンテンツ</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">記事、動画、ブログなど</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• ブログ記事、ニュース記事</li>
                <li>• YouTube動画、ポッドキャスト</li>
                <li>• SNS投稿、メルマガ</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. タイトル入力 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            2. {formData.isNotBook ? 'コンテンツのタイトル' : '書籍のタイトル'}を入力
          </label>
          <div className="relative">
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={formData.isNotBook ? "記事、動画、ブログなどのタイトルを入力" : "書籍タイトルを入力（例：7つの習慣）またはAmazonリンク"}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              required
            />
            {isSearchingAmazon && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>
          
          {/* Amazon検索機能は無効化（503エラー対応） */}
          {amazonLinkFound && !formData.isNotBook && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Amazonリンクが自動取得されました
            </p>
          )}
        </div>

        {/* 3. リンク入力（書籍・not書籍共通） */}
        <div className="mb-4">
          <label htmlFor="linkInput" className="block text-sm font-medium text-gray-700 mb-2">
            {formData.isNotBook ? 'リンクを直接入力（任意）' : 'Amazonリンクを入力（任意）'}
          </label>
          <textarea
            id="linkInput"
            name="customLink"
            value={formData.customLink}
            onChange={handleInputChange}
            placeholder={
              formData.isNotBook 
                ? "https://example.com/article や https://youtube.com/watch?v=... など、関連するリンクがあれば入力してください"
                : "https://www.amazon.co.jp/dp/B00KFB5DJC など、AmazonのURLがあれば入力してください"
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.isNotBook 
              ? '記事やブログのURL、YouTube動画、参考資料のリンクなどを入力できます。'
              : 'AmazonのURLなど、書籍に関連するリンクを入力できます。'
            }
          </p>
        </div>

        {/* 過去読んだものから登録するアコーディオン */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setIsPastBooksAccordionOpen(!isPastBooksAccordionOpen)}
            className="w-full flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">
                過去読んだものから登録する
              </span>
            </div>
            <svg
              className={`h-5 w-5 text-green-400 transition-transform ${isPastBooksAccordionOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {isPastBooksAccordionOpen && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="mb-3">
                <label htmlFor="pastBooksSearch" className="block text-sm font-medium text-green-700 mb-2">
                  書籍 OR not書籍タイトルを入力
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="pastBooksSearch"
                    value={pastBooksSearchTerm}
                    onChange={handlePastBooksSearchChange}
                    placeholder="例：How Google Works"
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {isSearchingPastBooks && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  部分一致で過去に読んだ書籍や記事を検索できます
                </p>
              </div>
              
              {/* 検索結果 */}
              {pastBooksSearchResults.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-green-700 mb-2">検索結果</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {pastBooksSearchResults.map((book, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectPastBook(book)}
                        className="w-full text-left p-2 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-800">{book.title}</div>
                        <div className="text-xs text-gray-500">
                          {book.is_not_book ? '📄 記事・ブログ' : '📚 書籍'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {pastBooksSearchTerm && pastBooksSearchResults.length === 0 && !isSearchingPastBooks && (
                <div className="mt-3 text-sm text-gray-500">
                  該当する過去の読書記録が見つかりませんでした
                </div>
              )}
            </div>
          )}
        </div>

        {/* 読みたい・見たいものリストから登録するアコーディオン */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setIsWishlistAccordionOpen(!isWishlistAccordionOpen)}
            className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-blue-800">
                読みたい・見たいものリストから登録する
              </span>
            </div>
            <svg
              className={`h-5 w-5 text-blue-400 transition-transform ${isWishlistAccordionOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {isWishlistAccordionOpen && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              {wishlistItems.length > 0 ? (
                <>
                  <h4 className="text-sm font-medium text-blue-700 mb-2">読みたい・見たいものリスト</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {wishlistItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectWishlistItem(item)}
                        className="w-full text-left p-2 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-800">{item.title}</div>
                        <div className="text-xs text-gray-500">
                          {item.is_not_book ? '📄 記事・動画など' : '📚 書籍'}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">
                  まだ読みたい・見たいものが登録されていません。
                  <br />
                  <a href="/reading" className="text-blue-600 hover:underline">こちら</a>から登録してください。
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. 今日読んだ量 */}
        <div>
          <label htmlFor="readingAmount" className="block text-sm font-medium text-gray-700 mb-2">
            4. 今日読んだ量
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

        {/* 4.5. テーマ選択 */}
        <div>
          <label htmlFor="themeId" className="block text-sm font-medium text-gray-700 mb-2">
            4.5. 書きたいテーマ（任意）
            <span className="text-xs text-gray-500 ml-2">
              設定したテーマから選択できます。設定は<a href="/settings" className="text-orange-600 hover:text-orange-700 underline">設定ページ</a>から行えます。
            </span>
          </label>
          <select
            id="themeId"
            name="themeId"
            value={formData.themeId || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              themeId: e.target.value ? parseInt(e.target.value) : null 
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
          >
            <option value="">テーマを選択しない</option>
            {userThemes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.theme_name}
              </option>
            ))}
          </select>
          {userThemes.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">
              💡 <a href="/settings" className="text-orange-600 hover:text-orange-700 underline">設定ページ</a>でテーマを作成すると、ここで選択できるようになります。
            </p>
          )}
        </div>

        {/* 5. 今日の学び or 気づき */}
        <div>
          <label htmlFor="learning" className="block text-sm font-medium text-gray-700 mb-2">
            5. 今日の学び or 気づき
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

        {/* 6. 明日の小さなアクション（任意） */}
        <div>
          <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-2">
            6. 明日の小さなアクション <span className="text-xs text-gray-500">（任意）</span>
          </label>
          <textarea
            id="action"
            name="action"
            value={formData.action}
            onChange={handleInputChange}
            placeholder="例：「朝会で相手の話をさえぎらずに聞く」（学ぶだけの場合は空欄でもOK）"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            学ぶだけの場合は空欄でも問題ありません
          </p>
        </div>

        {/* 7. 備考（マイページでのみ表示） */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            7. 備考 <span className="text-xs text-gray-500">（マイページでのみ表示）</span>
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

        {/* 8. ChatGPTで学びとアクションを整理 */}
        <div>
          <button
            type="button"
            onClick={() => {
              if (formData.action?.trim()) {
                const prompt = `以下の読書から得た学びとアクションについて、学んだ内容の整理と具体的で実行可能なアクションに深掘りしてください。

【読んだ本】
${formData.title || '書籍名未入力'}

【今日の学び】
${formData.learning || '学び未入力'}

【現在のアクション】
${formData.action}

【お願い】
1. 学んだ内容を1000文字以内のテキストで整理し、核心的なポイントを明確にしてください
2. 整理された学びを基に、現在のアクションをより具体的で実行可能なステップに分解してください
3. いつ、どこで、どのように実行するかを明確にしてください
4. 成功の指標や確認方法も含めてください
5. 必要に応じて、複数の小さなアクションに分けてください

学んだ内容の整理と実践的で継続可能なアクションプランを作成してください。`;

                navigator.clipboard.writeText(prompt).then(() => {
                  window.open('https://chat.openai.com/', '_blank');
                }).catch(err => {
                  console.error('クリップボードへのコピーに失敗しました:', err);
                  const textArea = document.createElement('textarea');
                  textArea.value = prompt;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  window.open('https://chat.openai.com/', '_blank');
                });
              } else {
                alert('明日の小さなアクションを入力してからお試しください。');
              }
            }}
            disabled={!formData.action?.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-600 focus:ring-4 focus:ring-purple-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>ChatGPTで学びとアクションを整理</span>
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            学びとアクションを入力後、このボタンを押すとChatGPTで学んだ内容を整理し、具体的なアクションプランを作成できます
          </p>
        </div>

        {/* 送信ボタン */}
        <div className="pt-4 pb-20">
          <button
            type="submit"
            disabled={isSubmitting || isSearchingAmazon || (!formData.isNotBook && !isValidBookTitle(formData.title))}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 focus:ring-4 focus:ring-orange-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>送信中...</span>
              </>
            ) : isSearchingAmazon ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>書籍名を取得中...</span>
              </>
            ) : (!formData.isNotBook && !isValidBookTitle(formData.title)) ? (
              <>
                <span>⏳ 書籍タイトルを取得してください</span>
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
