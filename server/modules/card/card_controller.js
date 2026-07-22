const cardService = require('./card_services');
const { ok, fail } = require('../../utils/response');

class CardController {
  async add(req, res) {
    const { deckId, question, answer } = req.body;
    if (!deckId || !question || !answer) return fail(res, 'deckId, question and answer are required');
    const card = await cardService.add(req.user.id, req.body);
    return ok(res, card, 'Card added', 201);
  }

  async edit(req, res) {
    const card = await cardService.edit(req.user.id, req.params.id, req.body);
    return ok(res, card, 'Card updated');
  }

  async remove(req, res) {
    await cardService.remove(req.user.id, req.params.id);
    return ok(res, null, 'Card deleted');
  }

  async search(req, res) {
    const data = await cardService.search(req.user.id, { q: req.query.q, deckId: req.query.deckId });
    return ok(res, data);
  }
}

module.exports = new CardController();
