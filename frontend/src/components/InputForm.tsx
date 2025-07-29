import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackError, trackPostCreation } from '../utils/analytics';
import { useAuth } from '../contexts/AuthContext';
import BookIcon from './BookIcon';

interface FormData {
  title: string;
  readingAmount: string;
  learning: string;
  action: string;
  notes: string;
  isNotBook: boolean;
  customLink: string;
  containsSpoiler: boolean;
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
    containsSpoiler: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingAmazon, setIsSearchingAmazon] = useState(false);
  const [amazonLinkFound, setAmazonLinkFound] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [, setTitleExtractionSuccess] = useState(false);
  
  // Amazon検索とオートコンプリート用の状態
  const [amazonSearchResults, setAmazonSearchResults] = useState<Array<{
    title: string;
    link: string;
  }>>([]);
  const [showAmazonSuggestions, setShowAmazonSuggestions] = useState(false);
  const [isSearchingAmazonBooks, setIsSearchingAmazonBooks] = useState(false);
  
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

  // Amazon検索とオートコンプリート機能
  const searchAmazonBooks = async (searchTerm: string) => {
    if (!searchTerm.trim() || formData.isNotBook) {
      setAmazonSearchResults([]);
      setShowAmazonSuggestions(false);
      return;
    }

    setIsSearchingAmazonBooks(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      
      // タイトルからAmazonリンクを検索
      const response = await fetch(`${API_BASE_URL}/api/search-amazon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: searchTerm }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Amazon検索結果:', result);
        
        if (result.success && result.data.link) {
          // 見つかったリンクからタイトルを取得
          const titleResponse = await fetch(`${API_BASE_URL}/api/extract-amazon-info`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amazonUrl: result.data.link }),
          });
          
          if (titleResponse.ok) {
            const titleResult = await titleResponse.json();
            if (titleResult.success && titleResult.data.title) {
              setAmazonSearchResults([{
                title: titleResult.data.title,
                link: result.data.link
              }]);
              setShowAmazonSuggestions(true);
            }
          }
        } else {
          setAmazonSearchResults([]);
          setShowAmazonSuggestions(false);
        }
      } else {
        console.error('Amazon検索エラー:', response.status);
        setAmazonSearchResults([]);
        setShowAmazonSuggestions(false);
      }
    } catch (error) {
      console.error('Amazon検索エラー:', error);
      setAmazonSearchResults([]);
      setShowAmazonSuggestions(false);
    } finally {
      setIsSearchingAmazonBooks(false);
    }
  };

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

  // Amazon検索結果を選択する関数
  const selectAmazonBook = (book: { title: string; link: string }) => {
    setFormData(prev => ({
      ...prev,
      title: book.title
    }));
    
    // 検索結果をクリア
    setAmazonSearchResults([]);
    setShowAmazonSuggestions(false);
    setAmazonLinkFound(true);
    setTitleExtractionSuccess(true);
  };

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
      setShowAmazonSuggestions(false);
      
      // 既存のタイマーをクリア
      if (titleDebounceRef.current) {
        clearTimeout(titleDebounceRef.current);
        console.log('⏰ Cleared existing title timer');
      }
      if (amazonSearchDebounceRef.current) {
        clearTimeout(amazonSearchDebounceRef.current);
        console.log('⏰ Cleared existing amazon search timer');
      }
      
      if (value && !formData.isNotBook) {
        // 書籍の場合、Amazonリンクかどうかをチェック
        if (isAmazonLink(value)) {
          // Amazonリンクとして処理（旧機能との互換性保持）
          titleDebounceRef.current = setTimeout(() => {
            console.log('⏰ Timer triggered, calling extractTitleFromAmazonLink');
            extractTitleFromAmazonLink(value);
          }, 1000);
          console.log('⏰ Set new timer for Amazon link extraction');
        } else {
          // タイトルとして処理 - Amazon検索を実行
          amazonSearchDebounceRef.current = setTimeout(() => {
            console.log('⏰ Timer triggered, calling searchAmazonBooks');
            searchAmazonBooks(value);
          }, 1000);
          console.log('⏰ Set new timer for Amazon search');
          // タイトル入力として有効とする
          setTitleExtractionSuccess(true);
        }
      } else if (formData.isNotBook) {
        // 書籍以外の場合は即座に有効
        setTitleExtractionSuccess(true);
      }
    }

    // customLinkが入力された場合（書籍ではない場合）
    // 本以外の場合は一般的なWebリンクを想定し、特別な処理は行わない
    if (name === 'customLink' && value && formData.isNotBook) {
      // 特別な処理は不要 - 一般的なWebリンクとして扱う
      console.log('📝 CustomLink changed for non-book content:', value);
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
      containsSpoiler: false
    });
    setAmazonLinkFound(false);
    setIsAccordionOpen(false);
    setTitleExtractionSuccess(false);
    
    // Amazon検索の状態もリセット
    setAmazonSearchResults([]);
    setShowAmazonSuggestions(false);
    setIsSearchingAmazonBooks(false);
    
    // 過去読んだもの検索の状態もリセット
    setIsPastBooksAccordionOpen(false);
    setPastBooksSearchTerm('');
    setPastBooksSearchResults([]);
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
          containsSpoiler: formData.containsSpoiler
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
        {/* 1. 書籍タイトル入力 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            1. 読んだ{formData.isNotBook ? 'コンテンツのタイトル' : '書籍のタイトル'}を入力
            <span className="text-xs text-gray-500 ml-2">
              {formData.isNotBook 
                ? '（記事、動画、ブログなどのタイトルを入力してください）'
                : '（タイトルを入力すると、対応するAmazonリンクが自動で取得されます）'
              }
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
                    タイトル入力とAmazonリンク自動取得について
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
                    <p><strong>📖 書籍タイトルで検索</strong></p>
                    <p>• 書籍タイトルを入力すると、対応するAmazonリンクを自動検索します</p>
                    <p>• 例：「7つの習慣」「嫌われる勇気」</p>
                    <p>• タイトルに応じてAmazonの商品情報が自動取得されます</p>
                    <p className="mt-3"><strong>🔗 従来のAmazonリンクも対応</strong></p>
                    <p>• AmazonのURLを直接貼り付けることも可能です</p>
                    <p>• 例：https://www.amazon.co.jp/dp/B00KFB5DJC</p>
                    <p>• 短縮URL（amzn.to、amzn.asia）にも対応しています</p>
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
              placeholder={formData.isNotBook ? "記事、動画、ブログなどのタイトルを入力" : "書籍タイトルを入力（例：7つの習慣）またはAmazonリンク"}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              required
            />
            {(isSearchingAmazon || isSearchingAmazonBooks) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>
          
          {/* Amazon検索結果のサジェスト */}
          {showAmazonSuggestions && amazonSearchResults.length > 0 && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
                📚 Amazon検索結果
              </div>
              {amazonSearchResults.map((book, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectAmazonBook(book)}
                  className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <div className="text-sm font-medium text-gray-800">{book.title}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    📖 Amazon商品情報が取得されました
                  </div>
                </button>
              ))}
            </div>
          )}
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
              {formData.isNotBook ? '✓ not 書籍' : '📚 not 書籍'}
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  記事やブログのURL、YouTube動画、参考資料のリンクなどを入力できます。
                </p>
              </div>
            </div>
          )}
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

        {/* 6. ネタバレを含む */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            6. ネタバレを含む
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="containsSpoiler"
                value="false"
                checked={!formData.containsSpoiler}
                onChange={(e) => setFormData({
                  ...formData,
                  containsSpoiler: e.target.value === 'true'
                })}
                className="mr-2 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">ネタバレなし</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="containsSpoiler"
                value="true"
                checked={formData.containsSpoiler}
                onChange={(e) => setFormData({
                  ...formData,
                  containsSpoiler: e.target.value === 'true'
                })}
                className="mr-2 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">ネタバレあり</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ネタバレを含む場合は、タイムラインで他のユーザーに表示されないように設定できます
          </p>
        </div>

        {/* 7. ChatGPTで学びとアクションを整理 */}
        <div>
          <button
            type="button"
            onClick={() => {
              if (formData.action.trim()) {
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
            disabled={!formData.action.trim()}
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
        <div className="pt-4">
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
