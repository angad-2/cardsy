const express = require('express');
const controller = require('./analytics_controller');
const { protect } = require('../auth/auth_middleware');
const asyncHandler = require('../../utils/async_handler');

const router = express.Router();
router.use(protect);

const h = (fn) => asyncHandler((req, res) => fn(req, res));

router.get('/overview', h(controller.overview.bind(controller)));
router.get('/performance', h(controller.performance.bind(controller)));
router.get('/decks', h(controller.perDeck.bind(controller)));
router.get('/insights', h(controller.insights.bind(controller)));
router.get('/activity', h(controller.activity.bind(controller)));

module.exports = router;
