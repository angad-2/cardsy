// Cardsy Spaced-Repetition Engine (native C++ addon)
// Two jobs:
//   1) updateCard  - run the SM-2 update for one reviewed card
//   2) rankCards   - score + sort a batch of cards for a practice session
// Kept intentionally small and readable; the same math lives in engine/fallback.js.

#include <napi.h>
#include <cmath>
#include <vector>
#include <algorithm>

// ---- 1) SM-2 update for a single card ----
// Input object fields: easeFactor, interval, repetitionCount, quality (0-5),
//                      daysSinceLastReview, totalCorrect.
// Returns the new spaced-repetition state.
Napi::Object UpdateCard(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::Object in = info[0].As<Napi::Object>();

  double ease   = in.Get("easeFactor").ToNumber().DoubleValue();
  double interval = in.Get("interval").ToNumber().DoubleValue();
  int reps      = in.Get("repetitionCount").ToNumber().Int32Value();
  int quality   = in.Get("quality").ToNumber().Int32Value();
  double daysSince = in.Get("daysSinceLastReview").ToNumber().DoubleValue();
  int totalCorrect = in.Get("totalCorrect").ToNumber().Int32Value();

  // Update ease factor (SM-2). Never let it drop below 1.3.
  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease < 1.3) ease = 1.3;

  // Update interval + repetition count.
  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    reps += 1;
    if (reps == 1) interval = 1;
    else if (reps == 2) interval = 6;
    else interval = interval * ease;
  }

  // Recall model: probability decays over time, slower for well-known cards.
  double decayRate = 0.05 / ease;
  double recall = std::exp(-decayRate * daysSince);
  if (recall < 0) recall = 0;
  if (recall > 1) recall = 1;
  double stability = (1 - recall) * 0.3 + recall * 0.7;

  // Mastered once it survives long intervals with strong recall.
  bool mastered = (interval >= 30 && totalCorrect + (quality >= 3 ? 1 : 0) >= 5 && recall > 0.8);

  Napi::Object out = Napi::Object::New(env);
  out.Set("easeFactor", ease);
  out.Set("interval", interval);
  out.Set("repetitionCount", reps);
  out.Set("recallProbability", recall);
  out.Set("stabilityScore", stability);
  out.Set("decayRate", decayRate);
  out.Set("isMastered", mastered);
  return out;
}

// Small helper struct used only while ranking.
struct Scored {
  std::string id;
  double score;
};

// ---- 2) Rank a batch of cards for a session ----
// Input: array of { id, recallProbability, easeFactor, avgResponseTime,
//                   totalCorrect, totalIncorrect, difficulty(0 easy/1 med/2 hard) }
//        mode string: "hard" or anything else (regular).
// Returns an array of ids sorted best-first for the session.
Napi::Array RankCards(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::Array cards = info[0].As<Napi::Array>();
  std::string mode = info[1].As<Napi::String>().Utf8Value();
  bool hard = (mode == "hard");

  std::vector<Scored> scored;
  scored.reserve(cards.Length());

  for (uint32_t i = 0; i < cards.Length(); i++) {
    Napi::Object c = cards.Get(i).As<Napi::Object>();
    std::string id = c.Get("id").ToString().Utf8Value();
    double recall  = c.Get("recallProbability").ToNumber().DoubleValue();
    double ease    = c.Get("easeFactor").ToNumber().DoubleValue();
    double avgTime = c.Get("avgResponseTime").ToNumber().DoubleValue();
    double correct = c.Get("totalCorrect").ToNumber().DoubleValue();
    double incorrect = c.Get("totalIncorrect").ToNumber().DoubleValue();
    int difficulty = c.Get("difficulty").ToNumber().Int32Value();

    double missRatio = incorrect / (correct + 1);
    double score;

    if (hard) {
      // Hard mode: focus on weak links only.
      bool weak = (recall < 0.6 || ease < 2.0 || difficulty == 2 || missRatio > 0.5);
      if (!weak) continue; // drop easy cards entirely
      score = (1 - recall) * 0.6 + missRatio * 0.3 + (avgTime / 10) * 0.1;
    } else {
      // Regular mode: mix of due-soon + mildly difficult.
      // A tiny deterministic jitter (from index) keeps ties from ordering oddly.
      double jitter = (i % 10) * 0.01;
      score = (1 - recall) + (1 / ease) + (avgTime / 10) + missRatio + jitter;
    }
    scored.push_back({id, score});
  }

  // Highest score first.
  std::sort(scored.begin(), scored.end(),
            [](const Scored& a, const Scored& b) { return a.score > b.score; });

  Napi::Array out = Napi::Array::New(env, scored.size());
  for (uint32_t i = 0; i < scored.size(); i++) out.Set(i, Napi::String::New(env, scored[i].id));
  return out;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("updateCard", Napi::Function::New(env, UpdateCard));
  exports.Set("rankCards", Napi::Function::New(env, RankCards));
  return exports;
}

NODE_API_MODULE(srs_engine, Init)
