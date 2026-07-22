import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Leaderboard } from "@/components/Leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import api, { unwrap } from "@/lib/api";

const Social = () => {
  const navigate = useNavigate();

  const leaderboard = useQuery({ queryKey: ["global-lb"], queryFn: async () => unwrap(await api.get("/social/leaderboard")) });
  const popular = useQuery({ queryKey: ["popular-decks"], queryFn: async () => unwrap(await api.get("/social/decks/popular")) });

  const entries = leaderboard.data || [];
  const decks = popular.data || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <span className="text-primary">Social</span> Hub
          </h1>
          <p className="text-muted-foreground">Compete with students worldwide and discover popular decks</p>
        </header>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="leaderboard">Global Leaderboard</TabsTrigger>
            <TabsTrigger value="decks">Popular Decks</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-6">
            {entries.length === 0 ? (
              <p className="text-muted-foreground">No students on the leaderboard yet.</p>
            ) : (
              <Leaderboard entries={entries} title="🏆 Global Top Students" />
            )}
          </TabsContent>

          <TabsContent value="decks" className="space-y-6">
            {decks.length === 0 ? (
              <p className="text-muted-foreground">No popular decks yet — make a public deck and get people practising!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck: any) => (
                  <div key={deck.id} className="space-y-4">
                    <div className="bg-gradient-card p-6 rounded-xl border border-border shadow-card hover:shadow-elevated transition-all hover:scale-[1.02] group">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-1">{deck.title}</h3>
                          <p className="text-sm text-muted-foreground">{deck.subject}</p>
                        </div>

                        <div className="flex gap-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-primary">{deck.students}</span>
                            <span className="text-muted-foreground">students</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-foreground">{deck.totalCards}</span>
                            <span className="text-muted-foreground">cards</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-secondary">{deck.avgAccuracy}%</span>
                            <span className="text-muted-foreground">avg accuracy</span>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/practice?deckId=${deck.id}`)}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-lg font-semibold transition-all group-hover:shadow-glow"
                        >
                          Start Learning
                        </button>
                      </div>
                    </div>

                    {deck.topStudents?.length > 0 && (
                      <Leaderboard entries={deck.topStudents} title={`Top 5 - ${deck.title}`} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Social;
