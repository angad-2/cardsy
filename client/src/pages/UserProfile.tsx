import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Heatmap } from "@/components/Heatmap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Target, Brain, Zap } from "lucide-react";
import api, { unwrap } from "@/lib/api";

const UserProfile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => unwrap(await api.get(`/social/users/${userId}`)),
    enabled: !!userId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-6xl mx-auto p-6 text-muted-foreground">Loading profile…</div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-6xl mx-auto p-6 space-y-4">
          <p className="text-muted-foreground">Could not load this profile.</p>
          <Button onClick={() => navigate("/social")} variant="outline" className="border-border">Back to Social</Button>
        </div>
      </div>
    );
  }

  const recentDecks = user.recentDecks || [];
  const masteredTotal = recentDecks.reduce((sum: number, d: any) => sum + d.completedCards, 0);
  const levelProgress = user.totalXP ? (user.xp / user.totalXP) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/social")} variant="outline" className="border-border">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Social
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{user.username}</h1>
              <p className="text-muted-foreground">Joined {new Date(user.joinDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="text-right">
            <Badge variant="secondary" className="text-lg px-3 py-1">Level {user.level}</Badge>
          </div>
        </header>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Total XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{(user.lifetimeXP ?? user.xp).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{user.totalXP - user.xp} XP to next level</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Average Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{user.accuracy}%</div>
              <div className="text-xs text-muted-foreground">Overall performance</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Cards Studied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{masteredTotal}</div>
              <div className="text-xs text-muted-foreground">Across recent decks</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Study Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{user.streak} days</div>
              <div className="text-xs text-muted-foreground">Current streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Level Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Level {user.level}</span>
                <span className="text-muted-foreground">Level {user.level + 1}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-primary h-3 rounded-full transition-all duration-300" style={{ width: `${levelProgress}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{user.xp.toLocaleString()} XP</span>
                <span>{user.totalXP.toLocaleString()} XP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Heatmap */}
        <Heatmap data={user.activity || []} />

        {/* Recent Decks */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Recent Decks</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDecks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No decks practised yet.</p>
            ) : (
              <div className="space-y-3">
                {recentDecks.map((deck: any) => (
                  <div key={deck.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{deck.name}</h3>
                      <p className="text-sm text-muted-foreground">{deck.subject}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">{deck.completedCards}/{deck.totalCards} cards</div>
                      <div className="text-xs text-muted-foreground">
                        {deck.totalCards ? Math.round((deck.completedCards / deck.totalCards) * 100) : 0}% complete
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
