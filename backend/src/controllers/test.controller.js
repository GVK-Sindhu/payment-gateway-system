import pool from '../config/db.js';

export const getTestMerchant = async (req, res) => {
  const result = await pool.query(
    `SELECT id, email, api_key FROM merchants WHERE email='test@example.com'`
  );

  if (result.rowCount === 0) {
    return res.status(404).json({});
  }

  return res.status(200).json({
    ...result.rows[0],
    seeded: true
  });
};
