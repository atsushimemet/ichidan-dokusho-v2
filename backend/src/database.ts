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
  action?: string;
  notes?: string;
  is_not_book?: boolean;
  custom_link?: string;

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
      'is_not_book', 'custom_link', 'user_id', 'user_email'
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

// テーマ別の読書記録を取得
export const getThemeReadingRecords = async (userId: string, themeId: number) => {
  try {
    const query = `
      SELECT 
        r.id,
        r.title,
        r.link,
        r.reading_amount,
        r.learning,
        r.action,
        r.notes,
        r.created_at,
        r.updated_at
      FROM reading_records r
      WHERE r.user_id = $1 AND r.theme_id = $2
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [userId, themeId]);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Get theme reading records error:', error);
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

// 読みたいものリストの型定義
export interface ReadingWishlistItem {
  id?: number;
  user_id: string;
  title: string;
  link?: string;
  is_not_book?: boolean;
  created_at?: string;
  updated_at?: string;
}

// プロンプトテンプレートの型定義
export interface PromptTemplate {
  id?: number;
  user_id: string;
  mode: 'fact' | 'essay';
  template_text: string;
  is_default?: boolean;
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
        INSERT INTO user_settings (user_id, draft_threshold)
        VALUES ($1, $2)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          draft_threshold = EXCLUDED.draft_threshold,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      values = [settings.user_id, settings.draft_threshold || 5];
    } else {
      query = `
        INSERT INTO user_settings (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      values = [settings.user_id];
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

// プロンプトテンプレートを取得
export const getUserPromptTemplates = async (userId: string) => {
  try {
    const query = `
      SELECT * FROM prompt_templates 
      WHERE user_id = $1 OR (user_id = 'system' AND is_default = true)
      ORDER BY user_id DESC, mode ASC
    `;
    const result = await pool.query(query, [userId]);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Get user prompt templates error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// プロンプトテンプレートを作成/更新
export const upsertPromptTemplate = async (template: PromptTemplate) => {
  try {
    const query = `
      INSERT INTO prompt_templates (user_id, mode, template_text, is_default)
      VALUES ($1, $2, $3, false)
      ON CONFLICT (user_id, mode) 
      DO UPDATE SET 
        template_text = EXCLUDED.template_text,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [
      template.user_id,
      template.mode,
      template.template_text
    ]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Upsert prompt template error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 特定のプロンプトテンプレートを取得
export const getPromptTemplate = async (userId: string, mode: 'fact' | 'essay') => {
  try {
    // ユーザー固有のテンプレートを優先して検索
    const query = `
      SELECT * FROM prompt_templates 
      WHERE (user_id = $1 OR (user_id = 'system' AND is_default = true))
      AND mode = $2
      ORDER BY user_id DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [userId, mode]);
    
    if (result.rows.length > 0) {
      return { success: true, data: result.rows[0] };
    } else {
      return { success: false, error: 'Template not found' };
    }
  } catch (error) {
    console.error('Get prompt template error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// プロンプトテンプレートを削除（デフォルトに戻す）
export const deleteUserPromptTemplate = async (userId: string, mode: 'fact' | 'essay') => {
  try {
    const query = `
      DELETE FROM prompt_templates 
      WHERE user_id = $1 AND mode = $2 AND is_default = false
      RETURNING *
    `;
    const result = await pool.query(query, [userId, mode]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Delete user prompt template error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// ========================================
// 読みたいものリスト関連の関数
// ========================================

// 読みたいものリストを作成
export const createWishlistItem = async (item: ReadingWishlistItem) => {
  try {
    const query = `
      INSERT INTO reading_wishlist (user_id, title, link, is_not_book)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [item.user_id, item.title, item.link || null, item.is_not_book || false];
    const result = await pool.query(query, values);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Create wishlist item error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// ユーザーの読みたいものリストを取得
export const getUserWishlistItems = async (userId: string) => {
  try {
    const query = `
      SELECT * FROM reading_wishlist 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Get user wishlist items error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 読みたいものリストアイテムを削除
export const deleteWishlistItem = async (itemId: number, userId: string) => {
  try {
    const query = `
      DELETE FROM reading_wishlist 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [itemId, userId]);
    if (result.rows.length === 0) {
      return { success: false, error: 'Item not found or unauthorized' };
    }
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Delete wishlist item error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 読みたいものリストアイテムを更新
export const updateWishlistItem = async (itemId: number, userId: string, updates: Partial<ReadingWishlistItem>) => {
  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.link !== undefined) {
      fields.push(`link = $${paramIndex++}`);
      values.push(updates.link);
    }
    if (updates.is_not_book !== undefined) {
      fields.push(`is_not_book = $${paramIndex++}`);
      values.push(updates.is_not_book);
    }

    if (fields.length === 0) {
      return { success: false, error: 'No fields to update' };
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(itemId, userId);

    const query = `
      UPDATE reading_wishlist 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return { success: false, error: 'Item not found or unauthorized' };
    }
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Update wishlist item error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 書籍の型定義
export interface Book {
  id?: number;
  title: string;
  amazon_link: string;
  summary_link1?: string | null;
  summary_link2?: string | null;
  summary_link3?: string | null;
  created_at?: string;
  updated_at?: string;
}

// タグの型定義
export interface Tag {
  id?: number;
  name: string;
  created_at?: string;
}

// 書籍とタグの関連情報を含む型
export interface BookWithTags extends Book {
  tags: Tag[];
}

// 書籍を作成
export const createBook = async (bookData: { 
  title: string; 
  amazon_link: string; 
  tags: string[];
  summary_link1?: string | null;
  summary_link2?: string | null;
  summary_link3?: string | null;
}) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 書籍を作成
    const bookQuery = `
      INSERT INTO books (title, amazon_link, summary_link1, summary_link2, summary_link3)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const bookResult = await client.query(bookQuery, [
      bookData.title, 
      bookData.amazon_link,
      bookData.summary_link1,
      bookData.summary_link2,
      bookData.summary_link3
    ]);
    const book = bookResult.rows[0];

    // タグを処理
    if (bookData.tags && bookData.tags.length > 0) {
      for (const tagName of bookData.tags) {
        // タグが存在しない場合は作成
        const tagQuery = `
          INSERT INTO tags (name) 
          VALUES ($1) 
          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `;
        const tagResult = await client.query(tagQuery, [tagName.trim()]);
        const tagId = tagResult.rows[0].id;

        // 書籍とタグを関連付け
        const bookTagQuery = `
          INSERT INTO book_tags (book_id, tag_id)
          VALUES ($1, $2)
          ON CONFLICT (book_id, tag_id) DO NOTHING
        `;
        await client.query(bookTagQuery, [book.id, tagId]);
      }
    }

    await client.query('COMMIT');
    return { success: true, data: book };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create book error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  } finally {
    client.release();
  }
};

// 全ての書籍を取得（タグ付き）
export const getAllBooks = async () => {
  try {
    const query = `
      SELECT 
        b.*,
        COALESCE(
          json_agg(
            json_build_object('id', t.id, 'name', t.name, 'created_at', t.created_at)
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as tags
      FROM books b
      LEFT JOIN book_tags bt ON b.id = bt.book_id
      LEFT JOIN tags t ON bt.tag_id = t.id
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `;
    const result = await pool.query(query);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Get books error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 書籍を更新
export const updateBook = async (id: number, bookData: { title?: string; amazon_link?: string; tags?: string[]; summary_link1?: string | null; summary_link2?: string | null; summary_link3?: string | null; }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 書籍が存在するかチェック
    const checkQuery = 'SELECT id FROM books WHERE id = $1';
    const checkResult = await client.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Book not found' };
    }

    // 書籍の基本情報を更新
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (bookData.title !== undefined) {
      updateFields.push(`title = $${paramCount}`);
      updateValues.push(bookData.title);
      paramCount++;
    }

    if (bookData.amazon_link !== undefined) {
      updateFields.push(`amazon_link = $${paramCount}`);
      updateValues.push(bookData.amazon_link);
      paramCount++;
    }

    if (bookData.summary_link1 !== undefined) {
      updateFields.push(`summary_link1 = $${paramCount}`);
      updateValues.push(bookData.summary_link1);
      paramCount++;
    }

    if (bookData.summary_link2 !== undefined) {
      updateFields.push(`summary_link2 = $${paramCount}`);
      updateValues.push(bookData.summary_link2);
      paramCount++;
    }

    if (bookData.summary_link3 !== undefined) {
      updateFields.push(`summary_link3 = $${paramCount}`);
      updateValues.push(bookData.summary_link3);
      paramCount++;
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      const bookQuery = `
        UPDATE books 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;
      await client.query(bookQuery, updateValues);
    }

    // タグを更新（提供された場合）
    if (bookData.tags !== undefined) {
      // 既存のタグ関連を削除
      const deleteTagsQuery = 'DELETE FROM book_tags WHERE book_id = $1';
      await client.query(deleteTagsQuery, [id]);

      // 新しいタグを追加
      if (bookData.tags.length > 0) {
        for (const tagName of bookData.tags) {
          // タグが存在しない場合は作成
          const tagQuery = `
            INSERT INTO tags (name) 
            VALUES ($1) 
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
          `;
          const tagResult = await client.query(tagQuery, [tagName.trim()]);
          const tagId = tagResult.rows[0].id;

          // 書籍とタグを関連付け
          const bookTagQuery = `
            INSERT INTO book_tags (book_id, tag_id)
            VALUES ($1, $2)
            ON CONFLICT (book_id, tag_id) DO NOTHING
          `;
          await client.query(bookTagQuery, [id, tagId]);
        }
      }
    }

    // 更新された書籍とタグを取得
    const getUpdatedBookQuery = `
      SELECT 
        b.*,
        COALESCE(
          json_agg(
            CASE 
              WHEN t.id IS NOT NULL THEN json_build_object('id', t.id, 'name', t.name, 'created_at', t.created_at)
              ELSE NULL 
            END
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'::json
        ) as tags
      FROM books b
      LEFT JOIN book_tags bt ON b.id = bt.book_id
      LEFT JOIN tags t ON bt.tag_id = t.id
      WHERE b.id = $1
      GROUP BY b.id, b.title, b.amazon_link, b.created_at, b.updated_at
    `;
    const updatedBookResult = await client.query(getUpdatedBookQuery, [id]);

    await client.query('COMMIT');
    return { success: true, data: updatedBookResult.rows[0] };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update book error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  } finally {
    client.release();
  }
};

// 書籍を削除
export const deleteBook = async (id: number) => {
  try {
    const query = 'DELETE FROM books WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return { success: false, error: 'Book not found' };
    }
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Delete book error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 全てのタグを取得
export const getAllTags = async () => {
  try {
    const query = 'SELECT * FROM tags ORDER BY name ASC';
    const result = await pool.query(query);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Get tags error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// タグ名で書籍を取得
export const getBooksByTagName = async (tagName: string) => {
  try {
    const query = `
      SELECT 
        b.*,
        COALESCE(
          json_agg(
            json_build_object('id', t.id, 'name', t.name, 'created_at', t.created_at)
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as tags
      FROM books b
      LEFT JOIN book_tags bt ON b.id = bt.book_id
      LEFT JOIN tags t ON bt.tag_id = t.id
      WHERE b.id IN (
        SELECT DISTINCT b2.id 
        FROM books b2
        JOIN book_tags bt2 ON b2.id = bt2.book_id
        JOIN tags t2 ON bt2.tag_id = t2.id
        WHERE t2.name = $1
      )
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `;
    const result = await pool.query(query, [tagName]);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Get books by tag error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export default pool; 
