
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
import { 
  Zap, 
  Bell, 
  Menu, 
  LogOut, 
  User, 
  Settings, 
  Shield,
  ArrowLeft
} from "lucide-react";

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function MobileHeader({ title, showBackButton = false, onBack }: MobileHeaderProps) {
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

  const getPageTitle = () => {
    if (title) return title;
    
    switch (location) {
      case "/":
        return "FireFight Arena";
      case "/tournaments":
        return "Tournaments";
      case "/teams":
        return "Teams";
      case "/wallet":
        return "Wallet";
      case "/profile":
        return "Profile";
      case "/my-matches":
        return "My Matches";
      case "/leaderboard":
        return "Leaderboard";
      default:
        return "FireFight Arena";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border md:hidden">
      <div className="flex items-center justify-between px-4 py-3 safe-area-pt">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {showBackButton && onBack ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="p-2"
              data-testid="mobile-back-button"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <Link href="/">
              <div className="flex items-center cursor-pointer" data-testid="mobile-logo">
                <div className="w-8 h-8 gradient-fire rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-black" />
                </div>
              </div>
            </Link>
          )}
          
          <h1 className="text-lg font-bold text-foreground truncate max-w-[180px]" data-testid="mobile-page-title">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Wallet Balance - Compact */}
          <Link href="/wallet">
            <Button 
              variant="secondary" 
              size="sm" 
              className="text-xs px-2 py-1 h-8" 
              data-testid="mobile-wallet-balance"
            >
              ₹{walletBalance?.balance || "0"}
            </Button>
          </Link>

          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative p-2" 
              data-testid="mobile-notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs w-5 h-5 flex items-center justify-center p-0">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 p-2" 
                data-testid="mobile-user-menu"
              >
                <Avatar className="w-7 h-7">
                  <AvatarImage src={user?.profileImageUrl} alt={user?.username} />
                  <AvatarFallback className="text-xs">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b border-border">
                <p className="font-medium text-sm truncate">{user?.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              
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
                data-testid="mobile-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
