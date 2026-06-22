CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  product_url TEXT NOT NULL,
  product_name TEXT NOT NULL,
  last_known_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  UNIQUE (email, product_url)
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_active
  ON price_alerts (email)
  WHERE unsubscribed_at IS NULL;

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Only the service role (API routes) may access this table.
-- No public policy is created intentionally.
