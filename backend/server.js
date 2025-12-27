import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/config.js';
import schedulerService from './services/schedulerService.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import sheetRoutes from './routes/sheetRoutes.js';
import schedulerRoutes from './routes/schedulerRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import csvRoutes from './routes/csvRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import dataRoutes from './routes/dataRoutes.js';

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sheet', sheetRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/csv', csvRoutes);
app.use('/api', webhookRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    },
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WhatsApp Automation API',
    version: '1.0.0',
    documentation: '/api',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, async () => {
  console.log('\n🚀 ================================================');
  console.log(`   WhatsApp Automation Server`);
  console.log('   ================================================');
  console.log(`   🌐 Server running on: http://localhost:${PORT}`);
  console.log(`   📝 Environment: ${config.nodeEnv}`);
  console.log(`   🕐 Started at: ${new Date().toLocaleString()}`);
  console.log('   ================================================\n');

  // Start scheduler
  await schedulerService.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️ SIGTERM received. Shutting down gracefully...');
  schedulerService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️ SIGINT received. Shutting down gracefully...');
  schedulerService.stop();
  process.exit(0);
});

export default app;
