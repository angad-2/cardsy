const authService = require('./auth_services');

class AuthController {
  /**
   * Handle user login request
   */
  async login(req, res, next) {
    try {
      const { identifier, password } = req.body;
      const result = await authService.login(identifier, password);

      return res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        data: result
      });
    } catch (error) {
      if (error.message === 'Invalid username, email or password') {
        return res.status(401).json({
          status: 'fail',
          message: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Handle user registration request
   */
  async register(req, res, next) {
    try {
      const { email, username, password, full_name } = req.body;
      const result = await authService.register({ email, username, password, full_name });

      return res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      if (
        error.message === 'Email is already registered' ||
        error.message === 'Username is already taken'
      ) {
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
