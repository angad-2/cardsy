const { verifyToken } = require('../../utils/jwt');
const prisma = require('../../lib/prisma');

/**
 * Protect routes - Authentication Middleware
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired token. Please log in again.'
      });
    }

    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Grant access to protected route and attach user to req
    const { password: _, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect
};
