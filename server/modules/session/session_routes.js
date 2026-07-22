const express = require('express');
const controller = require('./session_controller');
const { protect } = require('../auth/auth_middleware');
const asyncHandler = require('../../utils/async_handler');

const router = express.Router();
router.use(protect);

const h = (fn) => asyncHandler((req, res) => fn(req, res));

router.post('/start', h(controller.start.bind(controller)));
router.post('/review', h(controller.review.bind(controller)));
router.post('/finish', h(controller.finish.bind(controller)));

module.exports = router;
