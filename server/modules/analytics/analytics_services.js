const prisma = require('../../lib/prisma');
const { levelFromXp, dateKey } = require('../../utils/gamification');

// Format an hour (0-23) as a 12-hour label, e.g. 18 -> "6:00 PM".
function hourLabel(h) {
  const period = h < 12 ? 'AM' : 'PM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:00 ${period}`;
}

class AnalyticsService {
  // Top-line numbers for the Analytics overview tab.
  async overview(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const deckProgress = await prisma.userDeckProgress.findMany({ where: { user_id: userId } });

    const totalCards = deckProgress.reduce((s, d) => s + d.total_cards, 0);
    const masteredCards = user.total_cards_mastered;
    const completionRate = totalCards ? Math.round((masteredCards / totalCards) * 100) : 0;

    return {
      totalCards,
      masteredCards,
      completionRate,
      totalXP: user.xp,
      ...levelFromXp(user.xp),
      accuracy: Math.round(user.avg_accuracy),
    };
  }

  // Daily accuracy + XP series for the performance chart (last `days` days).
  async performance(userId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const rows = await prisma.dailyActivity.findMany({
      where: { user_id: userId, date: { gte: since } },
      orderBy: { date: 'asc' },
    });
    return rows.map((r) => ({
      date: dateKey(r.date),
      accuracy: Math.round(r.accuracy),
      xp: r.xp_gained,
    }));
  }

  // Per-deck analytics table.
  async perDeck(userId) {
    const deckProgress = await prisma.userDeckProgress.findMany({
      where: { user_id: userId },
      include: { deck: true },
      orderBy: { last_practiced_at: 'desc' },
    });

    // Mastered count + avg response time per deck, in two grouped queries.
    const mastered = await prisma.userCardProgress.groupBy({
      by: ['deck_id'],
      where: { user_id: userId, is_mastered: true },
      _count: { _all: true },
    });
    const avgTime = await prisma.userCardProgress.groupBy({
      by: ['deck_id'],
      where: { user_id: userId },
      _avg: { avg_response_time: true },
    });
    const masteredByDeck = new Map(mastered.map((m) => [m.deck_id, m._count._all]));
    const timeByDeck = new Map(avgTime.map((t) => [t.deck_id, t._avg.avg_response_time || 0]));

    return deckProgress.map((d) => ({
      id: d.deck_id,
      name: d.deck.name,
      totalCards: d.total_cards,
      masteredCards: masteredByDeck.get(d.deck_id) || 0,
      accuracy: Math.round(d.accuracy_rate),
      avgTime: `${(timeByDeck.get(d.deck_id) || 0).toFixed(1)}s`,
      totalSessions: d.sessions_count,
    }));
  }

  // Derived insights cards (best time, streak, strongest/weakest subject).
  async insights(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Strongest / weakest subject: group deck accuracy by category.
    const deckProgress = await prisma.userDeckProgress.findMany({
      where: { user_id: userId },
      include: { deck: true },
    });
    const byCategory = {};
    for (const d of deckProgress) {
      const cat = d.deck.category || 'General';
      if (!byCategory[cat]) byCategory[cat] = { sum: 0, n: 0 };
      byCategory[cat].sum += d.accuracy_rate;
      byCategory[cat].n += 1;
    }
    const cats = Object.entries(byCategory).map(([name, v]) => ({ name, accuracy: Math.round(v.sum / v.n) }));
    cats.sort((a, b) => b.accuracy - a.accuracy);
    const strongest = cats[0] || null;
    const focus = cats.length > 1 ? cats[cats.length - 1] : null;

    // Best study time: modal hour from recent review timestamps.
    const recent = await prisma.userCardProgress.findMany({
      where: { user_id: userId, last_reviewed_at: { not: null } },
      select: { last_reviewed_at: true },
      orderBy: { last_reviewed_at: 'desc' },
      take: 200,
    });
    const buckets = new Array(24).fill(0);
    recent.forEach((r) => { buckets[r.last_reviewed_at.getHours()] += 1; });
    let bestHour = 0;
    buckets.forEach((c, h) => { if (c > buckets[bestHour]) bestHour = h; });
    const bestStudyTime = recent.length ? `${hourLabel(bestHour)} - ${hourLabel((bestHour + 2) % 24)}` : 'Not enough data';

    return {
      bestStudyTime,
      learningStreak: user.streak,
      strongestSubject: strongest ? { subject: strongest.name, accuracy: strongest.accuracy } : null,
      focusArea: focus ? { subject: focus.name, accuracy: focus.accuracy } : null,
    };
  }
}

module.exports = new AnalyticsService();
