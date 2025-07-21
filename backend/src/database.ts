import { Pool } from 'pg';

// データベース接続プールの作成
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

// 全ての読書記録を取得（作成日時降順）
export const getAllReadingRecords = async () => {
  try {
    const query = `
      SELECT * FROM reading_records 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
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

export default pool; 
