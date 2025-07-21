import cors from 'cors';
import express from 'express';
import {
    createReadingRecord,
    deleteReadingRecord,
    getAllReadingRecords,
    getReadingRecordById,
    ReadingRecord,
    testConnection,
    updateReadingRecord
} from './database';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// 全ての読書記録を取得
app.get('/api/reading-records', async (req, res) => {
  try {
    const result = await getAllReadingRecords();
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

    const record: ReadingRecord = {
      title,
      link,
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
    if (link !== undefined) updateData.link = link;
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
