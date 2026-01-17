import pool from '../config/db.js';

export const listWebhooks = async (req, res) => {
  const limit = parseInt(req.query.limit || '10');
  const offset = parseInt(req.query.offset || '0');

  const dataRes = await pool.query(
    `SELECT id, event, status, attempts, created_at,
            last_attempt_at, response_code
     FROM webhook_logs
     WHERE merchant_id=$1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [req.merchant.id, limit, offset]
  );

  const countRes = await pool.query(
    `SELECT COUNT(*) FROM webhook_logs WHERE merchant_id=$1`,
    [req.merchant.id]
  );

  return res.json({
    data: dataRes.rows,
    total: Number(countRes.rows[0].count),
    limit,
    offset
  });
};

export const retryWebhook = async (req, res) => {
  const { webhook_id } = req.params;

  const result = await pool.query(
    `UPDATE webhook_logs
     SET status='pending',
         attempts=0,
         next_retry_at=NOW()
     WHERE id=$1 AND merchant_id=$2
     RETURNING id`,
    [webhook_id, req.merchant.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Webhook not found' });
  }

  return res.json({
    id: webhook_id,
    status: 'pending',
    message: 'Webhook retry scheduled'
  });
};
