import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FlashCard } from "@/components/FlashCard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import { toast } from "sonner";
import api, { unwrap, errMessage } from "@/lib/api";

type Level = "incorrect" | "partial" | "correct";

const Practice = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const deckId = params.get("deckId");
  const mode = params.get("mode") || "regular";

  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Level[]>([]);
  const [xpEarned, setXpEarned] = useState(0);
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cardStart = useRef(Date.now());

  // Ask the backend (C++ engine) for a ranked set of cards to practise.
  const { data: session, isLoading, isError, error } = useQuery({
    queryKey: ["session", deckId, mode],
    queryFn: async () => unwrap(await api.post("/sessions/start", { deckId, mode })),
    enabled: !!deckId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const cards = session?.cards || [];

  // Reset the response timer whenever a new card appears.
  useEffect(() => { cardStart.current = Date.now(); }, [index]);

  const finishSession = async (finalResults: Level[], finalXp: number) => {
    try {
      const res = unwrap(await api.post("/sessions/finish", { deckId, xpEarned: finalXp }));
      if (res.newAchievements?.length) {
        res.newAchievements.forEach((a: any) => toast.success(`🏅 Badge unlocked: ${a.name}`));
      }
    } catch (e) {
      // Non-fatal: still show the summary.
      toast.error(errMessage(e, "Could not save session summary"));
    }
    // Refresh dashboard/analytics next time they're viewed.
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    setComplete(true);
  };

  const handleFeedback = async (level: Level) => {
    if (submitting) return;
    setSubmitting(true);
    const card = cards[index];
    const responseTime = (Date.now() - cardStart.current) / 1000;
    let gained = 0;
    try {
      const res = unwrap(await api.post("/sessions/review", { deckId, cardId: card.id, result: level, responseTime }));
      gained = res.xpGained || 0;
    } catch (e) {
      toast.error(errMessage(e, "Could not record answer"));
    }

    const newResults = [...results, level];
    const newXp = xpEarned + gained;
    setResults(newResults);
    setXpEarned(newXp);

    if (index < cards.length - 1) {
      setIndex(index + 1);
    } else {
      await finishSession(newResults, newXp);
    }
    setSubmitting(false);
  };

  // No deck chosen.
  if (!deckId) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No deck selected for practice.</p>
          <Button onClick={() => navigate("/decks")} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Choose a deck
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background p-6 flex items-center justify-center text-muted-foreground">Preparing your session…</div>;
  }

  if (isError || cards.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{isError ? errMessage(error, "Could not start session") : "This deck has no cards to practise."}</p>
          <Button onClick={() => navigate(-1)} variant="outline" className="border-border">Go back</Button>
        </div>
      </div>
    );
  }

  // Completion summary.
  if (complete) {
    const correct = results.filter((r) => r === "correct").length;
    const partial = results.filter((r) => r === "partial").length;
    const incorrect = results.filter((r) => r === "incorrect").length;
    const accuracy = Math.round((correct / results.length) * 100);

    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-gradient-card rounded-2xl border-2 border-primary shadow-elevated shadow-glow p-12 text-center space-y-8 animate-slide-up">
          <div className="flex justify-center">
            <div className="p-6 bg-primary/10 rounded-full">
              <Trophy className="w-16 h-16 text-primary" />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Session Complete!</h1>
            <p className="text-xl text-primary">+{xpEarned} XP Earned</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary">{correct}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-secondary">{partial}</p>
              <p className="text-sm text-muted-foreground">Partial</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-destructive">{incorrect}</p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Accuracy</p>
            <p className="text-5xl font-bold text-foreground">{accuracy}%</p>
          </div>

          <Button onClick={() => navigate("/")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = cards[index];
  const progress = ((index + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate(-1)} variant="outline" className="border-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">Progress {session.engine === "native" ? "· C++ ranked" : ""}</p>
            <p className="text-lg font-bold text-foreground">{index + 1} / {cards.length}</p>
          </div>

          <div className="w-24" />
        </div>

        <Progress value={progress} className="h-2" />

        <FlashCard key={currentCard.id} question={currentCard.question} answer={currentCard.answer} onFeedback={handleFeedback} />
      </div>
    </div>
  );
};

export default Practice;
