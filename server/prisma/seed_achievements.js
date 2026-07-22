// Seeds the achievement catalogue. Safe to run repeatedly (upsert by key).
// Run with:  node prisma/seed_achievements.js
require('../config/env');
const prisma = require('../lib/prisma');

const ACHIEVEMENTS = [
  { key: 'streak_7',        title: 'Week Warrior',       description: 'Maintain a 7-day study streak',        icon: 'flame',  rarity: 'common',    criteria_type: 'streak',         criteria_value: 7 },
  { key: 'streak_30',       title: 'Consistency King',   description: 'Maintain a 30-day study streak',       icon: 'flame',  rarity: 'rare',      criteria_type: 'streak',         criteria_value: 30 },
  { key: 'xp_1000',         title: 'Rising Star',        description: 'Earn 1,000 total XP',                  icon: 'star',   rarity: 'common',    criteria_type: 'xp',             criteria_value: 1000 },
  { key: 'xp_5000',         title: 'XP Machine',         description: 'Earn 5,000 total XP',                  icon: 'zap',    rarity: 'epic',      criteria_type: 'xp',             criteria_value: 5000 },
  { key: 'mastered_100',    title: 'Sharp Mind',         description: 'Master 100 cards',                     icon: 'brain',  rarity: 'rare',      criteria_type: 'cards_mastered', criteria_value: 100 },
  { key: 'mastered_1000',   title: 'Brainiac',           description: 'Master 1,000 cards',                   icon: 'brain',  rarity: 'legendary', criteria_type: 'cards_mastered', criteria_value: 1000 },
  { key: 'reviewed_500',    title: 'Grinder',            description: 'Review 500 cards',                     icon: 'sword',  rarity: 'common',    criteria_type: 'cards_reviewed', criteria_value: 500 },
  { key: 'decks_5',         title: 'Deck Builder',       description: 'Create 5 decks',                       icon: 'layers', rarity: 'common',    criteria_type: 'decks_created',  criteria_value: 5 },
  { key: 'decks_20',        title: 'Deck Architect',     description: 'Create 20 decks',                      icon: 'layers', rarity: 'epic',      criteria_type: 'decks_created',  criteria_value: 20 },
  { key: 'night_owl',       title: 'Night Owl',          description: 'Study after 10 PM',                    icon: 'moon',   rarity: 'rare',      criteria_type: 'night_owl',      criteria_value: 0 },
];

async function main() {
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({ where: { key: a.key }, update: a, create: a });
  }
  console.log(`Seeded ${ACHIEVEMENTS.length} achievements`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => process.exit(0));
