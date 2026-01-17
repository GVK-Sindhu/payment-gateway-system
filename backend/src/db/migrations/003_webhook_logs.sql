CREATE TABLE IF NOT EXISTS webhook_logs (
  id SERIAL PRIMARY KEY,
  merchant_id INTEGER NOT NULL,
  event VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  response_code INTEGER,
  last_attempt_at TIMESTAMP,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_webhook_merchant
    FOREIGN KEY (merchant_id)
    REFERENCES merchants(id)
    ON DELETE CASCADE
);
