import app from './app.js';
import { initDb } from './db/initDb.js';

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await initDb();

  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
};

startServer();
