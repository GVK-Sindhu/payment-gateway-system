import pool from '../config/db.js';

export const getCachedResponse = async (merchantId, key) => {
  const res = await pool.query(
    `SELECT response, expires_at
     FROM idempotency_keys
     WHERE merchant_id=$1 AND key=$2`,
    [merchantId, key]
  );

  if (res.rowCount === 0) return null;

  const record = res.rows[0];
  if (new Date(record.expires_at) < new Date()) {
    await pool.query(
      `DELETE FROM idempotency_keys WHERE merchant_id=$1 AND key=$2`,
      [merchantId, key]
    );
    return null;
  }

  return record.response;
};

export const saveResponse = async (merchantId, key, response) => {
  await pool.query(
    `INSERT INTO idempotency_keys (merchant_id, key, response, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')`,
    [merchantId, key, response]
  );
};







// const db = require('../config/db');

// async function getCachedResponse(merchantId, key) {
//   const result = await db.query(
//     `SELECT response, expires_at
//      FROM idempotency_keys
//      WHERE merchant_id = $1 AND key = $2`,
//     [merchantId, key]
//   );

//   if (result.rowCount === 0) return null;

//   const record = result.rows[0];

//   if (new Date(record.expires_at) < new Date()) {
//     await db.query(
//       `DELETE FROM idempotency_keys WHERE merchant_id = $1 AND key = $2`,
//       [merchantId, key]
//     );
//     return null;
//   }

//   return record.response;
// }

// async function saveResponse(merchantId, key, response) {
//   await db.query(
//     `INSERT INTO idempotency_keys (merchant_id, key, response, expires_at)
//      VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')`,
//     [merchantId, key, response]
//   );
// }

// module.exports = {
//   getCachedResponse,
//   saveResponse
// };
