const prisma = require('../../lib/prisma');
const engine = require('../../engine');
const { canAccessDeck } = require('../../utils/access');
const {
  xpForResult,
  qualityFromResult,
  difficultyFromStats,
  difficultyToNumber,
  levelFromXp,
  nextStreak,
  daysBetween,
  dateKey,
} = require('../../utils/gamification');
const achievementService = require('../achievement/achievement_services');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

async function loadDeck(deckId) {
  const deck = await prisma.deck.findUnique({ where: { id: deckId } });
  if (!deck) throw Object.assign(new Error('Deck not found'), { status: 404 });
  return deck;
}

// Turn stored progress into the engine's input row, decaying recall by elapsed days.
function toEngineRow(cardId, progress) {
  if (!progress) {
    // Brand-new card: neutral defaults so it still gets scheduled.
    return { id: cardId, recallProbability: 1, easeFactor: 2.5, avgResponseTime: 0, totalCorrect: 0, totalIncorrect: 0, difficulty: 1 };
  }
  const days = progress.last_reviewed_at ? daysBetween(progress.last_reviewed_at, new Date()) : 0;
  const recall = progress.last_reviewed_at ? Math.exp(-progress.decay_rate * days) : 1;
  return {
    id: cardId,
    recallProbability: Math.max(0, Math.min(1, recall)),
    easeFactor: progress.ease_factor,
    avgResponseTime: progress.avg_response_time,
    totalCorrect: progress.total_correct,
    totalIncorrect: progress.total_incorrect,
    difficulty: difficultyToNumber(progress.difficulty),
  };
}

class SessionService {
  // Start a practice session: rank the deck's cards with the C++ engine and
  // return the top slice for the frontend to play.
  async start(userId, { deckId, mode = 'regular', limit = 50 }) {
    const deck = await loadDeck(deckId);
    if (!(await canAccessDeck(userId, deck))) {
      throw Object.assign(new Error('You do not have access to this deck'), { status: 403 });
    }

    const cards = await prisma.card.findMany({ where: { deck_id: deckId } });
    if (cards.length === 0) throw Object.assign(new Error('This deck has no cards'), { status: 400 });

    const progressRows = await prisma.userCardProgress.findMany({ where: { user_id: userId, deck_id: deckId } });
    const progressByCard = new Map(progressRows.map((p) => [p.card_id, p]));

    // In regular mode, skip cards that are mastered and reviewed within the last day.
    const now = new Date();
    const candidates = cards.filter((c) => {
      if (mode === 'hard') return true;
      const p = progressByCard.get(c.id);
      if (p && p.is_mastered && p.last_reviewed_at && now - p.last_reviewed_at < MS_PER_DAY) return false;
      return true;
    });

    // Rank with the engine (native C++ if compiled, else JS fallback).
    const rows = candidates.map((c) => toEngineRow(c.id, progressByCard.get(c.id)));
    const rankedIds = engine.rankCards(rows, mode);

    // Return the actual cards in ranked order, capped at `limit`.
    const cardById = new Map(cards.map((c) => [c.id, c]));
    const ordered = rankedIds.slice(0, limit).map((id) => {
      const c = cardById.get(id);
      return { id: c.id, question: c.question, answer: c.answer, type: c.type, options: c.options };
    });

    return { deckId, mode, engine: engine.isNative ? 'native' : 'fallback', total: ordered.length, cards: ordered };
  }

  // Record one card review: run SM-2, update all the stats, award XP.
  async review(userId, { deckId, cardId, result, responseTime = 5 }) {
    const deck = await loadDeck(deckId);
    if (!(await canAccessDeck(userId, deck))) {
      throw Object.assign(new Error('You do not have access to this deck'), { status: 403 });
    }

    // Existing progress or fresh defaults.
    let progress = await prisma.userCardProgress.findUnique({
      where: { user_id_card_id: { user_id: userId, card_id: cardId } },
    });

    const quality = qualityFromResult(result, responseTime);
    const daysSince = progress?.last_reviewed_at ? daysBetween(progress.last_reviewed_at, new Date()) : 0;

    const updated = engine.updateCard({
      easeFactor: progress?.ease_factor ?? 2.5,
      interval: progress?.interval ?? 0,
      repetitionCount: progress?.repetition_count ?? 0,
      quality,
      daysSinceLastReview: daysSince,
      totalCorrect: progress?.total_correct ?? 0,
    });

    const correct = result === 'correct';
    const totalCorrect = (progress?.total_correct ?? 0) + (correct ? 1 : 0);
    const totalIncorrect = (progress?.total_incorrect ?? 0) + (correct ? 0 : 1);
    const attempts = totalCorrect + totalIncorrect;

    // Running average response time.
    const prevAttempts = attempts - 1;
    const avgResponseTime = prevAttempts > 0
      ? ((progress?.avg_response_time ?? 0) * prevAttempts + responseTime) / attempts
      : responseTime;

    const now = new Date();
    const nextReviewAt = new Date(now.getTime() + updated.interval * MS_PER_DAY);
    const wasMastered = progress?.is_mastered ?? false;

    const data = {
      user_id: userId,
      card_id: cardId,
      deck_id: deckId,
      ease_factor: updated.easeFactor,
      interval: updated.interval,
      repetition_count: updated.repetitionCount,
      last_reviewed_at: now,
      next_review_at: nextReviewAt,
      last_quality: quality,
      total_correct: totalCorrect,
      total_incorrect: totalIncorrect,
      avg_response_time: avgResponseTime,
      last_response_time: responseTime,
      is_mastered: updated.isMastered,
      stability_score: updated.stabilityScore,
      recall_probability: updated.recallProbability,
      decay_rate: updated.decayRate,
      difficulty: difficultyFromStats(totalCorrect, totalIncorrect),
    };

    progress = await prisma.userCardProgress.upsert({
      where: { user_id_card_id: { user_id: userId, card_id: cardId } },
      update: data,
      create: data,
    });

    const xpGained = xpForResult(result);
    const accuracyPoints = correct ? 100 : result === 'partial' ? 50 : 0;

    await this.applyUserGains(userId, { xpGained, accuracyPoints, newlyMastered: updated.isMastered && !wasMastered });
    await this.logDailyActivity(userId, { xpGained, accuracyPoints });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    return {
      xpGained,
      isMastered: progress.is_mastered,
      nextReviewAt: progress.next_review_at,
      cardProgress: progress,
      user: { xp: user.xp, ...levelFromXp(user.xp), streak: user.streak },
    };
  }

  // Update the user's XP, streak and lifetime counters after a review.
  async applyUserGains(userId, { xpGained, accuracyPoints, newlyMastered }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const reviewed = user.total_cards_reviewed + 1;
    const avgAccuracy = (user.avg_accuracy * user.total_cards_reviewed + accuracyPoints) / reviewed;

    // Streak: only advances the first time the user is active on a given day.
    const streakInfo = nextStreak(user.last_active_date, user.streak);
    const data = {
      xp: user.xp + xpGained,
      total_cards_reviewed: reviewed,
      total_cards_mastered: user.total_cards_mastered + (newlyMastered ? 1 : 0),
      avg_accuracy: avgAccuracy,
    };
    data.level = levelFromXp(data.xp).level;

    if (streakInfo.active) {
      data.streak = streakInfo.streak;
      data.longest_streak = Math.max(user.longest_streak, streakInfo.streak);
      data.last_active_date = new Date();
      data.total_active_days = user.total_active_days + 1;
    }

    await prisma.user.update({ where: { id: userId }, data });
  }

  // Upsert today's DailyActivity row (heatmap + streak graph).
  async logDailyActivity(userId, { xpGained, accuracyPoints }) {
    const today = new Date(dateKey());
    const existing = await prisma.dailyActivity.findUnique({
      where: { user_id_date: { user_id: userId, date: today } },
    });

    if (!existing) {
      await prisma.dailyActivity.create({
        data: { user_id: userId, date: today, cards_reviewed: 1, xp_gained: xpGained, accuracy: accuracyPoints },
      });
      return;
    }
    const reviewed = existing.cards_reviewed + 1;
    const accuracy = (existing.accuracy * existing.cards_reviewed + accuracyPoints) / reviewed;
    await prisma.dailyActivity.update({
      where: { user_id_date: { user_id: userId, date: today } },
      data: { cards_reviewed: reviewed, xp_gained: existing.xp_gained + xpGained, accuracy },
    });
  }

  // Finish a session: roll up per-deck aggregates and check for new achievements.
  async finish(userId, { deckId, xpEarned = 0 }) {
    const deck = await loadDeck(deckId);

    const progress = await prisma.userCardProgress.findMany({ where: { user_id: userId, deck_id: deckId } });
    const reviewed = progress.filter((p) => p.total_correct + p.total_incorrect > 0);
    const totalAttempts = reviewed.reduce((s, p) => s + p.total_correct + p.total_incorrect, 0);
    const totalCorrect = reviewed.reduce((s, p) => s + p.total_correct, 0);
    const masteredCount = progress.filter((p) => p.is_mastered).length;

    const accuracyRate = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    const avgEase = reviewed.length ? reviewed.reduce((s, p) => s + p.ease_factor, 0) / reviewed.length : 2.5;
    const avgInterval = reviewed.length ? reviewed.reduce((s, p) => s + p.interval, 0) / reviewed.length : 0;
    const now = new Date();
    const dueToday = progress.filter((p) => p.next_review_at && p.next_review_at <= now).length;

    // Mastery level from how much of the deck is mastered.
    const masteredRatio = deck.total_cards ? masteredCount / deck.total_cards : 0;
    const masteryLevel = masteredRatio >= 0.8 ? 'mastered' : masteredRatio >= 0.3 ? 'intermediate' : 'beginner';

    const existing = await prisma.userDeckProgress.findUnique({
      where: { user_id_deck_id: { user_id: userId, deck_id: deckId } },
    });

    const data = {
      user_id: userId,
      deck_id: deckId,
      reviewed_cards: reviewed.length,
      total_cards: deck.total_cards,
      accuracy_rate: accuracyRate,
      avg_ease_factor: avgEase,
      avg_interval: avgInterval,
      cards_due_today: dueToday,
      mastery_level: masteryLevel,
      xp_earned: (existing?.xp_earned ?? 0) + xpEarned,
      sessions_count: (existing?.sessions_count ?? 0) + 1,
      last_practiced_at: now,
    };

    await prisma.userDeckProgress.upsert({
      where: { user_id_deck_id: { user_id: userId, deck_id: deckId } },
      update: data,
      create: data,
    });

    // Refresh the deck's public average accuracy across all its learners.
    await this.refreshDeckAccuracy(deckId);

    const newAchievements = await achievementService.checkAndAward(userId);

    return {
      deckId,
      reviewedCards: reviewed.length,
      accuracyRate: Math.round(accuracyRate),
      masteryLevel,
      newAchievements,
    };
  }

  // Average accuracy across every user practising this deck.
  async refreshDeckAccuracy(deckId) {
    const agg = await prisma.userDeckProgress.aggregate({
      where: { deck_id: deckId },
      _avg: { accuracy_rate: true },
    });
    await prisma.deck.update({
      where: { id: deckId },
      data: { avg_accuracy: agg._avg.accuracy_rate ?? 0 },
    });
  }
}

module.exports = new SessionService();
