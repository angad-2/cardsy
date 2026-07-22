const prisma = require('../../lib/prisma');
const { parseQaCsv } = require('../../utils/csv');
const { canAccessDeck } = require('../../utils/access');

// Load a deck or throw a 404.
async function loadDeck(deckId) {
  const deck = await prisma.deck.findUnique({ where: { id: deckId } });
  if (!deck) throw Object.assign(new Error('Deck not found'), { status: 404 });
  return deck;
}

class DeckService {
  // Create an empty deck owned by the user.
  async create(userId, { name, description, category, is_public, tags }) {
    return prisma.deck.create({
      data: {
        name: name.trim(),
        description: description || null,
        category: category || 'General',
        is_public: !!is_public,
        tags: Array.isArray(tags) ? tags : [],
        created_by: userId,
      },
    });
  }

  // Create a deck and its cards from raw CSV text (two columns: question,answer).
  async createFromCsv(userId, { name, category, is_public, csv }) {
    const rows = parseQaCsv(csv);
    if (rows.length === 0) throw Object.assign(new Error('CSV has no valid question,answer rows'), { status: 400 });

    const deck = await prisma.deck.create({
      data: {
        name: name.trim(),
        category: category || 'General',
        is_public: !!is_public,
        created_by: userId,
        total_cards: rows.length,
      },
    });

    await prisma.card.createMany({
      data: rows.map((r) => ({
        deck_id: deck.id,
        question: r.question,
        answer: r.answer,
        created_by: userId,
      })),
    });

    return { ...deck, imported: rows.length };
  }

  // Open a deck: metadata + all its cards. Requires access.
  async open(userId, deckId) {
    const deck = await loadDeck(deckId);
    if (!(await canAccessDeck(userId, deck))) {
      throw Object.assign(new Error('You do not have access to this deck'), { status: 403 });
    }
    const cards = await prisma.card.findMany({
      where: { deck_id: deckId },
      orderBy: { created_at: 'asc' },
    });
    return { ...deck, cards };
  }

  // Update editable deck fields (owner only).
  async update(userId, deckId, fields) {
    const deck = await loadDeck(deckId);
    if (deck.created_by !== userId) throw Object.assign(new Error('Only the owner can edit this deck'), { status: 403 });

    const data = {};
    if (fields.name !== undefined) data.name = fields.name.trim();
    if (fields.description !== undefined) data.description = fields.description;
    if (fields.category !== undefined) data.category = fields.category;
    if (fields.is_public !== undefined) data.is_public = !!fields.is_public;
    if (fields.tags !== undefined) data.tags = fields.tags;

    return prisma.deck.update({ where: { id: deckId }, data });
  }

  // Delete a deck and everything under it (owner only). Cascades handle cards etc.
  async remove(userId, deckId) {
    const deck = await loadDeck(deckId);
    if (deck.created_by !== userId) throw Object.assign(new Error('Only the owner can delete this deck'), { status: 403 });
    await prisma.deck.delete({ where: { id: deckId } });
    return { deleted: true };
  }

  // Per-user progress stats for a deck.
  async stats(userId, deckId) {
    const deck = await loadDeck(deckId);
    const progress = await prisma.userDeckProgress.findUnique({
      where: { user_id_deck_id: { user_id: userId, deck_id: deckId } },
    });
    if (!progress) {
      return {
        deck_id: deckId,
        reviewed_cards: 0,
        total_cards: deck.total_cards,
        accuracy_rate: 0,
        xp_earned: 0,
        sessions_count: 0,
        mastery_level: 'beginner',
        hardest_tags: [],
      };
    }
    return progress;
  }

  // Search decks by name or category (only public decks or ones you can access).
  async search(userId, { q, category }) {
    const filters = [
      { is_public: true },
      { created_by: userId },
      { members: { some: { user_id: userId } } },
    ];
    const where = { AND: [{ OR: filters }] };
    if (q) where.AND.push({ name: { contains: q, mode: 'insensitive' } });
    if (category) where.AND.push({ category: { equals: category, mode: 'insensitive' } });

    return prisma.deck.findMany({ where, orderBy: { updated_at: 'desc' }, take: 50 });
  }

  // Invite another user to access a private deck (owner only).
  async share(userId, deckId, { toUsername, role }) {
    const deck = await loadDeck(deckId);
    if (deck.created_by !== userId) throw Object.assign(new Error('Only the owner can share this deck'), { status: 403 });

    const target = await prisma.user.findUnique({ where: { username: toUsername.toLowerCase().trim() } });
    if (!target) throw Object.assign(new Error('User not found'), { status: 404 });
    if (target.id === userId) throw Object.assign(new Error('You already own this deck'), { status: 400 });

    return prisma.deckInvite.create({
      data: {
        deck_id: deckId,
        from_id: userId,
        to_id: target.id,
        role: role === 'collaborator' ? 'collaborator' : 'viewer',
      },
    });
  }

  // Pending invites addressed to the user.
  async myInvites(userId) {
    return prisma.deckInvite.findMany({
      where: { to_id: userId, status: 'pending' },
      include: { deck: true, from: { select: { username: true, full_name: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  // Accept an invite → becomes a deck member.
  async acceptInvite(userId, inviteId) {
    const invite = await prisma.deckInvite.findUnique({ where: { id: inviteId } });
    if (!invite || invite.to_id !== userId) throw Object.assign(new Error('Invite not found'), { status: 404 });
    if (invite.status !== 'pending') throw Object.assign(new Error('Invite already handled'), { status: 400 });

    await prisma.$transaction([
      prisma.deckInvite.update({ where: { id: inviteId }, data: { status: 'accepted' } }),
      prisma.deckMember.upsert({
        where: { deck_id_user_id: { deck_id: invite.deck_id, user_id: userId } },
        update: { role: invite.role },
        create: { deck_id: invite.deck_id, user_id: userId, role: invite.role },
      }),
    ]);
    return { accepted: true, deck_id: invite.deck_id };
  }

  // Decline an invite.
  async declineInvite(userId, inviteId) {
    const invite = await prisma.deckInvite.findUnique({ where: { id: inviteId } });
    if (!invite || invite.to_id !== userId) throw Object.assign(new Error('Invite not found'), { status: 404 });
    await prisma.deckInvite.update({ where: { id: inviteId }, data: { status: 'declined' } });
    return { declined: true };
  }

  // Copy a deck (and its cards) into the user's own account.
  async duplicate(userId, deckId) {
    const deck = await loadDeck(deckId);
    if (!(await canAccessDeck(userId, deck))) {
      throw Object.assign(new Error('You do not have access to this deck'), { status: 403 });
    }
    const cards = await prisma.card.findMany({ where: { deck_id: deckId } });

    const copy = await prisma.deck.create({
      data: {
        name: `${deck.name} (Copy)`,
        description: deck.description,
        category: deck.category,
        tags: deck.tags,
        is_public: false,
        created_by: userId,
        total_cards: cards.length,
      },
    });

    if (cards.length > 0) {
      await prisma.card.createMany({
        data: cards.map((c) => ({
          deck_id: copy.id,
          question: c.question,
          answer: c.answer,
          tags: c.tags,
          type: c.type,
          options: c.options,
          created_by: userId,
        })),
      });
    }
    return copy;
  }
}

module.exports = new DeckService();
