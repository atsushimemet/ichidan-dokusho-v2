import { Pool } from 'pg';

// データベース接続プールの作成
console.log('=== Database Connection Config ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('NODE_ENV:', process.env.NODE_ENV);
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
  notes?: string;
  is_not_book?: boolean;
  custom_link?: string;
  contains_spoiler?: boolean;
  user_id?: string;
  user_email?: string;
  theme_id?: number | null;
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
    // theme_idカラムの存在を確認
    const checkThemeIdQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reading_records' 
      AND column_name = 'theme_id'
    `;
    const themeIdCheck = await pool.query(checkThemeIdQuery);
    const hasThemeId = themeIdCheck.rows.length > 0;

    // カラムと値を動的に構築
    const columns = [
      'title', 'link', 'reading_amount', 'learning', 'action', 'notes', 
      'is_not_book', 'custom_link', 'contains_spoiler', 'user_id', 'user_email'
    ];
    const values: (string | boolean | undefined | null | number)[] = [
      record.title, 
      record.link, 
      record.reading_amount, 
      record.learning, 
      record.action, 
      record.notes, 
      record.is_not_book || false,
      record.custom_link,
      record.contains_spoiler || false,
      record.user_id, 
      record.user_email
    ];

    // theme_idカラムが存在する場合は追加
    if (hasThemeId) {
      columns.push('theme_id');
      values.push(record.theme_id || null);
    }

    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const query = `
      INSERT INTO reading_records (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

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
        CASE WHEN $1::text IS NOT NULL AND $1::text != '' AND EXISTS (
          SELECT 1 FROM likes 
          WHERE reading_record_id = r.id AND session_id = $1::text
        ) THEN true ELSE false END as is_liked
      FROM reading_records r
      LEFT JOIN likes l ON r.id = l.reading_record_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [sessionId || null]);
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

// ユーザー固有の読書記録を取得（マイページ用）
export const getUserReadingRecords = async (userId: string, sessionId?: string) => {
  try {
    const query = `
      SELECT 
        r.*,
        COUNT(l.id) as like_count,
        CASE WHEN $2::text IS NOT NULL AND $2::text != '' AND EXISTS (
          SELECT 1 FROM likes 
          WHERE reading_record_id = r.id AND session_id = $2::text
        ) THEN true ELSE false END as is_liked
      FROM reading_records r
      LEFT JOIN likes l ON r.id = l.reading_record_id
      WHERE r.user_id = $1
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [userId, sessionId || null]);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Get user reading records error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 過去の読書記録をタイトルで検索
export const searchReadingRecordsByTitle = async (searchTerm: string, limit: number = 10) => {
  try {
    const query = `
      SELECT DISTINCT ON (title) title, link, is_not_book, custom_link, created_at
      FROM reading_records 
      WHERE title ILIKE $1
      ORDER BY title, created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [`%${searchTerm}%`, limit]);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Search reading records error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// ユーザー設定の型定義
export interface UserSettings {
  id?: number;
  user_id: string;
  hide_spoilers: boolean;
  draft_threshold?: number;
  created_at?: string;
  updated_at?: string;
}

// 書きたいテーマの型定義
export interface WritingTheme {
  id?: number;
  user_id: string;
  theme_name: string;
  created_at?: string;
  updated_at?: string;
}

// テーマ別統計の型定義
export interface ThemeStats {
  theme_id: number | null;
  theme_name: string;
  total_records: number;
  daily_stats: Array<{
    date: string;
    count: number;
  }>;
}

// ユーザー設定を取得
export const getUserSettings = async (userId: string) => {
  try {
    const query = `
      SELECT * FROM user_settings 
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length > 0) {
      return { success: true, data: result.rows[0] };
    } else {
      // デフォルト設定を返す
      return { 
        success: true, 
        data: { 
          user_id: userId, 
          hide_spoilers: false,
          draft_threshold: 5
        } 
      };
    }
  } catch (error) {
    console.error('Get user settings error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// ユーザー設定を更新または作成
export const upsertUserSettings = async (settings: UserSettings) => {
  try {
    // draft_thresholdカラムの存在を確認
    const checkDraftThresholdQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' 
      AND column_name = 'draft_threshold'
    `;
    const draftThresholdCheck = await pool.query(checkDraftThresholdQuery);
    const hasDraftThreshold = draftThresholdCheck.rows.length > 0;

    let query: string;
    let values: any[];

    if (hasDraftThreshold) {
      query = `
        INSERT INTO user_settings (user_id, hide_spoilers, draft_threshold)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          hide_spoilers = EXCLUDED.hide_spoilers,
          draft_threshold = EXCLUDED.draft_threshold,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      values = [settings.user_id, settings.hide_spoilers, settings.draft_threshold || 5];
    } else {
      query = `
        INSERT INTO user_settings (user_id, hide_spoilers)
        VALUES ($1, $2)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          hide_spoilers = EXCLUDED.hide_spoilers,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      values = [settings.user_id, settings.hide_spoilers];
    }

    const result = await pool.query(query, values);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Upsert user settings error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 書きたいテーマを作成
export const createWritingTheme = async (theme: WritingTheme) => {
  try {
    const query = `
      INSERT INTO writing_themes (user_id, theme_name)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [theme.user_id, theme.theme_name];
    const result = await pool.query(query, values);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Create writing theme error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// ユーザーの書きたいテーマ一覧を取得
export const getUserWritingThemes = async (userId: string) => {
  try {
    const query = `
      SELECT * FROM writing_themes 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Get user writing themes error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 書きたいテーマを更新
export const updateWritingTheme = async (id: number, userId: string, themeName: string) => {
  try {
    const query = `
      UPDATE writing_themes 
      SET theme_name = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [themeName, id, userId]);
    
    if (result.rows.length === 0) {
      return { success: false, error: 'Theme not found or unauthorized' };
    }
    
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Update writing theme error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 書きたいテーマを削除
export const deleteWritingTheme = async (id: number, userId: string) => {
  try {
    const query = `
      DELETE FROM writing_themes 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      return { success: false, error: 'Theme not found or unauthorized' };
    }
    
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Delete writing theme error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// テーマ別読書記録統計を取得
export const getThemeBasedReadingStats = async (userId: string, themeId?: number) => {
  try {
    // theme_idカラムの存在を確認
    const checkThemeIdQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reading_records' 
      AND column_name = 'theme_id'
    `;
    const themeIdCheck = await pool.query(checkThemeIdQuery);
    const hasThemeId = themeIdCheck.rows.length > 0;

    // theme_idカラムが存在しない場合は、全レコードの統計を返す
    if (!hasThemeId) {
      const query = `
        SELECT 
          NULL as theme_id,
          '未分類' as theme_name,
          COUNT(r.id) as total_records
        FROM reading_records r
        WHERE r.user_id = $1
        ORDER BY total_records DESC
      `;
      const result = await pool.query(query, [userId]);
      return { success: true, data: result.rows };
    }

    // theme_idカラムが存在する場合の元のロジック
    const themeCondition = themeId ? 'AND r.theme_id = $2' : '';
    const queryParams = themeId ? [userId, themeId] : [userId];
    
    const query = `
      SELECT 
        wt.id as theme_id,
        COALESCE(wt.theme_name, '未分類') as theme_name,
        COUNT(r.id) as total_records
      FROM writing_themes wt
      LEFT JOIN reading_records r ON wt.id = r.theme_id AND r.user_id = $1
      WHERE wt.user_id = $1
      ${themeCondition}
      GROUP BY wt.id, wt.theme_name
      
      UNION ALL
      
      SELECT 
        NULL as theme_id,
        '未分類' as theme_name,
        COUNT(r.id) as total_records
      FROM reading_records r
      WHERE r.user_id = $1 AND r.theme_id IS NULL
      ${themeCondition}
      
      ORDER BY total_records DESC
    `;
    
    const result = await pool.query(query, queryParams);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Get theme-based reading stats error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 日次テーマ別読書記録推移を取得
export const getDailyThemeReadingTrends = async (userId: string, themeId?: number, days: number = 30) => {
  try {
    // theme_idカラムの存在を確認
    const checkThemeIdQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reading_records' 
      AND column_name = 'theme_id'
    `;
    const themeIdCheck = await pool.query(checkThemeIdQuery);
    const hasThemeId = themeIdCheck.rows.length > 0;

    // theme_idカラムが存在しない場合は、全レコードの日次統計を返す
    if (!hasThemeId) {
      const query = `
        WITH date_series AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '${days - 1} days',
            CURRENT_DATE,
            '1 day'::interval
          )::date AS date
        ),
        daily_counts AS (
          SELECT 
            DATE(r.created_at) as date,
            COUNT(*) as count
          FROM reading_records r
          WHERE r.user_id = $1 
            AND DATE(r.created_at) >= CURRENT_DATE - INTERVAL '${days - 1} days'
          GROUP BY DATE(r.created_at)
        )
        SELECT 
          ds.date,
          COALESCE(dc.count, 0) as count
        FROM date_series ds
        LEFT JOIN daily_counts dc ON ds.date = dc.date
        ORDER BY ds.date
      `;
      const result = await pool.query(query, [userId]);
      return { success: true, data: result.rows };
    }

    // theme_idカラムが存在する場合の元のロジック
    let query: string;
    let queryParams: any[];
    
    if (themeId) {
      query = `
        WITH date_series AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '${days - 1} days',
            CURRENT_DATE,
            '1 day'::interval
          )::date AS date
        ),
        daily_counts AS (
          SELECT 
            DATE(r.created_at) as date,
            COUNT(*) as count
          FROM reading_records r
          WHERE r.user_id = $1 
            AND DATE(r.created_at) >= CURRENT_DATE - INTERVAL '${days - 1} days'
            AND r.theme_id = $2
          GROUP BY DATE(r.created_at)
        )
        SELECT 
          ds.date,
          COALESCE(dc.count, 0) as count
        FROM date_series ds
        LEFT JOIN daily_counts dc ON ds.date = dc.date
        ORDER BY ds.date
      `;
      queryParams = [userId, themeId];
    } else {
      query = `
        WITH date_series AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '${days - 1} days',
            CURRENT_DATE,
            '1 day'::interval
          )::date AS date
        ),
        daily_counts AS (
          SELECT 
            DATE(r.created_at) as date,
            COUNT(*) as count
          FROM reading_records r
          WHERE r.user_id = $1 
            AND DATE(r.created_at) >= CURRENT_DATE - INTERVAL '${days - 1} days'
            AND r.theme_id IS NULL
          GROUP BY DATE(r.created_at)
        )
        SELECT 
          ds.date,
          COALESCE(dc.count, 0) as count
        FROM date_series ds
        LEFT JOIN daily_counts dc ON ds.date = dc.date
        ORDER BY ds.date
      `;
      queryParams = [userId];
    }
    
    const result = await pool.query(query, queryParams);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Get daily theme reading trends error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 全テーマの累積統計を取得（プルダウン表示用）
export const getAllThemeReadingStats = async (userId: string) => {
  try {
    // theme_idカラムの存在を確認
    const checkThemeIdQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reading_records' 
      AND column_name = 'theme_id'
    `;
    const themeIdCheck = await pool.query(checkThemeIdQuery);
    const hasThemeId = themeIdCheck.rows.length > 0;

    // theme_idカラムが存在しない場合は、全レコードの統計を返す
    if (!hasThemeId) {
      const query = `
        SELECT 
          NULL as theme_id,
          '未分類' as theme_name,
          COUNT(r.id) as total_records
        FROM reading_records r
        WHERE r.user_id = $1
        ORDER BY total_records DESC
      `;
      const result = await pool.query(query, [userId]);
      return { success: true, data: result.rows };
    }

    // theme_idカラムが存在する場合の元のロジック
    const query = `
      SELECT 
        wt.id as theme_id,
        wt.theme_name,
        COUNT(r.id) as total_records
      FROM writing_themes wt
      LEFT JOIN reading_records r ON wt.id = r.theme_id AND r.user_id = $1
      WHERE wt.user_id = $1
      GROUP BY wt.id, wt.theme_name
      
      UNION ALL
      
      SELECT 
        NULL as theme_id,
        '未分類' as theme_name,
        COUNT(r.id) as total_records
      FROM reading_records r
      WHERE r.user_id = $1 AND r.theme_id IS NULL
      
      ORDER BY total_records DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Get all theme reading stats error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export default pool; 
