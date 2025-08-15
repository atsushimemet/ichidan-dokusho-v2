import axios from 'axios';
import cors from 'cors';
import express from 'express';
import { authenticateToken, generateToken, verifyGoogleToken } from './auth';
import {
    createBook,
    createReadingRecord,
    createWishlistItem,
    createWritingTheme,
    deleteBook,
    deleteReadingRecord,
    deleteUserPromptTemplate,
    deleteWishlistItem,
    deleteWritingTheme,
    updateBook,
    getAllBooks,
    getAllTags,
    getAllThemeReadingStats,
    getBooksByTagName,
    getDailyThemeReadingTrends,
    getPromptTemplate,
    getReadingRecordById,
    getThemeBasedReadingStats,
    getThemeReadingRecords,
    getUserPromptTemplates,
    getUserReadingRecords,
    getUserSettings,
    getUserWishlistItems,
    getUserWritingThemes,
    ReadingRecord,
    ReadingWishlistItem,
    searchReadingRecordsByTitle,
    testConnection,
    updateReadingRecord,
    updateWishlistItem,
    updateWritingTheme,
    upsertPromptTemplate,
    upsertUserSettings,
    WritingTheme
} from './database';

// Request型の拡張
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// タイムライン機能除却: セッションID生成関数を削除
// 匿名アクセス機能の廃止により、セッション管理関数を完全停止

// Amazonリンクをアフィリエイトリンクに変換する関数
const convertToAffiliateLink = async (link: string): Promise<string> => {
  if (!link) return link;
  
  // Amazon.co.jpまたはamzn.asiaのリンクかチェック
  if (!link.includes('amazon.co.jp') && !link.includes('amzn.asia')) {
    return link;
  }

  try {
    // リンクにアクセスしてリダイレクト後のURLを取得
    const response = await axios.get(link, {
      maxRedirects: 5,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      validateStatus: function (status) {
        return status < 500; // 500エラー以外は受け入れる
      }
    });

    const finalUrl = response.request.res.responseUrl || link;
    console.log(`Original URL: ${link}`);
    console.log(`Final URL: ${finalUrl}`);
    console.log(`Response status: ${response.status}`);

    // 404エラーの場合は元のリンクを返す
    if (response.status === 404) {
      console.log('404 error - returning original link');
      return link;
    }

    // ASINを抽出する正規表現パターン
    const asinPatterns = [
      /\/dp\/([A-Z0-9]{10})/, // /dp/ASIN パターン
      /\/gp\/product\/([A-Z0-9]{10})/, // /gp/product/ASIN パターン
      /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/, // /exec/obidos/ASIN/ASIN パターン
      /\/o\/ASIN\/([A-Z0-9]{10})/, // /o/ASIN/ASIN パターン
      /\/ASIN\/([A-Z0-9]{10})/, // /ASIN/ASIN パターン
    ];

    let asin = null;
    
    // 各パターンでASINを検索
    for (const pattern of asinPatterns) {
      const match = finalUrl.match(pattern);
      if (match) {
        asin = match[1];
        break;
      }
    }

    // ASINが見つからない場合は元のリンクを返す
    if (!asin) {
      console.log('ASIN not found in final URL');
      return link;
    }

    // アフィリエイトリンクを生成
    const affiliateId = 'tbooks47579-22';
    const affiliateLink = `https://www.amazon.co.jp/dp/${asin}/ref=nosim?tag=${affiliateId}`;
    console.log(`Generated affiliate link: ${affiliateLink}`);
    return affiliateLink;

  } catch (error) {
    console.error('Error converting link:', error);
    // エラーの場合は元のリンクを返す
    return link;
  }
};

// タイトルからAmazonリンクを取得する関数
const getAmazonLinkFromTitle = async (title: string): Promise<string | null> => {
  if (!title) return null;

  try {
    // 検索クエリを構築
    const searchQuery = encodeURIComponent(title);
    const searchUrl = `https://www.amazon.co.jp/s?k=${searchQuery}&i=stripbooks`;
    
    console.log(`Searching for: ${title}`);
    console.log(`Search URL: ${searchUrl}`);

    // Amazon検索ページにアクセス
    const response = await axios.get(searchUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      validateStatus: function (status) {
        return status < 500;
      }
    });

    const html = response.data;
    
    // 最初の商品リンクを抽出
    const productLinkMatch = html.match(/href="([^"]*\/dp\/[A-Z0-9]{10}[^"]*)"/);
    
    if (productLinkMatch) {
      const productUrl = productLinkMatch[1];
      const fullUrl = productUrl.startsWith('http') ? productUrl : `https://www.amazon.co.jp${productUrl}`;
      
      console.log(`Found product URL: ${fullUrl}`);
      
      // ASINを抽出
      const asinMatch = fullUrl.match(/\/dp\/([A-Z0-9]{10})/);
      if (asinMatch) {
        const asin = asinMatch[1];
        const affiliateId = 'tbooks47579-22';
        const affiliateLink = `https://www.amazon.co.jp/dp/${asin}/ref=nosim?tag=${affiliateId}`;
        
        console.log(`Generated affiliate link: ${affiliateLink}`);
        return affiliateLink;
      }
    }

    console.log('No product found for title:', title);
    return null;

  } catch (error) {
    console.error('Error searching Amazon:', error);
    return null;
  }
};

// AmazonリンクからタイトルとASINを取得する関数
const getTitleFromAmazonLink = async (amazonUrl: string): Promise<{title: string, asin: string} | null> => {
  if (!amazonUrl) return null;

  try {
    let finalUrl = amazonUrl;
    
    // 短縮URLの場合はリダイレクト先を取得
    const isShortUrl = amazonUrl.includes('amzn.to') || amazonUrl.includes('amzn.asia');
    if (isShortUrl) {
      console.log('Short URL detected, following redirects:', amazonUrl);
      
      try {
        // GETリクエストでリダイレクトを追跡
        const response = await axios.get(amazonUrl, {
          maxRedirects: 5,
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }
        });
        
        // リダイレクト後のURLを取得
        finalUrl = response.request.res.responseUrl || response.config.url || amazonUrl;
        console.log('Redirect resolved to:', finalUrl);
      } catch (redirectError) {
        console.log('Redirect resolution failed, trying original URL:', redirectError instanceof Error ? redirectError.message : 'Unknown error');
      }
    }

    // ASINを抽出
    const asinPatterns = [
      /\/dp\/([A-Z0-9]{10})/,
      /\/gp\/product\/([A-Z0-9]{10})/,
      /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/,
      /\/o\/ASIN\/([A-Z0-9]{10})/,
      /\/ASIN\/([A-Z0-9]{10})/,
    ];

    let asin = null;
    for (const pattern of asinPatterns) {
      const match = finalUrl.match(pattern);
      if (match) {
        asin = match[1];
        break;
      }
    }

    if (!asin) {
      console.error('ASIN not found in URL:', finalUrl, '(original:', amazonUrl, ')');
      return null;
    }
    
    console.log('ASIN extracted:', asin, 'from URL:', finalUrl);

    // Amazon商品ページを取得
    const productUrl = `https://www.amazon.co.jp/dp/${asin}`;
    const response = await axios.get(productUrl, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Connection': 'keep-alive',
      }
    });

    const html = response.data;
    
    // タイトルを抽出（複数のパターンに対応）
    const titlePatterns = [
      /<span[^>]*id="productTitle"[^>]*>\s*(.*?)\s*<\/span>/is,
      /<h1[^>]*class="[^"]*a-size-large[^"]*"[^>]*>\s*(.*?)\s*<\/h1>/is,
      /<h1[^>]*data-automation-id="title"[^>]*>\s*(.*?)\s*<\/h1>/is,
      /<span[^>]*class="[^"]*a-size-large[^"]*product-title-word-break[^"]*"[^>]*>\s*(.*?)\s*<\/span>/is,
      /<title>\s*(.*?)\s*[\:\-\|]\s*Amazon\.co\.jp/i,
      /<title>\s*(.*?)\s*Amazon\.co\.jp/i,
      /<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i,
      /<meta[^>]*name="title"[^>]*content="([^"]*)"[^>]*>/i,
    ];

    let title = null;
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match) {
        // HTMLエンティティをデコードし、余分な空白を削除
        title = match[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (title && title.length > 3) {
          break;
        }
      }
    }

    if (!title || title.length < 3) {
      console.error('Title not found or too short for ASIN:', asin);
      return null;
    }

    return { title, asin };

  } catch (error) {
    console.error('Error extracting title from Amazon URL:', error);
    return null;
  }
};

// AmazonリンクからタイトルとASINを取得するAPI
app.post('/api/extract-amazon-info', async (req, res) => {
  try {
    const { amazonUrl } = req.body;
    
    if (!amazonUrl) {
      return res.status(400).json({ 
        message: 'Amazon URL is required' 
      });
    }

    const result = await getTitleFromAmazonLink(amazonUrl);
    
    if (result) {
      res.json({ 
        success: true,
        data: {
          title: result.title,
          asin: result.asin
        }
      });
    } else {
      res.json({ 
        success: false,
        message: 'Could not extract title from Amazon URL'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error extracting Amazon info', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// タイトルからAmazonリンクを取得するAPI
app.post('/api/search-amazon', async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ 
        message: 'Title is required' 
      });
    }

    const amazonLink = await getAmazonLinkFromTitle(title);
    
    if (amazonLink) {
      res.json({ 
        success: true,
        data: {
          link: amazonLink
        }
      });
    } else {
      res.json({ 
        success: false,
        message: 'No Amazon product found for this title'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error searching Amazon', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// データベース接続テスト
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await testConnection();
    if (result.success) {
      res.json({ 
        message: 'Database connection successful', 
        timestamp: result.timestamp 
      });
    } else {
      res.status(500).json({ 
        message: 'Database connection failed', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// タイムライン機能除却: 全ての読書記録取得APIを削除
// プライバシー保護のため、他人の記録へのアクセスを完全に停止

// 特定の読書記録を取得
app.get('/api/reading-records/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const result = await getReadingRecordById(id);
    if (result.success) {
      if (result.data) {
        res.json({ 
          message: 'Reading record retrieved successfully', 
          data: result.data 
        });
      } else {
        res.status(404).json({ message: 'Reading record not found' });
      }
    } else {
      res.status(500).json({ 
        message: 'Failed to retrieve reading record', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error retrieving reading record', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// 過去の読書記録をタイトルで検索
app.get('/api/reading-records/search/title', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchLimit = parseInt(limit as string) || 10;
    const result = await searchReadingRecordsByTitle(q, searchLimit);
    
    if (result.success) {
      res.json({ 
        message: 'Search completed successfully', 
        data: result.data 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to search reading records', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error searching reading records', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// 新しい読書記録を作成（認証必須）
app.post('/api/reading-records', authenticateToken, async (req, res) => {
  try {
    const { title, reading_amount, learning, action, isNotBook, customLink, themeId } = req.body;
    // 認証されたユーザー情報を取得
    const userId = req.user?.userId || req.user?.sub;
    const userEmail = req.user?.email;

    // バリデーション
    if (!title || !reading_amount || !learning) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, reading_amount, learning' 
      });
    }

    if (!userId || !userEmail) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }

    let finalLink: string | undefined;

    if (isNotBook && customLink) {
      // 書籍以外でカスタムリンクが入力されている場合
      finalLink = customLink;
    } else if (!isNotBook) {
      // 書籍の場合、タイトルからAmazonリンクを自動取得
      const amazonLink = await getAmazonLinkFromTitle(title);
      finalLink = amazonLink || undefined;
    }

    const record: ReadingRecord = {
      title,
      link: finalLink,
      reading_amount,
      learning,
      action,
      notes: req.body.notes,
      is_not_book: isNotBook,
      custom_link: customLink,

      user_id: userId,
      user_email: userEmail,
      theme_id: themeId ? parseInt(themeId) : null
    };

    const result = await createReadingRecord(record);
    if (result.success) {
      res.status(201).json({ 
        message: 'Reading record created successfully', 
        data: result.data 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to create reading record', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating reading record', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// 読書記録を更新
app.put('/api/reading-records/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const { title, link, reading_amount, learning, action, notes, theme_id } = req.body;
    const updateData: Partial<ReadingRecord> = {};

    if (title) updateData.title = title;
    if (link !== undefined) {
      // Amazonリンクをアフィリエイトリンクに変換
      updateData.link = await convertToAffiliateLink(link);
    }
    if (reading_amount) updateData.reading_amount = reading_amount;
    if (learning) updateData.learning = learning;
    if (action !== undefined) updateData.action = action;
    if (notes !== undefined) updateData.notes = notes;

    if (theme_id !== undefined) updateData.theme_id = theme_id;

    const result = await updateReadingRecord(id, updateData);
    if (result.success) {
      if (result.data) {
        res.json({ 
          message: 'Reading record updated successfully', 
          data: result.data 
        });
      } else {
        res.status(404).json({ message: 'Reading record not found' });
      }
    } else {
      res.status(500).json({ 
        message: 'Failed to update reading record', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating reading record', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// 読書記録を削除
app.delete('/api/reading-records/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const result = await deleteReadingRecord(id);
    if (result.success) {
      if (result.data) {
        res.json({ 
          message: 'Reading record deleted successfully', 
          data: result.data 
        });
      } else {
        res.status(404).json({ message: 'Reading record not found' });
      }
    } else {
      res.status(500).json({ 
        message: 'Failed to delete reading record', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting reading record', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// タイムライン機能除却: いいね追加APIを削除
// 社会的機能の廃止により、いいね機能を完全停止

// タイムライン機能除却: いいね削除APIを削除
// 社会的機能の廃止により、いいね機能を完全停止

// セッションIDを生成
// タイムライン機能除却: セッション管理APIを削除
// 匿名アクセス機能の廃止により、セッション管理を完全停止

// Google認証エンドポイント
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    // Google IDトークンを検証
    const googleUser = await verifyGoogleToken(idToken);
    
    // JWTトークンを生成
    const token = generateToken(googleUser.userId || '', googleUser.email || '');
    
    res.json({
      message: 'Authentication successful',
      token,
      user: {
        userId: googleUser.userId,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture
      }
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(401).json({ 
      message: 'Authentication failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// 認証状態確認エンドポイント
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    message: 'Token is valid',
    user: req.user
  });
});

// ユーザー固有の読書記録を取得（マイページ用）
app.get('/api/my-records', authenticateToken, async (req, res) => {
  try {
    // 認証されたユーザー情報を取得
    const userId = req.user?.userId || req.user?.sub;
    const sessionId = req.query.sessionId as string | undefined;

    if (!userId) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }
    const result = await getUserReadingRecords(userId, sessionId);
    if (result.success) {
      res.json({
        message: 'User reading records retrieved successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        message: 'Failed to retrieve user reading records',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving user reading records',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ユーザー設定を取得
app.get('/api/user-settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.sub || 'dev-user-123';
    const result = await getUserSettings(userId);
    
    if (result.success) {
      res.json({
        draftThreshold: result.data.draft_threshold || 5
      });
    } else {
      res.status(500).json({
        message: 'Failed to retrieve user settings',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving user settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ユーザー設定を更新
app.put('/api/user-settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.sub || 'dev-user-123';
    const { draftThreshold } = req.body;
    
    const result = await upsertUserSettings({
      user_id: userId,
      draft_threshold: draftThreshold
    });
    
    if (result.success) {
      res.json({
        message: 'User settings updated successfully',
        settings: {
          draftThreshold: result.data.draft_threshold || 5
        }
      });
    } else {
      res.status(500).json({
        message: 'Failed to update user settings',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error updating user settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 書きたいテーマ一覧を取得
app.get('/api/writing-themes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.sub;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }
    
    const result = await getUserWritingThemes(userId);
    
    if (result.success) {
      res.json({
        message: 'Writing themes retrieved successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        message: 'Failed to retrieve writing themes',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving writing themes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 新しい書きたいテーマを作成
app.post('/api/writing-themes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.sub;
    const { theme_name } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }
    
    if (!theme_name || theme_name.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Theme name is required' 
      });
    }
    
    if (theme_name.length > 100) {
      return res.status(400).json({ 
        message: 'Theme name must be 100 characters or less' 
      });
    }
    
    // 10テーマ制限チェック
    const existingThemesResult = await getUserWritingThemes(userId);
    if (existingThemesResult.success && existingThemesResult.data && existingThemesResult.data.length >= 10) {
      return res.status(400).json({ 
        message: 'テーマは最大10個まで設定できます。新しいテーマを追加するには、既存のテーマを削除してください。' 
      });
    }
    
    const theme: WritingTheme = {
      user_id: userId,
      theme_name: theme_name.trim()
    };
    
    const result = await createWritingTheme(theme);
    
    if (result.success) {
      res.status(201).json({
        message: 'Writing theme created successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        message: 'Failed to create writing theme',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error creating writing theme',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 書きたいテーマを更新
app.put('/api/writing-themes/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.sub;
    const themeId = parseInt(req.params.id);
    const { theme_name } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }
    
    if (isNaN(themeId)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    if (!theme_name || theme_name.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Theme name is required' 
      });
    }
    
    if (theme_name.length > 100) {
      return res.status(400).json({ 
        message: 'Theme name must be 100 characters or less' 
      });
    }
    
    const result = await updateWritingTheme(themeId, userId, theme_name.trim());
    
    if (result.success) {
      res.json({
        message: 'Writing theme updated successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        message: 'Failed to update writing theme',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error updating writing theme',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 書きたいテーマを削除
app.delete('/api/writing-themes/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.sub;
    const themeId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }
    
    if (isNaN(themeId)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    const result = await deleteWritingTheme(themeId, userId);
    
    if (result.success) {
      res.json({
        message: 'Writing theme deleted successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        message: 'Failed to delete writing theme',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting writing theme',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// テーマ別読書記録統計API
app.get('/api/theme-reading-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const themeId = req.query.themeId ? parseInt(req.query.themeId as string) : undefined;
    
    if (req.query.themeId && isNaN(themeId!)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    const result = await getThemeBasedReadingStats(userId, themeId);
    
    if (result.success) {
      res.json({ 
        message: 'Theme-based reading stats retrieved successfully', 
        data: result.data 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to retrieve theme-based reading stats', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error retrieving theme-based reading stats', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// 日次テーマ別読書記録推移API
app.get('/api/daily-theme-reading-trends', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const themeId = req.query.themeId ? parseInt(req.query.themeId as string) : undefined;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    
    if (req.query.themeId && isNaN(themeId!)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    if (isNaN(days) || days < 1 || days > 365) {
      return res.status(400).json({ message: 'Days must be between 1 and 365' });
    }
    
    const result = await getDailyThemeReadingTrends(userId, themeId, days);
    
    if (result.success) {
      res.json({ 
        message: 'Daily theme reading trends retrieved successfully', 
        data: result.data 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to retrieve daily theme reading trends', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error retrieving daily theme reading trends', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// テーマ別読書記録を取得（草稿生成用）
app.get('/api/theme-reading-records/:themeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.sub;
    const themeId = parseInt(req.params.themeId);
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }
    
    if (isNaN(themeId)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    const result = await getThemeReadingRecords(userId, themeId);
    
    if (result.success) {
      res.json({
        message: 'Theme reading records retrieved successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        message: 'Failed to retrieve theme reading records',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving theme reading records',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 全テーマ統計API（プルダウン表示用）
app.get('/api/all-theme-reading-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await getAllThemeReadingStats(userId);
    
    if (result.success) {
      res.json({ 
        message: 'All theme reading stats retrieved successfully', 
        data: result.data 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to retrieve all theme reading stats', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error retrieving all theme reading stats', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// テーマ統計API（草稿出力画面用）
app.get('/api/theme-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.sub || 'dev-user-123';
    
    const result = await getAllThemeReadingStats(userId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve theme stats',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving theme stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check
// プロンプトテンプレート一覧を取得
app.get('/api/prompt-templates', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.sub;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }
    
    const result = await getUserPromptTemplates(userId);
    
    if (result.success) {
      res.json({
        message: 'Prompt templates retrieved successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        message: 'Failed to retrieve prompt templates',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving prompt templates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// プロンプトテンプレートを作成/更新
app.put('/api/prompt-templates', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.sub;
    const { mode, template_text } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }
    
    if (!mode || !template_text) {
      return res.status(400).json({ 
        message: 'Mode and template_text are required' 
      });
    }
    
    if (!['fact', 'essay'].includes(mode)) {
      return res.status(400).json({ 
        message: 'Mode must be either "fact" or "essay"' 
      });
    }
    
    const result = await upsertPromptTemplate({
      user_id: userId,
      mode: mode as 'fact' | 'essay',
      template_text
    });
    
    if (result.success) {
      res.json({
        message: 'Prompt template updated successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        message: 'Failed to update prompt template',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error updating prompt template',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 特定のプロンプトテンプレートを取得
app.get('/api/prompt-templates/:mode', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.sub;
    const mode = req.params.mode as 'fact' | 'essay';
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }
    
    if (!['fact', 'essay'].includes(mode)) {
      return res.status(400).json({ 
        message: 'Mode must be either "fact" or "essay"' 
      });
    }
    
    const result = await getPromptTemplate(userId, mode);
    
    if (result.success) {
      res.json({
        message: 'Prompt template retrieved successfully',
        data: result.data
      });
    } else {
      res.status(404).json({
        message: 'Prompt template not found',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving prompt template',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// プロンプトテンプレートを削除（デフォルトに戻す）
app.delete('/api/prompt-templates/:mode', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.sub;
    const mode = req.params.mode as 'fact' | 'essay';
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }
    
    if (!['fact', 'essay'].includes(mode)) {
      return res.status(400).json({ 
        message: 'Mode must be either "fact" or "essay"' 
      });
    }
    
    const result = await deleteUserPromptTemplate(userId, mode);
    
    if (result.success) {
      res.json({
        message: 'Prompt template reset to default successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        message: 'Failed to reset prompt template',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error resetting prompt template',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ========================================
// 読みたいものリスト関連のAPI
// ========================================

// 読みたいものリストの作成
app.post('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const { title, link, isNotBook } = req.body;
    const userId = req.user.userId || req.user.id;
    
    console.log('Wishlist Debug - req.user:', req.user);
    console.log('Wishlist Debug - userId:', userId);

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const wishlistItem: ReadingWishlistItem = {
      user_id: userId,
      title,
      link: link || '',
      is_not_book: isNotBook || false
    };

    const result = await createWishlistItem(wishlistItem);

    if (result.success) {
      res.status(201).json(result.data);
    } else {
      console.error('Create wishlist item error:', result.error);
      res.status(500).json({ error: result.error || 'Failed to create wishlist item' });
    }
  } catch (error) {
    console.error('Create wishlist item error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// ユーザーの読みたいものリストの取得
app.get('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const result = await getUserWishlistItems(userId);

    if (result.success) {
      res.json(result.data);
    } else {
      console.error('Get wishlist items error:', result.error);
      res.status(500).json({ error: result.error || 'Failed to get wishlist items' });
    }
  } catch (error) {
    console.error('Get wishlist items error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// 読みたいものリストアイテムの削除
app.delete('/api/wishlist/:id', authenticateToken, async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const userId = req.user.userId || req.user.id;

    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    const result = await deleteWishlistItem(itemId, userId);

    if (result.success) {
      res.json({ message: 'Wishlist item deleted successfully' });
    } else {
      console.error('Delete wishlist item error:', result.error);
      res.status(500).json({ error: result.error || 'Failed to delete wishlist item' });
    }
  } catch (error) {
    console.error('Delete wishlist item error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// 読みたいものリストアイテムの更新
app.put('/api/wishlist/:id', authenticateToken, async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const userId = req.user.userId || req.user.id;
    const { title, link, isNotBook } = req.body;

    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    const updates: Partial<ReadingWishlistItem> = {};
    if (title !== undefined) updates.title = title;
    if (link !== undefined) updates.link = link;
    if (isNotBook !== undefined) updates.is_not_book = isNotBook;

    const result = await updateWishlistItem(itemId, userId, updates);

    if (result.success) {
      res.json(result.data);
    } else {
      console.error('Update wishlist item error:', result.error);
      res.status(500).json({ error: result.error || 'Failed to update wishlist item' });
    }
  } catch (error) {
    console.error('Update wishlist item error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// アプリケーション起動時のエラーハンドリング
const startServer = async () => {
  try {
    console.log('=== Server Startup Debug ===');
    console.log('Starting server...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Port:', PORT);
    console.log('Database Host:', process.env.DB_HOST);
    console.log('Database Port:', process.env.DB_PORT);
    console.log('Database User:', process.env.DB_USER);
    console.log('Database Name:', process.env.DB_NAME);
    console.log('CORS Origin:', process.env.CORS_ORIGIN);
    
    // データベース接続テスト（非同期で実行）
    console.log('Testing database connection...');
    testConnection().then(result => {
      if (result.success) {
        console.log('Database connection successful');
      } else {
        console.error('Database connection failed:', result.error);
        console.log('Continuing without database connection...');
      }
    }).catch(error => {
      console.error('Database connection error:', error);
      console.log('Continuing without database connection...');
    });

    // サーバー起動
    app.listen(PORT, () => {
      console.log(`=== Server Started Successfully ===`);
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // エラーが発生してもサーバーを起動
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (with errors)`);
    });
  }
};

// 管理者認証ミドルウェア
const authenticateAdmin = (req: any, res: any, next: any) => {
  const { username, password } = req.body;
  
  if (username === 'noap3b69n' && password === '19930322') {
    next();
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// 書籍登録API
app.post('/api/admin/books', authenticateAdmin, async (req, res) => {
  try {
    const { title, amazon_link, tags, summary_link1, summary_link2, summary_link3 } = req.body;
    
    if (!title || !amazon_link) {
      return res.status(400).json({ error: 'Title and Amazon link are required' });
    }

    const result = await createBook({ 
      title, 
      amazon_link, 
      tags: tags || [],
      summary_link1: summary_link1 || null,
      summary_link2: summary_link2 || null,
      summary_link3: summary_link3 || null
    });
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Book creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 書籍一覧取得API
app.get('/api/books', async (req, res) => {
  try {
    const result = await getAllBooks();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 書籍削除API
app.delete('/api/admin/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.headers;
    
    // 管理者認証
    if (username !== 'noap3b69n' || password !== '19930322') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = await deleteBook(parseInt(id));
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// タグ一覧取得API
app.get('/api/tags', async (req, res) => {
  try {
    const result = await getAllTags();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// タグ名で書籍取得API
app.get('/api/books/tag/:tagName', async (req, res) => {
  try {
    const { tagName } = req.params;
    const result = await getBooksByTagName(decodeURIComponent(tagName));
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get books by tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 書籍更新API（認証必要）
app.put('/api/books/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amazon_link, tags, summary_link1, summary_link2, summary_link3 } = req.body;
    
    if (!title && !amazon_link && !tags && summary_link1 === undefined && summary_link2 === undefined && summary_link3 === undefined) {
      return res.status(400).json({ error: 'At least one field (title, amazon_link, tags, or summary links) is required' });
    }

    const updateData: { title?: string; amazon_link?: string; tags?: string[]; summary_link1?: string | null; summary_link2?: string | null; summary_link3?: string | null; } = {};
    if (title !== undefined) updateData.title = title;
    if (amazon_link !== undefined) updateData.amazon_link = amazon_link;
    if (tags !== undefined) updateData.tags = tags;
    if (summary_link1 !== undefined) updateData.summary_link1 = summary_link1;
    if (summary_link2 !== undefined) updateData.summary_link2 = summary_link2;
    if (summary_link3 !== undefined) updateData.summary_link3 = summary_link3;

    const result = await updateBook(parseInt(id), updateData);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(result.error === 'Book not found' ? 404 : 500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 書籍削除API（認証必要）
app.delete('/api/books/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await deleteBook(parseInt(id));
    
    if (result.success) {
      res.json({ message: 'Book deleted successfully', data: result.data });
    } else {
      res.status(result.error === 'Book not found' ? 404 : 500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// グレースフルシャットダウン
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
