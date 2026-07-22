const achievementService = require('./achievement_services');
const { ok } = require('../../utils/response');

class AchievementController {
  // List all badges with earned status for the logged-in user.
  async list(req, res) {
    const data = await achievementService.listForUser(req.user.id);
    return ok(res, data);
  }

  // Force a re-check (also runs automatically after each session).
  async check(req, res) {
    const data = await achievementService.checkAndAward(req.user.id);
    return ok(res, data, 'Achievements checked');
  }
}

module.exports = new AchievementController();
