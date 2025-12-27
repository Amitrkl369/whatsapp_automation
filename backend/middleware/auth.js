export const authenticateToken = (req, res, next) => {
  // Simple mock authentication - replace with actual JWT verification in production
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  // In production, verify JWT token here
  // For now, just pass through
  next();
};
