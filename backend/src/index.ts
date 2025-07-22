import axios from 'axios';
import cors from 'cors';
import express from 'express';
import {
    addLike,
    createReadingRecord,
    deleteReadingRecord,
    getAllReadingRecords,
    getReadingRecordById,
    ReadingRecord,
    removeLike,
    testConnection,
    updateReadingRecord
} from './database';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// セッションIDを生成する関数
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

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

// 全ての読書記録を取得（いいね情報付き）
app.get('/api/reading-records', async (req, res) => {
  try {
    const sessionId = req.query.sessionId as string;
    const result = await getAllReadingRecords(sessionId);
    if (result.success) {
      res.json({ 
        message: 'Reading records retrieved successfully', 
        data: result.data 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to retrieve reading records', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error retrieving reading records', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

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

// 新しい読書記録を作成
app.post('/api/reading-records', async (req, res) => {
  try {
    const { title, link, reading_amount, learning, action } = req.body;

    // バリデーション
    if (!title || !reading_amount || !learning || !action) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, reading_amount, learning, action' 
      });
    }

    // Amazonリンクをアフィリエイトリンクに変換
    const convertedLink = await convertToAffiliateLink(link);

    const record: ReadingRecord = {
      title,
      link: convertedLink,
      reading_amount,
      learning,
      action
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

    const { title, link, reading_amount, learning, action } = req.body;
    const updateData: Partial<ReadingRecord> = {};

    if (title) updateData.title = title;
    if (link !== undefined) {
      // Amazonリンクをアフィリエイトリンクに変換
      updateData.link = await convertToAffiliateLink(link);
    }
    if (reading_amount) updateData.reading_amount = reading_amount;
    if (learning) updateData.learning = learning;
    if (action) updateData.action = action;

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

// いいねを追加
app.post('/api/reading-records/:id/like', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const result = await addLike(id, sessionId);
    if (result.success) {
      res.json({ 
        message: result.data ? 'Like added successfully' : 'Already liked',
        data: result.data 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to add like', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error adding like', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// いいねを削除
app.delete('/api/reading-records/:id/like', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const result = await removeLike(id, sessionId);
    if (result.success) {
      res.json({ 
        message: 'Like removed successfully',
        data: result.data 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to remove like', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error removing like', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// セッションIDを生成
app.post('/api/session', (req, res) => {
  const sessionId = generateSessionId();
  res.json({ 
    message: 'Session created successfully', 
    sessionId 
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
