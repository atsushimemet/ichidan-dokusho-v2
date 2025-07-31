-- プロンプトテンプレートテーブルを作成
CREATE TABLE IF NOT EXISTS prompt_templates (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('fact', 'essay')),
    template_text TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_prompt_templates_user_id ON prompt_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_mode ON prompt_templates(mode);

-- ユーザーとモードの組み合わせでユニーク制約を追加
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_templates_user_mode_unique ON prompt_templates(user_id, mode);

-- デフォルトプロンプトテンプレートを挿入
INSERT INTO prompt_templates (user_id, mode, template_text, is_default) VALUES
('system', 'fact', '以下は「{themeName}」というテーマで蓄積した読書記録です。これらの記録から客観的なファクトを抽出し、整理してください。

{recordsText}

# 指示
- 客観的事実のみを抽出
- データや統計、専門家の見解を重視
- 個人的な感想や主観は除外
- 論理的で体系的な構成
- 引用元を明確に', TRUE),

('system', 'essay', '以下は「{themeName}」というテーマで蓄積した読書記録です。これらの記録から個人的な意見や洞察を抽出し、エッセイ形式で整理してください。

{recordsText}

# 指示
- 個人的な体験や感想を重視
- 主観的な洞察や気づきを表現
- ストーリー性のある構成
- 読者の共感を呼ぶ内容
- 具体的なエピソードを交える', TRUE);