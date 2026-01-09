import express from 'express';
import multer from 'multer';

const router = express.Router();

// Use memory storage for Vercel compatibility
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload CSV
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }
  
  res.json({
    success: true,
    message: 'CSV uploaded successfully',
    data: {
      filename: req.file.originalname,
      size: req.file.size,
    },
  });
});

export default router;
