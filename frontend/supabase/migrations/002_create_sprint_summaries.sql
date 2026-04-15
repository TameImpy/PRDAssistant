-- Create sprint_summaries table for caching AI-generated summaries
CREATE TABLE IF NOT EXISTS sprint_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_group_name text UNIQUE NOT NULL,
  done_item_names jsonb NOT NULL,
  summary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for sprint group name lookups
CREATE INDEX idx_sprint_summaries_group_name ON sprint_summaries(sprint_group_name);
