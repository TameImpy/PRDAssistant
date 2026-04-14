-- Create requests table for the Open Requests queue
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tickets jsonb NOT NULL,
  conversation_transcript jsonb NOT NULL,
  submitted_by_name text NOT NULL,
  submitted_by_email text NOT NULL,
  requested_by text NOT NULL,
  team text NOT NULL,
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Rejected', 'Submitted to Backlog')),
  rejection_reason text,
  monday_item_ids jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create analysts table for access control
CREATE TABLE IF NOT EXISTS analysts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for filtering requests by status (most common query)
CREATE INDEX idx_requests_status ON requests(status);

-- Index for analyst email lookups
CREATE INDEX idx_analysts_email ON analysts(email);

-- Auto-update updated_at on requests
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
