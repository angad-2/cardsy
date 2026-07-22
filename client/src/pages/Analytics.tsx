import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { PerformanceChart } from "@/components/PerformanceChart";
import { StatCard } from "@/components/StatCard";
import { Brain, Target, Trophy, TrendingUp, Clock, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heatmap } from "@/components/Heatmap";
import api, { unwrap } from "@/lib/api";

const Analytics = () => {
  const overview = useQuery({ queryKey: ["an-overview"], queryFn: async () => unwrap(await api.get("/analytics/overview")) });
  const performance = useQuery({ queryKey: ["an-perf"], queryFn: async () => unwrap(await api.get("/analytics/performance")) });
  const perDeck = useQuery({ queryKey: ["an-decks"], queryFn: async () => unwrap(await api.get("/analytics/decks")) });
  const insights = useQuery({ queryKey: ["an-insights"], queryFn: async () => unwrap(await api.get("/analytics/insights")) });
  const activity = useQuery({ queryKey: ["an-activity"], queryFn: async () => unwrap(await api.get("/analytics/activity")) });

  const o = overview.data;
  const decks = perDeck.data || [];
  const ins = insights.data;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Your <span className="text-primary">Analytics</span>
          </h1>
          <p className="text-muted-foreground">Track your learning journey and progress</p>
        </header>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="decks">Per Deck</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={Target} label="Total Cards" value={o?.totalCards ?? 0} trend="across your decks" accentColor="primary" />
              <StatCard icon={Brain} label="Mastered" value={o?.masteredCards ?? 0} trend={`${o?.completionRate ?? 0}% completion`} accentColor="secondary" />
              <StatCard icon={Trophy} label="Total XP" value={(o?.totalXP ?? 0).toLocaleString()} trend={`Level ${o?.level ?? 1}`} accentColor="primary" />
              <StatCard icon={TrendingUp} label="Avg. Accuracy" value={`${o?.accuracy ?? 0}%`} trend="all sessions" accentColor="secondary" />
            </div>

            {/* Performance Chart */}
            <PerformanceChart data={performance.data || []} />

            {/* Activity Heatmap */}
            <Heatmap data={activity.data || []} />
          </TabsContent>

          <TabsContent value="decks" className="space-y-6">
            {decks.length === 0 ? (
              <p className="text-muted-foreground">No deck stats yet — practise a deck to see analytics.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {decks.map((deck: any) => (
                  <div key={deck.id} className="bg-card p-6 rounded-xl border border-border shadow-card hover:shadow-elevated transition-all">
                    <h3 className="text-xl font-bold mb-4">{deck.name}</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-primary">{deck.masteredCards}/{deck.totalCards} cards</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${deck.totalCards ? (deck.masteredCards / deck.totalCards) * 100 : 0}%` }} />
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{deck.accuracy}%</p>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-secondary">{deck.avgTime}</p>
                          <p className="text-xs text-muted-foreground">Avg Time</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{deck.totalSessions}</p>
                          <p className="text-xs text-muted-foreground">Sessions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold">Best Study Time</h3>
                </div>
                <p className="text-3xl font-bold text-primary mb-2">{ins?.bestStudyTime ?? "—"}</p>
                <p className="text-muted-foreground">Your peak performance window</p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-secondary" />
                  <h3 className="text-xl font-bold">Learning Streak</h3>
                </div>
                <p className="text-3xl font-bold text-secondary mb-2">{ins?.learningStreak ?? 0} Days</p>
                <p className="text-muted-foreground">Keep it up! You're on fire 🔥</p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold">Strongest Subject</h3>
                </div>
                <p className="text-3xl font-bold text-primary mb-2">{ins?.strongestSubject?.subject ?? "—"}</p>
                <p className="text-muted-foreground">{ins?.strongestSubject ? `${ins.strongestSubject.accuracy}% average accuracy` : "Not enough data"}</p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-secondary" />
                  <h3 className="text-xl font-bold">Focus Area</h3>
                </div>
                <p className="text-3xl font-bold text-secondary mb-2">{ins?.focusArea?.subject ?? "—"}</p>
                <p className="text-muted-foreground">{ins?.focusArea ? `Needs more practice (${ins.focusArea.accuracy}%)` : "Not enough data"}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
