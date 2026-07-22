// Pure-JS mirror of engine/srs_engine.cpp.
// Used automatically when the native addon has not been compiled, so the
// server always works. Keep this in sync with the C++ math.

// SM-2 update for a single reviewed card.
function updateCard(input) {
  let { easeFactor, interval, repetitionCount, quality, daysSinceLastReview, totalCorrect } = input;

  // Update ease factor (never below 1.3).
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // Update interval + repetition count.
  if (quality < 3) {
    repetitionCount = 0;
    interval = 1;
  } else {
    repetitionCount += 1;
    if (repetitionCount === 1) interval = 1;
    else if (repetitionCount === 2) interval = 6;
    else interval = interval * easeFactor;
  }

  // Recall decays over time, slower for well-known cards.
  const decayRate = 0.05 / easeFactor;
  let recall = Math.exp(-decayRate * daysSinceLastReview);
  recall = Math.max(0, Math.min(1, recall));
  const stability = (1 - recall) * 0.3 + recall * 0.7;

  const isMastered = interval >= 30 && totalCorrect + (quality >= 3 ? 1 : 0) >= 5 && recall > 0.8;

  return {
    easeFactor,
    interval,
    repetitionCount,
    recallProbability: recall,
    stabilityScore: stability,
    decayRate,
    isMastered,
  };
}

// Rank a batch of cards for a session. mode = "hard" | "regular".
function rankCards(cards, mode) {
  const hard = mode === 'hard';
  const scored = [];

  cards.forEach((c, i) => {
    const missRatio = c.totalIncorrect / (c.totalCorrect + 1);
    let score;

    if (hard) {
      const weak = c.recallProbability < 0.6 || c.easeFactor < 2.0 || c.difficulty === 2 || missRatio > 0.5;
      if (!weak) return; // drop easy cards
      score = (1 - c.recallProbability) * 0.6 + missRatio * 0.3 + (c.avgResponseTime / 10) * 0.1;
    } else {
      const jitter = (i % 10) * 0.01;
      score = (1 - c.recallProbability) + (1 / c.easeFactor) + (c.avgResponseTime / 10) + missRatio + jitter;
    }
    scored.push({ id: c.id, score });
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.id);
}

module.exports = { updateCard, rankCards };
