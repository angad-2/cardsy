// Pure gamification helpers: XP, levels, streaks, quality, difficulty.
// No DB access here — services call these and persist the result.

const XP_PER_LEVEL = 1000; // XP needed to gain one level

// XP awarded per reviewed card, by how well it went.
const XP_BY_RESULT = { correct: 10, partial: 5, incorrect: 1 };

// Turn a lifetime XP total into level + progress within the level.
// Matches the frontend XPBar props: { level, currentXP, requiredXP }.
function levelFromXp(totalXp) {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const currentXP = totalXp % XP_PER_LEVEL;
  return { level, currentXP, requiredXP: XP_PER_LEVEL };
}

// XP earned for a single card result.
function xpForResult(result) {
  return XP_BY_RESULT[result] ?? 0;
}

// Convert the UI's 3-way feedback (+ response time) into an SM-2 quality 0-5.
function qualityFromResult(result, responseTimeSec = 5) {
  if (result === 'correct') return responseTimeSec < 4 ? 5 : 4;
  if (result === 'partial') return 3;
  return 1; // incorrect
}

// Backend-assigned card difficulty from how users perform on it.
function difficultyFromStats(totalCorrect, totalIncorrect) {
  const missRatio = totalIncorrect / (totalCorrect + 1);
  if (missRatio > 0.5) return 'hard';
  if (missRatio < 0.2 && totalCorrect >= 3) return 'easy';
  return 'medium';
}

// numeric difficulty the C++/JS engine expects: easy=0, medium=1, hard=2
function difficultyToNumber(difficulty) {
  if (difficulty === 'easy') return 0;
  if (difficulty === 'hard') return 2;
  return 1;
}

// "YYYY-MM-DD" key in UTC for activity/heatmap buckets.
function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

// Whole days between two dates (by calendar day).
function daysBetween(a, b) {
  const ms = new Date(dateKey(b)) - new Date(dateKey(a));
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// Work out the new streak given the last active day.
// Returns { streak, active } where active=true means today is a new active day.
function nextStreak(lastActiveDate, currentStreak, today = new Date()) {
  if (!lastActiveDate) return { streak: 1, active: true };
  const gap = daysBetween(lastActiveDate, today);
  if (gap === 0) return { streak: currentStreak, active: false }; // already counted today
  if (gap === 1) return { streak: currentStreak + 1, active: true }; // consecutive day
  return { streak: 1, active: true }; // streak broken, restart
}

module.exports = {
  XP_PER_LEVEL,
  levelFromXp,
  xpForResult,
  qualityFromResult,
  difficultyFromStats,
  difficultyToNumber,
  dateKey,
  daysBetween,
  nextStreak,
};
