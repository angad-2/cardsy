/**
 * Validate login request body
 */
const validateLogin = (req, res, next) => {
  const { identifier, password } = req.body;
  const errors = {};

  if (!identifier) {
    errors.identifier = 'Username or email is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      status: 'fail',
      errors
    });
  }

  next();
};

/**
 * Validate register request body
 */
const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  // Frontend sends `name`; accept either `name` or `full_name`.
  const full_name = req.body.full_name || req.body.name;
  const errors = {};

  if (!full_name || full_name.trim() === '') {
    errors.full_name = 'Full name is required';
  }

  if (!username || username.trim() === '') {
    errors.username = 'Username is required';
  } else if (username.length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Please provide a valid email address';
    }
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      status: 'fail',
      errors
    });
  }

  next();
};

module.exports = {
  validateLogin,
  validateRegister
};
