const express = require('express');
const controller = require('./achievement_controller');
const { protect } = require('../auth/auth_middleware');
const asyncHandler = require('../../utils/async_handler');

const router = express.Router();
router.use(protect);

router.get('/', asyncHandler((req, res) => controller.list(req, res)));
router.post('/check', asyncHandler((req, res) => controller.check(req, res)));

module.exports = router;
