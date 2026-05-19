const express = require('express');
const authController = require('./auth_controller');
const { validateLogin, validateRegister } = require('./auth_validation');
const { protect } = require('./auth_middleware');

const router = express.Router();

// Public routes
router.post('/login', validateLogin, (req, res, next) => authController.login(req, res, next));
router.post('/register', validateRegister, (req, res, next) => authController.register(req, res, next));

// Protected route to test JWT authenticator
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

module.exports = router;
