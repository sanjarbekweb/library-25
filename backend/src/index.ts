import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import bookRoutes from './routes/book.routes';
import circulationRoutes from './routes/circulation.routes';
import reservationRoutes from './routes/reservation.routes';
import userRoutes from './routes/user.routes';
import feedbackRoutes from './routes/feedback.routes';
import historyRoutes from './routes/history.routes';
import analyticsRoutes from './routes/analytics.routes';
import contactRoutes from './routes/contact.routes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Public health route (before auth middleware)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Library Backend is running' });
});

app.use(clerkMiddleware());

// v1 API routes
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/circulation', circulationRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/contact', contactRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
