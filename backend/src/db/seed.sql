-- =========================
-- SEED TEST MERCHANT
-- =========================

INSERT INTO merchants (
  id,
  name,
  email,
  api_key,
  api_secret,
  webhook_url,
  webhook_secret,
  is_active,
  created_at,
  updated_at
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Test Merchant',
  'test@example.com',
  'key_test_abc123',
  'secret_test_xyz789',
  NULL,
  'whsec_test_abc123',
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;
