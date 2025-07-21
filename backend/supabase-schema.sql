-- 読書記録テーブルの作成
CREATE TABLE IF NOT EXISTS reading_records (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    link TEXT,
    reading_amount VARCHAR(50) NOT NULL,
    learning TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_reading_records_created_at ON reading_records(created_at);

-- 更新日時を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_reading_records_updated_at 
    BEFORE UPDATE ON reading_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入（テスト用）
INSERT INTO reading_records (title, link, reading_amount, learning, action) VALUES
('7つの習慣', 'https://www.amazon.co.jp/dp/ASIN/ref=nosim?tag=test', '1章', '人の話を聴くとは、同意することではない', '朝会で相手の話をさえぎらずに聞く'),
('星の王子さま', 'https://www.amazon.co.jp/dp/ASIN/ref=nosim?tag=test', '1段落', '大切なものは目に見えない', '家族との時間を大切にする'),
('嫌われる勇気', 'https://www.amazon.co.jp/dp/ASIN/ref=nosim?tag=test', '1文だけ', '過去は変えられないが、未来は変えられる', '今日から新しい習慣を始める')
ON CONFLICT DO NOTHING; 
