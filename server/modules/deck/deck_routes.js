const express = require('express');
const controller = require('./deck_controller');
const { protect } = require('../auth/auth_middleware');
const asyncHandler = require('../../utils/async_handler');

const router = express.Router();
router.use(protect);

const h = (fn) => asyncHandler((req, res) => fn(req, res));

// Specific paths must come before the "/:id" routes.
router.post('/', h(controller.create.bind(controller)));
router.post('/csv', h(controller.createFromCsv.bind(controller)));
router.get('/search', h(controller.search.bind(controller)));
router.get('/invites', h(controller.myInvites.bind(controller)));
router.post('/invites/:inviteId/accept', h(controller.acceptInvite.bind(controller)));
router.post('/invites/:inviteId/decline', h(controller.declineInvite.bind(controller)));

// Deck-scoped routes.
router.get('/:id', h(controller.open.bind(controller)));
router.put('/:id', h(controller.update.bind(controller)));
router.delete('/:id', h(controller.remove.bind(controller)));
router.get('/:id/stats', h(controller.stats.bind(controller)));
router.post('/:id/share', h(controller.share.bind(controller)));
router.post('/:id/duplicate', h(controller.duplicate.bind(controller)));

module.exports = router;
