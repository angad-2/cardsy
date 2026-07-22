# Cardsy Backend API

Node.js + Express + Prisma, **single database: PostgreSQL** (Neon).
The spaced-repetition ranking runs in a **native C++ addon** (`engine/`) with an
automatic pure-JS fallback if the addon isn't compiled.

## Run

```bash
npm install
npm run build-engine   # compile the C++ SRS addon (optional; falls back to JS)
npx prisma generate
npx prisma db push     # create tables
npm run seed           # seed achievement catalogue
npm run dev            # start on PORT (default 5002)
```

All responses use the envelope: `{ status, message, data }`.
Every route except `/api/auth/*` needs `Authorization: Bearer <token>`.

## Auth — `/api/auth`
| Method | Path | Body |
| --- | --- | --- |
| POST | `/register` | `{ name, username, email, password }` |
| POST | `/login` | `{ identifier, password }` |
| GET | `/me` | — |

## User — `/api/user`
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/me` | full profile (no password) |
| GET | `/dashboard` | user + stats + recent decks + badges + heatmap |
| GET | `/decks` | `{ created, shared }` |
| GET | `/activity` | 365-day heatmap `[{ date, count }]` |
| PUT | `/profile` | any of name/bio/username/email/notif prefs |
| PUT | `/avatar` | `{ avatarUrl }` |
| PUT | `/password` | `{ currentPassword, newPassword }` |

## Decks — `/api/decks`
| Method | Path | Notes |
| --- | --- | --- |
| POST | `/` | create `{ name, description, category, is_public, tags }` |
| POST | `/csv` | `{ name, category, is_public, csv }` (question,answer rows) |
| GET | `/search?q=&category=` | accessible + public decks |
| GET | `/invites` | pending invites for me |
| POST | `/invites/:inviteId/accept` | accept a shared deck |
| POST | `/invites/:inviteId/decline` | decline |
| GET | `/:id` | deck + all cards |
| PUT | `/:id` | update (owner) |
| DELETE | `/:id` | delete + cards (owner) |
| GET | `/:id/stats` | per-user deck progress |
| POST | `/:id/share` | `{ toUsername, role }` role=viewer\|collaborator |
| POST | `/:id/duplicate` | copy deck into my account |

## Cards — `/api/cards`
| Method | Path | Notes |
| --- | --- | --- |
| POST | `/` | `{ deckId, question, answer, tags?, type?, options? }` |
| PUT | `/:id` | edit |
| DELETE | `/:id` | remove |
| GET | `/search?q=&deckId=` | keyword search in question/answer |

## Sessions — `/api/sessions` (the SRS engine)
| Method | Path | Notes |
| --- | --- | --- |
| POST | `/start` | `{ deckId, mode: regular\|hard, limit? }` → ranked cards |
| POST | `/review` | `{ deckId, cardId, result: correct\|partial\|incorrect, responseTime }` → SM-2 update + XP |
| POST | `/finish` | `{ deckId, xpEarned }` → deck aggregates + new badges |

## Analytics — `/api/analytics`
`/overview`, `/performance?days=30`, `/decks`, `/insights`, `/activity`

## Social — `/api/social`
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/leaderboard` | global, by XP |
| GET | `/users/search?q=` | fuzzy student search |
| GET | `/users/:id` | public profile (no private stats/cards) |
| GET | `/decks/popular` | most-learned public decks + top 5 students |
| GET | `/decks/search?q=` | public deck search |
| GET | `/decks/:id/leaderboard` | per-deck ranking |

## Achievements — `/api/achievements`
`GET /` (catalogue + earned flag), `POST /check` (re-evaluate).

## The C++ engine (`engine/`)
- `srs_engine.cpp` — `updateCard()` (SM-2 ease/interval/recall) and `rankCards()`
  (regular = priority score, hard = struggle score, drops easy cards).
- `fallback.js` — identical math in JS; used automatically if the addon is absent.
- `index.js` — loads whichever is available; logs which one is active on boot.
