import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload CSV
router.post('/upload', upload.single('file'), (req, res) => {
  res.json({
    success: true,
    message: 'CSV uploaded successfully',
    data: {
      filename: req.file?.filename,
    },
  });
});

export default router;
