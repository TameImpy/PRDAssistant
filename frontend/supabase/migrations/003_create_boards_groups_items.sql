-- Board Management tables for Monday.com replacement trial

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Groups table (sections within a board, e.g. "Backlog", "Sprint 1")
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Items table (individual work items within a group)
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'Working on it', 'Stuck', 'Waiting for review', 'Done')),
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  type text NOT NULL DEFAULT 'Story' CHECK (type IN ('Story', 'Bug', 'Spike', 'Epic')),
  team text NOT NULL DEFAULT '',
  estimate integer,
  dependencies text NOT NULL DEFAULT '',
  issue_description text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  due_date date,
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_groups_board_id ON groups(board_id);
CREATE INDEX idx_items_group_id ON items(group_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_owner ON items(owner);

-- Auto-update updated_at on items (reuses the function from migration 001)
CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
