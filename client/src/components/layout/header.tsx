import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Zap, Bell, Menu, LogOut, User, Settings, Shield } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  const { data: walletBalance } = useQuery({
    queryKey: ["/api/wallet/balance"],
    enabled: !!user,
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer" data-testid="logo">
              <div className="w-10 h-10 gradient-fire rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <span className="ml-3 text-xl font-bold text-gradient">FireFight Arena</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/tournaments">
                <Button 
                  variant="ghost" 
                  className={`${isActive('/tournaments') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
                  data-testid="nav-tournaments"
                >
                  Tournaments
                </Button>
              </Link>
              <Link href="/teams">
                <Button 
                  variant="ghost" 
                  className={`${isActive('/teams') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
                  data-testid="nav-teams"
                >
                  Teams
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button 
                  variant="ghost" 
                  className={`${isActive('/leaderboard') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
                  data-testid="nav-leaderboard"
                >
                  Leaderboard
                </Button>
              </Link>
              <Link href="/my-matches">
                <Button 
                  variant="ghost" 
                  className={`${isActive('/my-matches') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
                  data-testid="nav-matches"
                >
                  My Matches
                </Button>
              </Link>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Wallet Balance */}
            <Link href="/wallet">
              <Button variant="secondary" className="text-sm" data-testid="wallet-balance">
                ₹{walletBalance?.balance || "0.00"} Wallet
              </Button>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative" data-testid="notifications">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs w-5 h-5 flex items-center justify-center p-0">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 p-2" data-testid="user-menu">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.username} />
                    <AvatarFallback>
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:block">{user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wallet" className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => window.location.href = "/api/logout"}
                  className="flex items-center text-destructive"
                  data-testid="logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" data-testid="mobile-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
