// Shared deck access checks used by deck / card / session modules.
const prisma = require('../lib/prisma');

// Can this user use the deck at all? (owner, member, or it's public)
async function canAccessDeck(userId, deck) {
  if (!deck) return false;
  if (deck.created_by === userId) return true;
  if (deck.is_public) return true;
  const member = await prisma.deckMember.findUnique({
    where: { deck_id_user_id: { deck_id: deck.id, user_id: userId } },
  });
  return !!member;
}

// Can this user add/edit cards? (owner or collaborator member)
async function canEditDeck(userId, deck) {
  if (!deck) return false;
  if (deck.created_by === userId) return true;
  const member = await prisma.deckMember.findUnique({
    where: { deck_id_user_id: { deck_id: deck.id, user_id: userId } },
  });
  return !!member && member.role === 'collaborator';
}

module.exports = { canAccessDeck, canEditDeck };
