import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Play } from "lucide-react";
import { toast } from "sonner";
import api, { unwrap, errMessage } from "@/lib/api";

const DeckManagement = () => {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const queryClient = useQueryClient();

  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ question: "", answer: "" });
  const [newCard, setNewCard] = useState({ question: "", answer: "" });
  const [isAddingCard, setIsAddingCard] = useState(false);

  const { data: deck, isLoading } = useQuery({
    queryKey: ["deck", deckId],
    queryFn: async () => unwrap(await api.get(`/decks/${deckId}`)),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["deck", deckId] });

  const addCard = useMutation({
    mutationFn: async () => unwrap(await api.post("/cards", { deckId, ...newCard })),
    onSuccess: () => {
      toast.success("Card added");
      setNewCard({ question: "", answer: "" });
      setIsAddingCard(false);
      invalidate();
    },
    onError: (e) => toast.error(errMessage(e, "Could not add card")),
  });

  const editCard = useMutation({
    mutationFn: async (id: string) => unwrap(await api.put(`/cards/${id}`, editForm)),
    onSuccess: () => {
      toast.success("Card updated");
      setEditingCard(null);
      invalidate();
    },
    onError: (e) => toast.error(errMessage(e, "Could not update card")),
  });

  const deleteCard = useMutation({
    mutationFn: async (id: string) => unwrap(await api.delete(`/cards/${id}`)),
    onSuccess: () => {
      toast.success("Card deleted");
      invalidate();
    },
    onError: (e) => toast.error(errMessage(e, "Could not delete card")),
  });

  const startEdit = (card: any) => {
    setEditingCard(card.id);
    setEditForm({ question: card.question, answer: card.answer });
  };

  if (isLoading || !deck) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-6xl mx-auto p-6 text-muted-foreground">Loading deck…</div>
      </div>
    );
  }

  const cards = deck.cards || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate(-1)} variant="outline" className="border-border">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{deck.name}</h1>
              <p className="text-muted-foreground">{deck.category} • {cards.length} cards</p>
            </div>
          </div>

          <div className="flex gap-2">
            {cards.length > 0 && (
              <Button onClick={() => navigate(`/practice?deckId=${deck.id}`)} variant="outline" className="border-border">
                <Play className="w-4 h-4 mr-2" />
                Practice
              </Button>
            )}
            <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Card
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Card</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Question</label>
                    <Input
                      value={newCard.question}
                      onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                      placeholder="Enter the question..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Answer</label>
                    <Textarea
                      value={newCard.answer}
                      onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                      placeholder="Enter the answer..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => { setNewCard({ question: "", answer: "" }); setIsAddingCard(false); }}>
                      Cancel
                    </Button>
                    <Button onClick={() => addCard.mutate()} disabled={!newCard.question.trim() || !newCard.answer.trim() || addCard.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      Add Card
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card: any, idx: number) => (
            <Card key={card.id} className="bg-card border-border shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Card #{idx + 1}</Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => startEdit(card)} className="h-8 w-8 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteCard.mutate(card.id)}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingCard === card.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Question</label>
                      <Input value={editForm.question} onChange={(e) => setEditForm({ ...editForm, question: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Answer</label>
                      <Textarea value={editForm.answer} onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })} className="min-h-[80px]" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => editCard.mutate(card.id)} disabled={editCard.isPending}>
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingCard(null)}>
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Question</h3>
                      <p className="text-sm text-muted-foreground">{card.question}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Answer</h3>
                      <p className="text-sm text-muted-foreground">{card.answer}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {cards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No cards yet</h3>
              <p>Start by adding your first card to this deck.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckManagement;
