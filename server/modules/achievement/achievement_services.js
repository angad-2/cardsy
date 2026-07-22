const prisma = require('../../lib/prisma');

// Decide whether a user meets an achievement's unlock rule.
// stats is a snapshot gathered once per check.
function meetsCriteria(type, value, stats) {
  switch (type) {
    case 'streak':         return stats.longestStreak >= value;
    case 'xp':             return stats.xp >= value;
    case 'cards_mastered': return stats.cardsMastered >= value;
    case 'cards_reviewed': return stats.cardsReviewed >= value;
    case 'decks_created':  return stats.decksCreated >= value;
    case 'night_owl':      return stats.hour >= 22 || stats.hour < 4; // studied late
    default:               return false;
  }
}

class AchievementService {
  // Full catalogue with an `earned` flag (+ earnedDate) for the given user.
  async listForUser(userId) {
    const [all, earned] = await Promise.all([
      prisma.achievement.findMany(),
      prisma.userAchievement.findMany({ where: { user_id: userId } }),
    ]);
    const earnedMap = new Map(earned.map((e) => [e.achievement_id, e.earned_at]));
    return all.map((a) => ({
      id: a.key,
      name: a.title,
      description: a.description,
      icon: a.icon,
      rarity: a.rarity,
      earned: earnedMap.has(a.id),
      earnedDate: earnedMap.has(a.id) ? earnedMap.get(a.id).toISOString().slice(0, 10) : undefined,
    }));
  }

  // Evaluate every achievement the user hasn't earned yet; award any now met.
  // Returns the list of newly earned achievements (for popups).
  async checkAndAward(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return [];

    const decksCreated = await prisma.deck.count({ where: { created_by: userId } });
    const stats = {
      longestStreak: user.longest_streak,
      xp: user.xp,
      cardsMastered: user.total_cards_mastered,
      cardsReviewed: user.total_cards_reviewed,
      decksCreated,
      hour: new Date().getHours(),
    };

    const all = await prisma.achievement.findMany();
    const earned = await prisma.userAchievement.findMany({ where: { user_id: userId } });
    const earnedIds = new Set(earned.map((e) => e.achievement_id));

    const newly = [];
    for (const a of all) {
      if (earnedIds.has(a.id)) continue;
      if (meetsCriteria(a.criteria_type, a.criteria_value, stats)) {
        await prisma.userAchievement.create({ data: { user_id: userId, achievement_id: a.id } });
        newly.push({ id: a.key, name: a.title, description: a.description, icon: a.icon, rarity: a.rarity });
      }
    }
    return newly;
  }
}

module.exports = new AchievementService();
