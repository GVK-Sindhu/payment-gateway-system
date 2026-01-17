-- =========================================================
-- Deliverable 2 Database Schema Updates
-- Location: backend/src/db/migrations/002_deliverable_2_schema.sql
-- =========================================================

-- ---------------------------------------------------------
-- 1. REFUNDS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS refunds (
  id VARCHAR(64) PRIMARY KEY,
  payment_id VARCHAR(64) NOT NULL,
  merchant_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT fk_refunds_payment
    FOREIGN KEY (payment_id)
    REFERENCES payments(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_refunds_merchant
    FOREIGN KEY (merchant_id)
    REFERENCES merchants(id)
    ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 2. WEBHOOK LOGS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  event VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  response_code INTEGER,
  response_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_webhook_logs_merchant
    FOREIGN KEY (merchant_id)
    REFERENCES merchants(id)
    ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 3. IDEMPOTENCY KEYS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key VARCHAR(255) NOT NULL,
  merchant_id UUID NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  PRIMARY KEY (key, merchant_id),

  CONSTRAINT fk_idempotency_keys_merchant
    FOREIGN KEY (merchant_id)
    REFERENCES merchants(id)
    ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 4. MODIFY MERCHANTS TABLE (ADD WEBHOOK SECRET)
-- ---------------------------------------------------------
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS webhook_secret VARCHAR(64);

-- ---------------------------------------------------------
-- 5. UPDATE TEST MERCHANT WEBHOOK SECRET
-- ---------------------------------------------------------
UPDATE merchants
SET webhook_secret = 'whsec_test_abc123'
WHERE email = 'test@example.com';

-- ---------------------------------------------------------
-- 6. REQUIRED INDEXES
-- ---------------------------------------------------------

-- Index for refund lookups by payment
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id
ON refunds(payment_id);

-- Index for webhook lookups by merchant
CREATE INDEX IF NOT EXISTS idx_webhook_logs_merchant_id
ON webhook_logs(merchant_id);

-- Index for webhook status filtering
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status
ON webhook_logs(status);

-- Partial index for retry scheduling
CREATE INDEX IF NOT EXISTS idx_webhook_logs_next_retry_pending
ON webhook_logs(next_retry_at)
WHERE status = 'pending';

-- ---------------------------------------------------------
-- 7. PAYMENTS TABLE UPDATE (REQUIRED FOR DELIVERABLE 2)
-- ---------------------------------------------------------
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS captured BOOLEAN DEFAULT false;
