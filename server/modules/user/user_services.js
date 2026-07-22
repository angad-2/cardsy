const bcrypt = require('bcrypt');
const prisma = require('../../lib/prisma');
const { levelFromXp, dateKey } = require('../../utils/gamification');

// Fields we never send to the client.
const HIDDEN = { password: true };

// Shape a user row for API responses (adds level breakdown, strips password).
function publicUser(user) {
  const { password, ...rest } = user;
  return { ...rest, ...levelFromXp(user.xp) };
}

class UserService {
  // Full profile for the logged-in user.
  async getMe(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    return publicUser(user);
  }

  // Decks the user created + decks shared with them.
  async getMyDecks(userId) {
    const created = await prisma.deck.findMany({
      where: { created_by: userId },
      orderBy: { updated_at: 'desc' },
    });

    const memberships = await prisma.deckMember.findMany({
      where: { user_id: userId },
      include: { deck: true },
    });
    // Exclude decks the user owns (they already appear in `created`).
    const shared = memberships.map((m) => m.deck).filter((d) => d.created_by !== userId);

    return { created, shared };
  }

  // Change password after verifying the current one.
  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw Object.assign(new Error('Current password is incorrect'), { status: 401 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { updated: true };
  }

  // Update the avatar image URL.
  async changeAvatar(userId, avatarUrl) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar_url: avatarUrl },
    });
    return publicUser(user);
  }

  // Update editable profile fields. Only provided fields are changed.
  async updateProfile(userId, fields) {
    const data = {};
    if (fields.full_name !== undefined) data.full_name = fields.full_name.trim();
    if (fields.bio !== undefined) data.bio = fields.bio;
    if (fields.username !== undefined) data.username = fields.username.toLowerCase().trim();
    if (fields.email !== undefined) data.email = fields.email.toLowerCase().trim();
    if (fields.email_notifications !== undefined) data.email_notifications = fields.email_notifications;
    if (fields.streak_alerts !== undefined) data.streak_alerts = fields.streak_alerts;
    if (fields.leaderboard_updates !== undefined) data.leaderboard_updates = fields.leaderboard_updates;

    try {
      const user = await prisma.user.update({ where: { id: userId }, data });
      return publicUser(user);
    } catch (err) {
      // Unique constraint on username/email.
      if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        throw Object.assign(new Error(`That ${field} is already taken`), { status: 409 });
      }
      throw err;
    }
  }

  // One-shot payload for the dashboard/home screen.
  async getDashboard(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Recently practised decks, shaped for the DeckCard component.
    const progress = await prisma.userDeckProgress.findMany({
      where: { user_id: userId },
      include: { deck: true },
      orderBy: { last_practiced_at: 'desc' },
      take: 6,
    });
    const recentDecks = progress.map((p) => ({
      id: p.deck_id,
      title: p.deck.name,
      subject: p.deck.category,
      totalCards: p.total_cards,
      cardsToReview: p.cards_due_today,
      accuracy: Math.round(p.accuracy_rate),
      lastPracticed: p.last_practiced_at,
    }));

    // Earned badges.
    const earned = await prisma.userAchievement.findMany({
      where: { user_id: userId },
      include: { achievement: true },
      orderBy: { earned_at: 'desc' },
    });
    const badges = earned.map((e) => ({
      id: e.achievement.key,
      name: e.achievement.title,
      description: e.achievement.description,
      icon: e.achievement.icon,
      rarity: e.achievement.rarity,
      earned: true,
      earnedDate: e.earned_at.toISOString().slice(0, 10),
    }));

    return {
      user: publicUser(user),
      stats: {
        streak: user.streak,
        totalXP: user.xp,
        ...levelFromXp(user.xp),
        totalCardsReviewed: user.total_cards_reviewed,
        totalCardsMastered: user.total_cards_mastered,
        accuracy: Math.round(user.avg_accuracy),
      },
      recentDecks,
      badges,
      activity: await this.getActivity(userId),
    };
  }

  // 365-day activity list for the heatmap: [{ date, count, accuracy, xpGained }].
  async getActivity(userId) {
    const since = new Date();
    since.setDate(since.getDate() - 365);

    const rows = await prisma.dailyActivity.findMany({
      where: { user_id: userId, date: { gte: since } },
      orderBy: { date: 'asc' },
    });

    return rows.map((r) => ({
      date: dateKey(r.date),
      count: r.cards_reviewed,
      accuracy: r.accuracy,
      xpGained: r.xp_gained,
    }));
  }
}

module.exports = new UserService();
module.exports.publicUser = publicUser;
