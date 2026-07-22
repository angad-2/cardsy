const express = require('express');
const controller = require('./social_controller');
const { protect } = require('../auth/auth_middleware');
const asyncHandler = require('../../utils/async_handler');

const router = express.Router();
router.use(protect);

const h = (fn) => asyncHandler((req, res) => fn(req, res));

router.get('/leaderboard', h(controller.leaderboard.bind(controller)));
router.get('/users/search', h(controller.searchStudents.bind(controller)));
router.get('/users/:id', h(controller.student.bind(controller)));
router.get('/decks/popular', h(controller.popularDecks.bind(controller)));
router.get('/decks/search', h(controller.searchDecks.bind(controller)));
router.get('/decks/:id/leaderboard', h(controller.deckLeaderboard.bind(controller)));

module.exports = router;
