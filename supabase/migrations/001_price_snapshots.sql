CREATE TABLE IF NOT EXISTS price_snapshots (
  id bigserial PRIMARY KEY,
  store text NOT NULL,
  query_hash char(8) NOT NULL,
  product_name text,
  price_cents integer NOT NULL,
  url text,
  scraped_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ps_lookup ON price_snapshots (query_hash, store, scraped_at DESC);

-- Requiere extensión pg_cron habilitada en Dashboard → Extensions
SELECT cron.schedule(
  'purge-snapshots',
  '0 3 * * *',
  $$ DELETE FROM price_snapshots WHERE scraped_at < NOW() - INTERVAL '30 days' $$
);
