import pool from '../config/db.js';

export const healthCheck = async (req, res) => {
  let dbStatus = "connected";
  try {
    await pool.query('SELECT 1');
  } catch {
    dbStatus = "disconnected";
  }

  return res.status(200).json({
    status: "healthy",
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
};
