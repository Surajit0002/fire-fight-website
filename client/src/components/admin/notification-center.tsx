
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  DollarSign,
  Users,
  Trophy,
  Settings,
  Shield,
  Trash2
} from "lucide-react";

interface AdminNotification {
  id: string;
  type: "alert" | "info" | "success" | "warning";
  category: "system" | "user" | "tournament" | "financial" | "security";
  title: string;
  message: string;
  isRead: boolean;
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  actionUrl?: string;
}

export default function NotificationCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/admin/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest("PATCH", `/api/admin/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest("DELETE", `/api/admin/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      toast({
        title: "Notification deleted",
        description: "The notification has been removed.",
      });
    },
  });

  const mockNotifications: AdminNotification[] = [
    {
      id: "1",
      type: "alert",
      category: "security",
      title: "Multiple Failed Login Attempts",
      message: "User account has exceeded maximum login attempts",
      isRead: false,
      priority: "high",
      createdAt: "2024-01-15T10:30:00Z",
      actionUrl: "/admin/users"
    },
    {
      id: "2",
      type: "warning",
      category: "financial",
      title: "Pending Withdrawal Review",
      message: "5 withdrawal requests pending approval",
      isRead: false,
      priority: "medium",
      createdAt: "2024-01-15T09:15:00Z",
      actionUrl: "/admin/wallets"
    },
    {
      id: "3",
      type: "info",
      category: "tournament",
      title: "Tournament Starting Soon",
      message: "BGMI Championship starts in 15 minutes",
      isRead: true,
      priority: "low",
      createdAt: "2024-01-15T08:45:00Z",
      actionUrl: "/admin/tournaments"
    },
    {
      id: "4",
      type: "success",
      category: "system",
      title: "Database Backup Completed",
      message: "Daily backup completed successfully",
      isRead: true,
      priority: "low",
      createdAt: "2024-01-15T02:00:00Z"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "security":
        return <Shield className="w-4 h-4" />;
      case "financial":
        return <DollarSign className="w-4 h-4" />;
      case "tournament":
        return <Trophy className="w-4 h-4" />;
      case "user":
        return <Users className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2" data-testid="notification-trigger">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-96" data-testid="notification-panel">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Admin Notifications
            {unreadCount > 0 && (
              <Badge className="bg-primary/20 text-primary">
                {unreadCount} new
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          <div className="space-y-4">
            {mockNotifications.length > 0 ? (
              mockNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all duration-200 ${
                    !notification.isRead ? "border-primary/50 bg-primary/5" : "bg-muted/30"
                  }`}
                  data-testid={`notification-${notification.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notification.type)}
                        {getCategoryIcon(notification.category)}
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    
                    <h4 className="font-medium mb-1">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            disabled={markAsReadMutation.isPending}
                            data-testid={`mark-read-${notification.id}`}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotificationMutation.mutate(notification.id)}
                          disabled={deleteNotificationMutation.isPending}
                          data-testid={`delete-${notification.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        
                        {notification.actionUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.location.href = notification.actionUrl!}
                            data-testid={`action-${notification.id}`}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                <p className="text-muted-foreground">
                  All caught up! No new notifications.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
