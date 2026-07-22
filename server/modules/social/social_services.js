const prisma = require('../../lib/prisma');
const { levelFromXp, dateKey } = require('../../utils/gamification');

// Public-safe view of a user for leaderboards / search.
function publicCard(u, rank) {
  return {
    id: u.id,
    rank,
    username: u.username,
    avatar: u.avatar_url || u.username[0].toUpperCase(),
    xp: u.xp,
    level: u.level,
    accuracy: Math.round(u.avg_accuracy),
  };
}

class SocialService {
  // Global leaderboard: highest lifetime XP first.
  async globalLeaderboard(limit = 50) {
    const users = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: limit,
      select: { id: true, username: true, avatar_url: true, xp: true, level: true, avg_accuracy: true },
    });
    return users.map((u, i) => publicCard(u, i + 1));
  }

  // Public profile of another student (no private stats, no card contents).
  async studentProfile(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

    const { level, currentXP, requiredXP } = levelFromXp(user.xp);

    // Decks they created (names only) + decks they perform best on.
    const deckProgress = await prisma.userDeckProgress.findMany({
      where: { user_id: userId },
      include: { deck: true },
      orderBy: { last_practiced_at: 'desc' },
      take: 5,
    });
    const recentDecks = deckProgress.map((d) => ({
      id: d.deck_id,
      name: d.deck.name,
      subject: d.deck.category,
      completedCards: d.reviewed_cards,
      totalCards: d.total_cards,
    }));

    // Earned badges.
    const badges = await prisma.userAchievement.findMany({
      where: { user_id: userId },
      include: { achievement: true },
    });

    // 365-day heatmap.
    const since = new Date();
    since.setDate(since.getDate() - 365);
    const activity = await prisma.dailyActivity.findMany({
      where: { user_id: userId, date: { gte: since } },
      orderBy: { date: 'asc' },
    });

    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar_url || user.username[0].toUpperCase(),
      level,
      xp: currentXP,          // XP within current level
      totalXP: requiredXP,    // XP needed for next level
      lifetimeXP: user.xp,
      accuracy: Math.round(user.avg_accuracy),
      streak: user.streak,
      joinDate: dateKey(user.created_at),
      recentDecks,
      badges: badges.map((b) => ({ id: b.achievement.key, name: b.achievement.title, icon: b.achievement.icon, rarity: b.achievement.rarity })),
      activity: activity.map((a) => ({ date: dateKey(a.date), count: a.cards_reviewed })),
    };
  }

  // Search students by username / email / name (simple fuzzy contains match).
  async searchStudents(q, limit = 20) {
    if (!q) return [];
    const term = q.trim();
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { full_name: { contains: term, mode: 'insensitive' } },
        ],
      },
      orderBy: { xp: 'desc' },
      take: limit,
      select: { id: true, username: true, avatar_url: true, xp: true, level: true, avg_accuracy: true },
    });
    return users.map((u, i) => publicCard(u, i + 1));
  }

  // Popular public decks (most learners), each with its top 5 students.
  async popularDecks(limit = 10) {
    // Count learners per deck.
    const grouped = await prisma.userDeckProgress.groupBy({
      by: ['deck_id'],
      _count: { _all: true },
      orderBy: { _count: { deck_id: 'desc' } },
      take: limit,
    });
    const deckIds = grouped.map((g) => g.deck_id);
    const learnersByDeck = new Map(grouped.map((g) => [g.deck_id, g._count._all]));

    const decks = await prisma.deck.findMany({ where: { id: { in: deckIds }, is_public: true } });

    const result = [];
    for (const deck of decks) {
      const top = await this.deckLeaderboard(deck.id, 5);
      result.push({
        id: deck.id,
        title: deck.name,
        subject: deck.category,
        totalCards: deck.total_cards,
        students: learnersByDeck.get(deck.id) || 0,
        avgAccuracy: Math.round(deck.avg_accuracy),
        topStudents: top,
      });
    }
    // Most learners first.
    result.sort((a, b) => b.students - a.students);
    return result;
  }

  // Per-deck leaderboard: best accuracy first.
  async deckLeaderboard(deckId, limit = 10) {
    const rows = await prisma.userDeckProgress.findMany({
      where: { deck_id: deckId },
      include: { user: { select: { id: true, username: true, avatar_url: true } } },
      orderBy: [{ accuracy_rate: 'desc' }, { reviewed_cards: 'desc' }],
      take: limit,
    });
    return rows.map((r, i) => ({
      rank: i + 1,
      id: r.user.id,
      username: r.user.username,
      avatar: r.user.avatar_url || r.user.username[0].toUpperCase(),
      xp: r.xp_earned,
      accuracy: Math.round(r.accuracy_rate),
      reviewedCards: r.reviewed_cards,
    }));
  }

  // Search public decks by name.
  async searchDecks(q, limit = 20) {
    const where = { is_public: true };
    if (q) where.name = { contains: q.trim(), mode: 'insensitive' };
    const decks = await prisma.deck.findMany({ where, orderBy: { avg_accuracy: 'desc' }, take: limit });
    return decks.map((d) => ({
      id: d.id,
      title: d.name,
      subject: d.category,
      totalCards: d.total_cards,
      avgAccuracy: Math.round(d.avg_accuracy),
    }));
  }
}

module.exports = new SocialService();
