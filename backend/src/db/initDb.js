import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';

export const initDb = async () => {
  try {
    const schemaPath = path.join(process.cwd(), 'src/db/schema.sql');
    const seedPath = path.join(process.cwd(), 'src/db/seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    const seedSql = fs.readFileSync(seedPath, 'utf-8');

    console.log('Initializing database schema...');
    await pool.query(schemaSql);

    console.log('Seeding test merchant...');
    await pool.query(seedSql);

    console.log('Database ready');
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
};

export default initDb;
