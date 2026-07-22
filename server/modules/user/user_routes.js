const express = require('express');
const controller = require('./user_controller');
const { protect } = require('../auth/auth_middleware');
const asyncHandler = require('../../utils/async_handler');
const { fail } = require('../../utils/response');

const router = express.Router();

// Everything here requires a logged-in user.
router.use(protect);

router.get('/me', asyncHandler((req, res) => controller.me(req, res)));
router.get('/dashboard', asyncHandler((req, res) => controller.dashboard(req, res)));
router.get('/decks', asyncHandler((req, res) => controller.myDecks(req, res)));
router.get('/activity', asyncHandler((req, res) => controller.activity(req, res)));
router.put('/avatar', asyncHandler((req, res) => controller.changeAvatar(req, res)));
router.put('/profile', asyncHandler((req, res) => controller.updateProfile(req, res)));

// Change password needs both fields present.
router.put('/password', (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return fail(res, 'currentPassword and newPassword are required');
  if (newPassword.length < 6) return fail(res, 'New password must be at least 6 characters');
  next();
}, asyncHandler((req, res) => controller.changePassword(req, res)));

module.exports = router;
