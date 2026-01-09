import pool from '../config/db.js';
import { errorResponse } from '../utils/errorResponse.js';

export const authenticateMerchant = async (req, res, next) => {
  const apiKey = req.header('X-Api-Key');
  const apiSecret = req.header('X-Api-Secret');

  if (!apiKey || !apiSecret) {
    return errorResponse(res, 401, "AUTHENTICATION_ERROR", "Invalid API credentials");
  }

  const result = await pool.query(
    `SELECT * FROM merchants WHERE api_key=$1 AND api_secret=$2 AND is_active=true`,
    [apiKey, apiSecret]
  );

  if (result.rowCount === 0) {
    return errorResponse(res, 401, "AUTHENTICATION_ERROR", "Invalid API credentials");
  }

  req.merchant = result.rows[0];
  next();
};
