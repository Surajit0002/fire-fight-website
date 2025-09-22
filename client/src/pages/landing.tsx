import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Users, Trophy, Target, Star, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-destructive/10"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float" style={{animationDelay: "-1s"}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 gradient-fire rounded-xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-black" />
            </div>
            <span className="ml-4 text-3xl font-bold text-gradient">FireFight Arena</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="text-gradient">FIRE</span>
            <span className="text-foreground">FIGHT</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join the ultimate gaming battlefield. Compete in premium tournaments, win massive prizes, and dominate the leaderboards.
          </p>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">24,891</div>
              <div className="text-sm text-muted-foreground">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent">₹15.2M</div>
              <div className="text-sm text-muted-foreground">Total Prizes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-destructive">1,247</div>
              <div className="text-sm text-muted-foreground">Live Tournaments</div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="gradient-fire text-black font-bold text-lg px-8 py-4 hover:scale-105 transition-transform animate-glow"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              Join FireFight Arena
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose FireFight Arena?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <Card className="bg-card border-border hover:border-primary/50 transition-colors group cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 gradient-fire rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold mb-2">Premium Tournaments</h3>
                <p className="text-sm text-muted-foreground">Compete in high-stakes tournaments with massive prize pools and professional organization.</p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-card border-border hover:border-accent/50 transition-colors group cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 gradient-electric rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold mb-2">Team Management</h3>
                <p className="text-sm text-muted-foreground">Create and manage your gaming squad with advanced team features and roster management.</p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-card border-border hover:border-destructive/50 transition-colors group cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 gradient-victory rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold mb-2">Real-time Tracking</h3>
                <p className="text-sm text-muted-foreground">Live match tracking, real-time leaderboards, and instant result verification.</p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-card border-border hover:border-primary/50 transition-colors group cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold mb-2">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">Safe and secure payment processing with instant payouts and multiple payment options.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Dominate?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of players competing in India's premier gaming tournament platform.
          </p>
          <Button 
            size="lg" 
            className="gradient-fire text-black font-bold text-lg px-8 py-4 hover:scale-105 transition-transform"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-get-started"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 gradient-fire rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <span className="ml-3 text-xl font-bold text-gradient">FireFight Arena</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                India's premier gaming tournament platform. Join thousands of players competing for massive prizes in your favorite games.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-3">
                <li><span className="text-muted-foreground">Tournaments</span></li>
                <li><span className="text-muted-foreground">Teams</span></li>
                <li><span className="text-muted-foreground">Leaderboard</span></li>
                <li><span className="text-muted-foreground">Support</span></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><span className="text-muted-foreground">Terms & Conditions</span></li>
                <li><span className="text-muted-foreground">Privacy Policy</span></li>
                <li><span className="text-muted-foreground">Refund Policy</span></li>
                <li><span className="text-muted-foreground">Responsible Gaming</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 FireFight Arena. All rights reserved. | India's #1 Gaming Tournament Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
