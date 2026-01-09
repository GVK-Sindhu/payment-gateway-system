import express from 'express';
import cors from 'cors';

import healthRoutes from './routes/health.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import testRoutes from './routes/test.routes.js';
import publicRoutes from './routes/public.routes.js';
import statsRoutes from "./routes/stats.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Api-Key', 'X-Api-Secret']
}));


app.use(express.json());

app.use(healthRoutes);
app.use(paymentRoutes);
app.use(testRoutes);
app.use('/api/v1', orderRoutes);
app.use('/api/v1', paymentRoutes);
app.use('/api/v1', publicRoutes);
app.use("/api/v1", statsRoutes);
app.use("/api/v1", transactionsRoutes);

export default app;
