import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { EventInfo } from './models/EventInfo.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Core Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Clerk Middleware (attaches auth context if configured)
if (process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.startsWith('sk_test_...')) {
  app.use(clerkMiddleware());
}

// 3. Health & Public Info Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'codathon-portal-api',
  });
});

//  // Event Details
//   const eventStatusFormat = eventInfo?.eventFormat;
//   const eventDates = eventInfo?.eventDates;
//   const venueName = eventInfo?.venue;
//   const locationCity = eventInfo?.location;


// Public Event Info endpoint (Spec §7)
app.get('/api/event-info', async (req, res, next) => {
  try {
    const event = await EventInfo.getSingleton();
    res.status(200).json({
      timeline: event.timeline,
      prizePool: event.prizePool,
      location: event.location,
      venue: event.venue,
      eventFormat: event.eventFormat,
      eventDates: event.eventDates,
      updatedAt: event.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

// 4. Feature Routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);

// 5. Global Error Handler
app.use(errorHandler);

// 6. Connect to DB and Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
});

export default app;
