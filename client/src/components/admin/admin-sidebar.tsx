import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationCenter from "@/components/admin/notification-center";
import { 
  Zap, 
  LayoutDashboard,
  Trophy,
  Users,
  Wallet,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Shield
} from "lucide-react";

export default function AdminSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const navItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      exact: true,
    },
    {
      path: "/admin/tournaments",
      label: "Tournaments",
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: <Users className="w-4 h-4" />,
    },
    {
      path: "/admin/wallets",
      label: "Wallets",
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      path: "/admin/analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      path: "/admin/settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col z-50">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link href="/admin">
          <div className="flex items-center cursor-pointer" data-testid="admin-logo">
            <div className="w-10 h-10 gradient-fire rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <div className="ml-3">
              <div className="text-lg font-bold text-gradient">FireFight Arena</div>
              <div className="text-xs text-muted-foreground">Admin Panel</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Admin Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 gradient-fire rounded-full flex items-center justify-center text-black font-bold text-sm">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.username}</div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">Administrator</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge className="bg-green-500/20 text-green-400 text-xs">
            Online
          </Badge>
          <NotificationCenter />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const active = item.exact ? location === item.path : location.startsWith(item.path);
          
          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant={active ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" data-testid="back-to-site">
            <HelpCircle className="w-4 h-4" />
            <span className="ml-3">Back to Site</span>
          </Button>
        </Link>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={() => window.location.href = "/api/logout"}
          data-testid="admin-logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="ml-3">Logout</span>
        </Button>
      </div>
    </div>
  );
}
