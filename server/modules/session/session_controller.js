const sessionService = require('./session_services');
const { ok, fail } = require('../../utils/response');

const RESULTS = ['correct', 'partial', 'incorrect'];

class SessionController {
  async start(req, res) {
    const { deckId, mode, limit } = req.body;
    if (!deckId) return fail(res, 'deckId is required');
    const data = await sessionService.start(req.user.id, { deckId, mode, limit });
    return ok(res, data);
  }

  async review(req, res) {
    const { deckId, cardId, result, responseTime } = req.body;
    if (!deckId || !cardId) return fail(res, 'deckId and cardId are required');
    if (!RESULTS.includes(result)) return fail(res, 'result must be correct, partial or incorrect');
    const data = await sessionService.review(req.user.id, { deckId, cardId, result, responseTime });
    return ok(res, data);
  }

  async finish(req, res) {
    const { deckId, xpEarned } = req.body;
    if (!deckId) return fail(res, 'deckId is required');
    const data = await sessionService.finish(req.user.id, { deckId, xpEarned });
    return ok(res, data, 'Session complete');
  }
}

module.exports = new SessionController();
