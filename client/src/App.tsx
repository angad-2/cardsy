import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Decks from "./pages/Decks";
import Analytics from "./pages/Analytics";
import Social from "./pages/Social";
import Account from "./pages/Account";
import Practice from "./pages/Practice";
import DeckManagement from "./pages/DeckManagement";
import UserProfile from "./pages/UserProfile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Wrap a page so it requires a logged-in user.
const guard = (el: JSX.Element) => <ProtectedRoute>{el}</ProtectedRoute>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={guard(<Index />)} />
          <Route path="/decks" element={guard(<Decks />)} />
          <Route path="/deck/:deckId" element={guard(<DeckManagement />)} />
          <Route path="/user/:userId" element={guard(<UserProfile />)} />
          <Route path="/analytics" element={guard(<Analytics />)} />
          <Route path="/social" element={guard(<Social />)} />
          <Route path="/account" element={guard(<Account />)} />
          <Route path="/practice" element={guard(<Practice />)} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
