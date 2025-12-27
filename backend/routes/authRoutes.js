import express from 'express';

const router = express.Router();

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple authentication check (replace with proper auth in production)
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: 'mock-jwt-token', // Replace with actual JWT
        user: { email },
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }
});

export default router;
