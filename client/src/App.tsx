import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Tournaments from "@/pages/tournaments";
import TournamentDetail from "@/pages/tournament-detail";
import Teams from "@/pages/teams";
import Wallet from "@/pages/wallet";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import MyMatches from "@/pages/my-matches";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminTournaments from "@/pages/admin/tournaments";
import AdminUsers from "@/pages/admin/users";
import AdminWallets from "@/pages/admin/wallets";
import { lazy } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/tournaments" component={Tournaments} />
          <Route path="/tournaments/:id" component={TournamentDetail} />
          <Route path="/teams" component={Teams} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/my-matches" component={MyMatches} />

          {/* Admin Routes */}
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/tournaments" component={AdminTournaments} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/wallets" component={AdminWallets} />
          <Route path="/admin/analytics" component={lazy(() => import("@/pages/admin/analytics"))} />
          <Route path="/admin/settings" component={lazy(() => import("@/pages/admin/settings"))} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;