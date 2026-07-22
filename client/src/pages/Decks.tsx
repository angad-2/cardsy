import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { DeckCard } from "@/components/DeckCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import api, { unwrap, errMessage } from "@/lib/api";

// Map a raw backend deck row onto the DeckCard props.
const toCard = (d: any) => ({
  id: d.id,
  title: d.name,
  subject: d.category,
  totalCards: d.total_cards,
  cardsToReview: d.total_cards, // per-user due count isn't known in the list view
  accuracy: Math.round(d.avg_accuracy || 0),
});

const Decks = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", description: "", is_public: false, csv: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["my-decks"],
    queryFn: async () => unwrap(await api.get("/user/decks")),
  });

  const createDeck = useMutation({
    mutationFn: async () => {
      // If CSV text is present, import it; otherwise create an empty deck.
      const endpoint = form.csv.trim() ? "/decks/csv" : "/decks";
      return unwrap(await api.post(endpoint, form));
    },
    onSuccess: (deck: any) => {
      toast.success("Deck created");
      setOpen(false);
      setForm({ name: "", category: "", description: "", is_public: false, csv: "" });
      queryClient.invalidateQueries({ queryKey: ["my-decks"] });
      navigate(`/deck/${deck.id}`);
    },
    onError: (e) => toast.error(errMessage(e, "Could not create deck")),
  });

  const allDecks = [...(data?.created || []), ...(data?.shared || [])];
  const filtered = allDecks.filter(
    (d: any) => d.name.toLowerCase().includes(search.toLowerCase()) || (d.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Your <span className="text-primary">Decks</span>
            </h1>
            <p className="text-muted-foreground">Manage and practice your flashcard collections</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Deck
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new deck</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. World Capitals" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Geography" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Import from CSV (optional)</Label>
                  <Textarea
                    value={form.csv}
                    onChange={(e) => setForm({ ...form, csv: e.target.value })}
                    placeholder={"question,answer\nCapital of France?,Paris"}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">Two columns: question,answer. Leave blank for an empty deck.</p>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="public">Public deck</Label>
                  <Switch id="public" checked={form.is_public} onCheckedChange={(v) => setForm({ ...form, is_public: v })} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => createDeck.mutate()}
                  disabled={!form.name.trim() || createDeck.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {createDeck.isPending ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your decks..."
            className="pl-10 bg-card border-border"
          />
        </div>

        {/* Decks Grid */}
        {isLoading ? (
          <p className="text-muted-foreground">Loading decks…</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground">No decks yet. Create your first one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((deck: any) => {
              const c = toCard(deck);
              return (
                <DeckCard
                  key={c.id}
                  title={c.title}
                  subject={c.subject}
                  totalCards={c.totalCards}
                  cardsToReview={c.cardsToReview}
                  accuracy={c.accuracy}
                  onStart={() => navigate(`/practice?deckId=${c.id}`)}
                  onOpen={() => navigate(`/deck/${c.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Decks;
