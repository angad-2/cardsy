const bcrypt = require('bcrypt');
const prisma = require('../../lib/prisma');
const { generateToken } = require('../../utils/jwt');

class AuthService {
  /**
   * Authenticate a user with username/email and password
   * @param {string} identifier - Email or Username
   * @param {string} password 
   * @returns {Promise<Object>} User data and JWT token
   */
  async login(identifier, password) {
    const formattedIdentifier = identifier.toLowerCase().trim();

    // 1. Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: formattedIdentifier },
          { username: formattedIdentifier }
        ]
      }
    });

    if (!user) {
      throw new Error('Invalid username, email or password');
    }

    // 2. Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid username, email or password');
    }

    // 3. Generate token
    const token = generateToken({ id: user.id, email: user.email, username: user.username });

    // 4. Return user info (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Create a new user and generate a JWT token
   * @param {Object} userData 
   * @returns {Promise<Object>} Created user and JWT token
   */
  async register(userData) {
    const { email, username, password, full_name } = userData;
    const formattedEmail = email.toLowerCase().trim();
    const formattedUsername = username.toLowerCase().trim();

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: formattedEmail }
    });

    if (existingEmail) {
      throw new Error('Email is already registered');
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: formattedUsername }
    });

    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        email: formattedEmail,
        username: formattedUsername,
        password: hashedPassword,
        full_name: full_name.trim()
      }
    });

    // Generate token for immediate authentication upon registration
    const token = generateToken({ id: user.id, email: user.email, username: user.username });

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token
    };
  }
}

module.exports = new AuthService();
