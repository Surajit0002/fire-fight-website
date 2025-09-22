import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: "primary" | "accent" | "destructive" | "green" | "yellow";
  subtitle?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp, 
  color = "primary",
  subtitle 
}: StatsCardProps) {
  const getColorClasses = (colorName: string) => {
    switch (colorName) {
      case "primary":
        return "text-primary bg-primary/10 border-primary/20";
      case "accent":
        return "text-accent bg-accent/10 border-accent/20";
      case "destructive":
        return "text-destructive bg-destructive/10 border-destructive/20";
      case "green":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "yellow":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-primary bg-primary/10 border-primary/20";
    }
  };

  const getIconColor = (colorName: string) => {
    switch (colorName) {
      case "primary":
        return "text-primary";
      case "accent":
        return "text-accent";
      case "destructive":
        return "text-destructive";
      case "green":
        return "text-green-500";
      case "yellow":
        return "text-yellow-500";
      default:
        return "text-primary";
    }
  };

  return (
    <Card className={`border transition-all duration-200 hover:shadow-lg ${getColorClasses(color)}`} data-testid={`stats-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-background/50 ${getIconColor(color)}`}>
            {icon}
          </div>
          {trend && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {trendUp !== undefined && (
                trendUp ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )
              )}
              {trend}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="text-3xl font-bold" data-testid={`stats-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
