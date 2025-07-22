import { Pool } from 'pg';

// データベース接続プールの作成
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// データベース接続テスト
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return { success: true, timestamp: result.rows[0].now };
  } catch (error) {
    console.error('Database connection error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 読書記録の型定義
export interface ReadingRecord {
  id?: number;
  title: string;
  link?: string;
  reading_amount: string;
  learning: string;
  action: string;
  created_at?: string;
  updated_at?: string;
  like_count?: number;
  is_liked?: boolean;
}

// いいねの型定義
export interface Like {
  id?: number;
  reading_record_id: number;
  session_id: string;
  created_at?: string;
}

// 新しい読書記録を作成
export const createReadingRecord = async (record: ReadingRecord) => {
  try {
    const query = `
      INSERT INTO reading_records (title, link, reading_amount, learning, action)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [record.title, record.link, record.reading_amount, record.learning, record.action];
    const result = await pool.query(query, values);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Create reading record error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 全ての読書記録を取得（作成日時降順、いいね数付き）
export const getAllReadingRecords = async (sessionId?: string) => {
  try {
    const query = `
      SELECT 
        r.*,
        COUNT(l.id) as like_count,
        CASE WHEN EXISTS (
          SELECT 1 FROM likes 
          WHERE reading_record_id = r.id AND session_id = $1
        ) THEN true ELSE false END as is_liked
      FROM reading_records r
      LEFT JOIN likes l ON r.id = l.reading_record_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [sessionId || '']);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Get reading records error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 特定の読書記録を取得
export const getReadingRecordById = async (id: number) => {
  try {
    const query = 'SELECT * FROM reading_records WHERE id = $1';
    const result = await pool.query(query, [id]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Get reading record error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 読書記録を更新
export const updateReadingRecord = async (id: number, record: Partial<ReadingRecord>) => {
  try {
    const fields = Object.keys(record).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(record);
    const query = `UPDATE reading_records SET ${fields} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id, ...values]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Update reading record error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 読書記録を削除
export const deleteReadingRecord = async (id: number) => {
  try {
    const query = 'DELETE FROM reading_records WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Delete reading record error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// いいねを追加
export const addLike = async (readingRecordId: number, sessionId: string) => {
  try {
    const query = `
      INSERT INTO likes (reading_record_id, session_id)
      VALUES ($1, $2)
      ON CONFLICT (reading_record_id, session_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [readingRecordId, sessionId]);
    
    if (result.rows.length > 0) {
      return { success: true, data: result.rows[0] };
    } else {
      return { success: true, data: null, message: 'Already liked' };
    }
  } catch (error) {
    console.error('Add like error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// いいねを削除
export const removeLike = async (readingRecordId: number, sessionId: string) => {
  try {
    const query = `
      DELETE FROM likes 
      WHERE reading_record_id = $1 AND session_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [readingRecordId, sessionId]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Remove like error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// いいねの状態を取得
export const getLikeStatus = async (readingRecordId: number, sessionId: string) => {
  try {
    const query = `
      SELECT * FROM likes 
      WHERE reading_record_id = $1 AND session_id = $2
    `;
    const result = await pool.query(query, [readingRecordId, sessionId]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Get like status error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export default pool; 
