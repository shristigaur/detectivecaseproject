import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import policyRoutes from './routes/policy.js';
import logRoutes from './routes/logs.js';
import authMiddleware from './middleware/authMiddleware.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '16kb' }));
app.use('/api/auth', authRoutes);
app.use('/api/policy', authMiddleware, policyRoutes);
app.use('/api/logs', authMiddleware, logRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sdg')
    .then(() => app.listen(port, () => console.log(`Sensitive Data Guard API listening on ${port}`)))
    .catch((error) => {
      console.error('MongoDB connection failed:', error.message);
      process.exit(1);
    });
}

export default app;
