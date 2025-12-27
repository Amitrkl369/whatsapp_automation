import express from 'express';

const router = express.Router();

// Get sheet data
router.get('/data', (req, res) => {
  res.json({
    success: true,
    message: 'Sheet data retrieved',
    data: [],
  });
});

// Sync with Google Sheets
router.post('/sync', (req, res) => {
  res.json({
    success: true,
    message: 'Sheet sync initiated',
  });
});

export default router;
