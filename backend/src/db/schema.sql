-- =========================
-- ENABLE UUID EXTENSION
-- =========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- MERCHANTS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  api_key VARCHAR(64) NOT NULL UNIQUE,
  api_secret VARCHAR(64) NOT NULL,
  webhook_url TEXT,
  webhook_secret VARCHAR(64),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- ORDERS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  merchant_id UUID NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 100),
  currency VARCHAR(3) DEFAULT 'INR',
  receipt VARCHAR(255),
  notes JSONB,
  status VARCHAR(20) DEFAULT 'created',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_merchant
    FOREIGN KEY (merchant_id)
    REFERENCES merchants(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_merchant_id
  ON orders(merchant_id);

-- =========================
-- PAYMENTS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  merchant_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  method VARCHAR(20) NOT NULL CHECK (method IN ('upi', 'card')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'success', 'failed')),
  vpa VARCHAR(255),
  card_network VARCHAR(20),
  card_last4 VARCHAR(4),
  error_code VARCHAR(50),
  error_description TEXT,
  captured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_payments_merchant
    FOREIGN KEY (merchant_id)
    REFERENCES merchants(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id
  ON payments(order_id);

CREATE INDEX IF NOT EXISTS idx_payments_status
  ON payments(status);

-- =========================
-- REFUNDS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS refunds (
  id VARCHAR(64) PRIMARY KEY,
  payment_id VARCHAR(64) NOT NULL
    REFERENCES payments(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL
    REFERENCES merchants(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id
  ON refunds(payment_id);

-- =========================
-- WEBHOOK LOGS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL
    REFERENCES merchants(id) ON DELETE CASCADE,
  event VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'success', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  response_code INTEGER,
  response_body TEXT,
  last_attempt_at TIMESTAMP,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_merchant_id
  ON webhook_logs(merchant_id);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_status
  ON webhook_logs(status);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_next_retry
  ON webhook_logs(next_retry_at)
  WHERE status = 'pending';

-- =========================
-- IDEMPOTENCY KEYS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key VARCHAR(255) NOT NULL,
  merchant_id UUID NOT NULL
    REFERENCES merchants(id) ON DELETE CASCADE,
  response JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  PRIMARY KEY (key, merchant_id)
);
