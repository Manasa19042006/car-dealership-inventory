import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './auth/auth.routes';
import { authenticate } from './middleware/authenticate';

const app: Application = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Car Dealership API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Test Protected Route (used by middleware tests only) ─────────────────────
// This route exists solely to verify the authenticate middleware works.
// It is safe to keep in production — it simply reflects the authenticated user.
app.get('/api/test/protected', authenticate, (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'You are authenticated.',
    data: {
      userId: req.user?.userId,
      role: req.user?.role,
    },
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

export default app;
