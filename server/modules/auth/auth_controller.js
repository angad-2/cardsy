const authService = require('./auth_services');

class AuthController {
  /**
   * Handle user login request
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      return res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        data: result
      });
    } catch (error) {
      // Pass authentication failure errors back as 401 Unauthorized
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({
          status: 'fail',
          message: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Handle user registration request (optional/helper)
   */
  async register(req, res, next) {
    try {
      const { email, password, first_name, last_name } = req.body;
      const user = await authService.register({ email, password, first_name, last_name });

      return res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: { user }
      });
    } catch (error) {
      if (error.message === 'Email is already registered') {
        return res.status(409).json({
          status: 'fail',
          message: error.message
        });
      }
      next(error);
    }
  }
}

module.exports = new AuthController();
