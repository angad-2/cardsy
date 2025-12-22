# 📚 Cardsy — Intelligent Spaced Repetition Platform

Cardsy is a **scalable, production-grade learning platform** built around **spaced repetition, analytics, and gamified practice**.  
It combines **Node.js microservices**, a **C++ native scheduling engine**, and a **Mongo + PostgreSQL + Redis** data strategy to deliver high performance and deep learning insights.

---

## 🖥️ Screenshots (Key Pages)

- **Dashboard** →

<img width="1278" height="661" alt="Image" src="https://github.com/user-attachments/assets/90fcc99a-004d-4765-b072-242c58a3c29d" />

- **Analytics** →

<img width="1280" height="681" alt="Image" src="https://github.com/user-attachments/assets/73194318-e599-4955-97fb-7c50b9d657c1" />

- **Decks Page** →

<img width="1280" height="681" alt="Image" src="https://github.com/user-attachments/assets/e2825282-f9a7-4785-9731-1e6f20765526" />

- **Flashcard (Question)** →

<img width="895" height="505" alt="Image" src="https://github.com/user-attachments/assets/774e7449-3480-4abb-bc63-37dafcd30cc3" />

- **Flashcard (Answer & Evaluation)** →

<img width="883" height="561" alt="Image" src="https://github.com/user-attachments/assets/c9e2d276-27ed-4af4-8235-05fa5193db22" />

---

## ⚙️ Technical Architecture

### Microservices Overview

| Service | Responsibility | Stack |
|------|---------------|------|
| Auth | JWT, OAuth, sessions | Node.js + PostgreSQL |
| Deck | Deck & card CRUD | Node.js + MongoDB |
| Practice Engine | Card ranking & SRS | Node.js + C++ Addon |
| Gamification | XP, streaks, leaderboards | Node.js + Redis |
| Analytics | Aggregations & insights | Node.js + PostgreSQL (TimescaleDB) |

**Communication**
- gRPC / REST via API Gateway  
- Async processing via BullMQ  
- Realtime updates via WebSockets  

**Frontend**
- React + Tailwind CSS  
- Recharts / Chart.js   

---

## 🧠 Practice Session Flow

1. User starts a session  
2. Due cards fetched from MongoDB  
3. Metadata sent to **C++ SRS engine**  
4. Engine ranks cards (Regular / Hard mode)  
5. Node streams cards to frontend  
6. User responses update progress  
7. XP & analytics processed asynchronously  

---

## 🧩 Spaced Repetition Algorithm (SM-2 Variant)

```
EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
interval = previous_interval * EF'
```

- `quality`: 0–5 (derived from correctness + response time)  
- `EF` starts at `2.5`, min `1.3`  
- Implemented in **C++ (Node Addon)** for 10–20× speedup  

---

## ⚡ Gamification Engine

- XP, levels, streaks, badges  
- Redis Sorted Sets for leaderboards:

```
ZINCRBY leaderboard:userXP <value> <user_id>
```

- Weekly resets via Redis Lua scripts  

---

## 📊 Analytics

- Daily activity heatmaps (365 days)  
- Deck-wise accuracy & mastery  
- Retention curves & streak tracking  
- Auto-tagging of easy / medium / hard cards  

---

## 🧱 Database Strategy

| Data | Database |
|----|----|
| Users, Auth | PostgreSQL |
| Decks, Cards | MongoDB |
| User Progress | MongoDB |
| XP, Streaks | Redis + PostgreSQL |
| Analytics | PostgreSQL (TimescaleDB) |

---

## 🎯 Core Features

### Learning
- Spaced repetition (Easy / Normal / Hard modes)  
- Paragraph & MCQ answers  
- Markdown, LaTeX & images in cards  

### Decks
- Public & private decks  
- Deck sharing & invites  
- Collaborative decks  
- Deck duplication  

### Gamification
- XP & levels  
- Daily / monthly streaks  
- Achievements & badges  
- Deck-level leaderboards  

### Social
- Friend profiles  
- Popular deck discovery  
- Competitive challenges  

---

## 🧠 C++ Native Engine Responsibilities

- Card priority ranking  
- Adaptive difficulty tuning  
- Recall probability estimation  
- Full-text search & ranking (optional)  

```cpp
#include <napi.h>
Napi::Object CalculateNextReview(const Napi::CallbackInfo& info);

const srs = require('./build/Release/srs.node');
const ranked = srs.rankCards(payload);
```

---

## 🔍 Recruiter Highlights

- Hybrid Node.js + C++ backend  
- Custom SM-2 spaced repetition engine  
- Event-driven architecture with Redis & queues  
- Tri-database design for scale & performance  
- Real-time gamification & analytics  

---

**Built for learning. Engineered for scale.**
