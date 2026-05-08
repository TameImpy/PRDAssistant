-- Create edit_logs table for UC-005 learning loop
CREATE TABLE IF NOT EXISTS edit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  question_id text NOT NULL,
  original_text text NOT NULL,
  edited_text text NOT NULL,
  edit_type text NOT NULL CHECK (edit_type IN ('question_text', 'answer_option', 'question_type', 'reorder', 'add_question', 'delete_question')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for session lookups (most common query pattern)
CREATE INDEX idx_edit_logs_session_id ON edit_logs(session_id);

-- Index for question-level analysis
CREATE INDEX idx_edit_logs_question_id ON edit_logs(question_id);
