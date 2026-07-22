import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Navigation } from "@/components/Navigation";
import { XPBar } from "@/components/XPBar";
import { StreakCounter } from "@/components/StreakCounter";
import { Heatmap } from "@/components/Heatmap";
import { DeckCard } from "@/components/DeckCard";
import { StatCard } from "@/components/StatCard";
import { Brain, Target, Trophy, Zap } from "lucide-react";
import api, { unwrap } from "@/lib/api";
import { badgeIcon } from "@/lib/icons";

const Index = () => {
  const navigate = useNavigate();

  // Everything the dashboard needs comes from one endpoint.
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => unwrap(await api.get("/user/dashboard")),
  });

  const startPractice = (deckId: string) => navigate(`/practice?deckId=${deckId}`);
  const openDeck = (deckId: string) => navigate(`/deck/${deckId}`);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto p-6 text-muted-foreground">Loading dashboard…</div>
      </div>
    );
  }

  const { user, stats, recentDecks, badges, activity } = data;
  const earnedBadges = badges.filter((b: any) => b.earned).slice(0, 5);
  const todaysGoal = recentDecks.reduce((s: number, d: any) => s + (d.cardsToReview || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome back, <span className="text-primary">{user.full_name?.split(" ")[0] || user.username}</span>
            </h1>
            <p className="text-muted-foreground">Let's crush some learning goals today</p>
          </div>

          <StreakCounter days={stats.streak} />
        </header>

        {/* XP Bar */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-card">
          <XPBar currentXP={stats.currentXP} requiredXP={stats.requiredXP} level={stats.level} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Target} label="Today's Goal" value={todaysGoal} trend="cards to review" accentColor="primary" />
          <StatCard icon={Brain} label="Cards Mastered" value={stats.totalCardsMastered} trend="all time" accentColor="secondary" />
          <StatCard icon={Trophy} label="Total XP" value={stats.totalXP.toLocaleString()} trend={`Level ${stats.level}`} accentColor="primary" />
          <StatCard icon={Zap} label="Avg. Accuracy" value={`${stats.accuracy}%`} trend="all sessions" accentColor="secondary" />
        </div>

        {/* Heatmap */}
        <Heatmap data={activity} />

        {/* Recent Badges Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Recent Achievements</h2>
            <button onClick={() => navigate("/account")} className="text-sm text-primary hover:text-primary/80 transition-colors">
              View All →
            </button>
          </div>
          {earnedBadges.length === 0 ? (
            <p className="text-muted-foreground">No badges yet — start practicing to earn some!</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {earnedBadges.map((badge: any) => (
                <div key={badge.id} className="bg-card p-4 rounded-xl border border-border shadow-card hover:shadow-elevated transition-all group">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto group-hover:scale-110 transition-transform">
                      {badgeIcon(badge.icon)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground mb-1">{badge.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
                      {badge.earnedDate && (
                        <p className="text-xs text-primary mt-2">{new Date(badge.earnedDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Decks Section */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Your Recent Decks</h2>
          {recentDecks.length === 0 ? (
            <p className="text-muted-foreground">
              You haven't practiced any decks yet.{" "}
              <button onClick={() => navigate("/decks")} className="text-primary hover:underline">Browse decks →</button>
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDecks.slice(0, 3).map((deck: any) => (
                <DeckCard
                  key={deck.id}
                  title={deck.title}
                  subject={deck.subject}
                  totalCards={deck.totalCards}
                  cardsToReview={deck.cardsToReview}
                  lastPracticed={deck.lastPracticed ? formatDistanceToNow(new Date(deck.lastPracticed), { addSuffix: true }) : undefined}
                  accuracy={deck.accuracy}
                  onStart={() => startPractice(deck.id)}
                  onOpen={() => openDeck(deck.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Index;
