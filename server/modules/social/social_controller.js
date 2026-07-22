const socialService = require('./social_services');
const { ok } = require('../../utils/response');

class SocialController {
  async leaderboard(req, res) {
    return ok(res, await socialService.globalLeaderboard(Number(req.query.limit) || 50));
  }

  async student(req, res) {
    return ok(res, await socialService.studentProfile(req.params.id));
  }

  async searchStudents(req, res) {
    return ok(res, await socialService.searchStudents(req.query.q));
  }

  async popularDecks(req, res) {
    return ok(res, await socialService.popularDecks(Number(req.query.limit) || 10));
  }

  async deckLeaderboard(req, res) {
    return ok(res, await socialService.deckLeaderboard(req.params.id, Number(req.query.limit) || 10));
  }

  async searchDecks(req, res) {
    return ok(res, await socialService.searchDecks(req.query.q));
  }
}

module.exports = new SocialController();
