import express from 'express';

const router = express.Router();

// Get settings
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      syncInterval: process.env.SYNC_INTERVAL_MINUTES || 5,
      checkInterval: process.env.CHECK_INTERVAL_MINUTES || 1,
    },
  });
});

// Update settings
router.put('/', (req, res) => {
  res.json({
    success: true,
    message: 'Settings updated',
  });
});

export default router;
