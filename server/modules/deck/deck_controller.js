const deckService = require('./deck_services');
const { ok, fail } = require('../../utils/response');

class DeckController {
  async create(req, res) {
    if (!req.body.name) return fail(res, 'Deck name is required');
    const deck = await deckService.create(req.user.id, req.body);
    return ok(res, deck, 'Deck created', 201);
  }

  async createFromCsv(req, res) {
    const { name, csv } = req.body;
    if (!name) return fail(res, 'Deck name is required');
    if (!csv) return fail(res, 'csv text is required');
    const deck = await deckService.createFromCsv(req.user.id, req.body);
    return ok(res, deck, 'Deck imported', 201);
  }

  async open(req, res) {
    const deck = await deckService.open(req.user.id, req.params.id);
    return ok(res, deck);
  }

  async update(req, res) {
    const deck = await deckService.update(req.user.id, req.params.id, req.body);
    return ok(res, deck, 'Deck updated');
  }

  async remove(req, res) {
    await deckService.remove(req.user.id, req.params.id);
    return ok(res, null, 'Deck deleted');
  }

  async stats(req, res) {
    const data = await deckService.stats(req.user.id, req.params.id);
    return ok(res, data);
  }

  async search(req, res) {
    const data = await deckService.search(req.user.id, { q: req.query.q, category: req.query.category });
    return ok(res, data);
  }

  async share(req, res) {
    if (!req.body.toUsername) return fail(res, 'toUsername is required');
    const invite = await deckService.share(req.user.id, req.params.id, req.body);
    return ok(res, invite, 'Invite sent', 201);
  }

  async myInvites(req, res) {
    const data = await deckService.myInvites(req.user.id);
    return ok(res, data);
  }

  async acceptInvite(req, res) {
    const data = await deckService.acceptInvite(req.user.id, req.params.inviteId);
    return ok(res, data, 'Invite accepted');
  }

  async declineInvite(req, res) {
    const data = await deckService.declineInvite(req.user.id, req.params.inviteId);
    return ok(res, data, 'Invite declined');
  }

  async duplicate(req, res) {
    const deck = await deckService.duplicate(req.user.id, req.params.id);
    return ok(res, deck, 'Deck duplicated', 201);
  }
}

module.exports = new DeckController();
