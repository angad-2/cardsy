const userService = require('./user_services');
const { ok, fail } = require('../../utils/response');

class UserController {
  async me(req, res) {
    const data = await userService.getMe(req.user.id);
    return ok(res, data);
  }

  async myDecks(req, res) {
    const data = await userService.getMyDecks(req.user.id);
    return ok(res, data);
  }

  async dashboard(req, res) {
    const data = await userService.getDashboard(req.user.id);
    return ok(res, data);
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(req.user.id, currentPassword, newPassword);
    return ok(res, null, 'Password updated');
  }

  async changeAvatar(req, res) {
    const { avatarUrl } = req.body;
    if (!avatarUrl) return fail(res, 'avatarUrl is required');
    const data = await userService.changeAvatar(req.user.id, avatarUrl);
    return ok(res, data, 'Avatar updated');
  }

  async updateProfile(req, res) {
    const data = await userService.updateProfile(req.user.id, req.body);
    return ok(res, data, 'Profile updated');
  }

  async activity(req, res) {
    const data = await userService.getActivity(req.user.id);
    return ok(res, data);
  }
}

module.exports = new UserController();
