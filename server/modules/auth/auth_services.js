const bcrypt = require('bcrypt');
const prisma = require('../../lib/prisma');
const { generateToken } = require('../../utils/jwt');

class AuthService {
  /**
   * Authenticate a user with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} User data and JWT token
   */
  async login(email, password) {
    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 2. Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 3. Generate token
    const token = generateToken({ id: user.id, email: user.email });

    // 4. Return user info (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Create a new user (useful helper/registration)
   * @param {Object} userData 
   * @returns {Promise<Object>} Created user
   */
  async register(userData) {
    const { email, password, first_name, last_name } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      throw new Error('Email is already registered');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        first_name: first_name || '',
        last_name: last_name || ''
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = new AuthService();
