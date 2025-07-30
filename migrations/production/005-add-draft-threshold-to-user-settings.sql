-- Add draft_threshold column to user_settings table
ALTER TABLE user_settings 
ADD COLUMN draft_threshold INTEGER DEFAULT 5;

-- Add comment to document the column
COMMENT ON COLUMN user_settings.draft_threshold IS 'Number of records required per theme to enable draft output feature';