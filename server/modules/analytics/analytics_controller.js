const analyticsService = require('./analytics_services');
const userService = require('../user/user_services');
const { ok } = require('../../utils/response');

class AnalyticsController {
  async overview(req, res) {
    return ok(res, await analyticsService.overview(req.user.id));
  }

  async performance(req, res) {
    const days = Number(req.query.days) || 30;
    return ok(res, await analyticsService.performance(req.user.id, days));
  }

  async perDeck(req, res) {
    return ok(res, await analyticsService.perDeck(req.user.id));
  }

  async insights(req, res) {
    return ok(res, await analyticsService.insights(req.user.id));
  }

  // 365-day heatmap data (same source as the profile heatmap).
  async activity(req, res) {
    return ok(res, await userService.getActivity(req.user.id));
  }
}

module.exports = new AnalyticsController();
