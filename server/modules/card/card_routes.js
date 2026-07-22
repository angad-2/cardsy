const express = require('express');
const controller = require('./card_controller');
const { protect } = require('../auth/auth_middleware');
const asyncHandler = require('../../utils/async_handler');

const router = express.Router();
router.use(protect);

const h = (fn) => asyncHandler((req, res) => fn(req, res));

router.get('/search', h(controller.search.bind(controller)));
router.post('/', h(controller.add.bind(controller)));
router.put('/:id', h(controller.edit.bind(controller)));
router.delete('/:id', h(controller.remove.bind(controller)));

module.exports = router;
