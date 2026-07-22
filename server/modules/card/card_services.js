const prisma = require('../../lib/prisma');
const { canEditDeck, canAccessDeck } = require('../../utils/access');

async function loadDeck(deckId) {
  const deck = await prisma.deck.findUnique({ where: { id: deckId } });
  if (!deck) throw Object.assign(new Error('Deck not found'), { status: 404 });
  return deck;
}

// Keep deck.total_cards in sync after add/remove.
async function refreshCount(deckId) {
  const total = await prisma.card.count({ where: { deck_id: deckId } });
  await prisma.deck.update({ where: { id: deckId }, data: { total_cards: total } });
  return total;
}

class CardService {
  // Add a card to a deck (owner or collaborator).
  async add(userId, { deckId, question, answer, tags, type, options }) {
    const deck = await loadDeck(deckId);
    if (!(await canEditDeck(userId, deck))) {
      throw Object.assign(new Error('You cannot add cards to this deck'), { status: 403 });
    }
    const card = await prisma.card.create({
      data: {
        deck_id: deckId,
        question: question.trim(),
        answer: answer.trim(),
        tags: Array.isArray(tags) ? tags : [],
        type: type === 'mcq' ? 'mcq' : 'para',
        options: Array.isArray(options) ? options : [],
        created_by: userId,
      },
    });
    await refreshCount(deckId);
    return card;
  }

  // Edit an existing card.
  async edit(userId, cardId, fields) {
    const card = await prisma.card.findUnique({ where: { id: cardId }, include: { deck: true } });
    if (!card) throw Object.assign(new Error('Card not found'), { status: 404 });
    if (!(await canEditDeck(userId, card.deck))) {
      throw Object.assign(new Error('You cannot edit this card'), { status: 403 });
    }
    const data = {};
    if (fields.question !== undefined) data.question = fields.question.trim();
    if (fields.answer !== undefined) data.answer = fields.answer.trim();
    if (fields.tags !== undefined) data.tags = fields.tags;
    if (fields.type !== undefined) data.type = fields.type === 'mcq' ? 'mcq' : 'para';
    if (fields.options !== undefined) data.options = fields.options;
    return prisma.card.update({ where: { id: cardId }, data });
  }

  // Remove a card.
  async remove(userId, cardId) {
    const card = await prisma.card.findUnique({ where: { id: cardId }, include: { deck: true } });
    if (!card) throw Object.assign(new Error('Card not found'), { status: 404 });
    if (!(await canEditDeck(userId, card.deck))) {
      throw Object.assign(new Error('You cannot delete this card'), { status: 403 });
    }
    await prisma.card.delete({ where: { id: cardId } });
    await refreshCount(card.deck_id);
    return { deleted: true };
  }

  // Search cards by keyword in question or answer, within decks the user can see.
  async search(userId, { q, deckId }) {
    if (!q) return [];
    const accessible = { OR: [{ is_public: true }, { created_by: userId }, { members: { some: { user_id: userId } } }] };
    const where = {
      OR: [
        { question: { contains: q, mode: 'insensitive' } },
        { answer: { contains: q, mode: 'insensitive' } },
      ],
      deck: accessible,
    };
    if (deckId) where.deck_id = deckId;
    return prisma.card.findMany({ where, take: 50, orderBy: { created_at: 'desc' } });
  }
}

module.exports = new CardService();
