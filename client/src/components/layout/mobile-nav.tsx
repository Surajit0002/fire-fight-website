
import { Link, useLocation } from "wouter";
import { Home, Trophy, Users, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      isActive: location === "/"
    },
    {
      href: "/tournaments",
      icon: Trophy,
      label: "Tournaments",
      isActive: location.startsWith("/tournaments")
    },
    {
      href: "/teams",
      icon: Users,
      label: "Teams",
      isActive: location.startsWith("/teams")
    },
    {
      href: "/wallet",
      icon: Wallet,
      label: "Wallet",
      isActive: location.startsWith("/wallet")
    },
    {
      href: "/profile",
      icon: User,
      label: "Profile",
      isActive: location.startsWith("/profile")
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]",
                  item.isActive
                    ? "bg-gradient-to-br from-primary/20 to-accent/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 mb-1 transition-transform duration-200",
                    item.isActive && "scale-110"
                  )} 
                />
                <span 
                  className={cn(
                    "text-xs font-medium transition-all duration-200",
                    item.isActive ? "font-semibold" : "font-normal"
                  )}
                >
                  {item.label}
                </span>
                {item.isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
