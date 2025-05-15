"use client";

import { useState, useMemo } from "react";
import { Bell, Check, Info, AlertTriangle, X, ArrowRight, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchNotifications } from "@/hooks/user/notifications/useNotificationQueries";
import { Loader2 } from "lucide-react";
import { Pagination1 } from "@/Components/common/pagination/pagination1";

// Type definitions for notifications
interface Notification {
  id: string;
  type: "warning" | "good" | "info" | "fault" | "normal";
  title?: string;
  message: string;
  isRead: boolean;
  created_at: string;
  link?: string;
}

export default function Index() {
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 5;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const notificationFilter = useMemo(
    () =>
      filter === "all"
        ? {}
        : filter === "unread"
        ? { isRead: false }
        : { type: filter as "warning" | "info" | "fault" | "good" | "normal" },
    [filter]
  );

  const { data, isLoading, isError, error, isFetching, isSuccess } = useFetchNotifications(notificationFilter, page, limit);
  console.log("Query State:", { data, isLoading, isError, error, isFetching, isSuccess });

  // Map raw INotificationEntity[] to Notification[]
  const notifications: Notification[] = (data?.notifications || []).map(notification => ({
    id: notification._id || "",
    type: notification.type,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    created_at: notification.created_at, // Already a string
    link: notification.navlink || undefined,
  }));
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || page;

  const markAsRead = (id: string) => {
    console.log(`Marking notification ${id} as read`);
  };

  const markAllAsRead = () => {
    console.log("Marking all notifications as read");
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = notifications;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="mr-2"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Bell className="mr-2 h-6 w-6" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={markAllAsRead}
          disabled={unreadCount === 0 || isLoading || isFetching}
          className="text-sm"
        >
          <Check className="mr-1 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex overflow-x-auto scrollbar-none p-1">
          <Button 
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setFilter("all"); setPage(1); }}
            className="mx-1 whitespace-nowrap"
          >
            All
          </Button>
          <Button 
            variant={filter === "unread" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setFilter("unread"); setPage(1); }}
            className="mx-1 whitespace-nowrap"
          >
            Unread
          </Button>
          <Button 
            variant={filter === "warning" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setFilter("warning"); setPage(1); }}
            className="mx-1 whitespace-nowrap"
          >
            Warnings
          </Button>
          <Button 
            variant={filter === "good" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setFilter("good"); setPage(1); }}
            className="mx-1 whitespace-nowrap"
          >
            Good News
          </Button>
          <Button 
            variant={filter === "info" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setFilter("info"); setPage(1); }}
            className="mx-1 whitespace-nowrap"
          >
            Information
          </Button>
          <Button 
            variant={filter === "fault" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setFilter("fault"); setPage(1); }}
            className="mx-1 whitespace-nowrap"
          >
            Faults
          </Button>
          <Button 
            variant={filter === "normal" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setFilter("normal"); setPage(1); }}
            className="mx-1 whitespace-nowrap"
          >
            Normal
          </Button>
        </div>
      </Card>

      {isLoading || isFetching ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <X className="h-12 w-12 text-red-500 mb-2" />
          <h3 className="text-lg font-medium">Error loading notifications</h3>
          <p className="text-muted-foreground">
            {error?.message || "Something went wrong. Please try again later."}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => queryClient.refetchQueries(["notifications"])}
          >
            Retry
          </Button>
        </div>
      ) : !isSuccess || !data ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <X className="h-12 w-12 text-red-500 mb-2" />
          <h3 className="text-lg font-medium">No data available</h3>
          <p className="text-muted-foreground">Unable to load notifications. Please try again.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => queryClient.refetchQueries(["notifications"])}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <ScrollArea className="h-[70vh]">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <NotificationCard 
                    key={notification.id} 
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-2" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-muted-foreground">
                  {filter !== "all" 
                    ? `You don't have any ${filter} notifications` 
                    : "You're all caught up!"}
                </p>
              </div>
            )}
          </ScrollArea>

          <Pagination1
            currentPage={currentPage}
            totalPages={totalPages}
            onPagePrev={() => setPage(prev => Math.max(prev - 1, 1))}
            onPageNext={() => setPage(prev => prev + 1)}
            onPageSelect={(pageNum) => setPage(pageNum)}
          />
        </>
      )}
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "good":
        return <Check className="h-5 w-5 text-emerald-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "fault":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case "warning":
        return "hover:bg-[#FEF7CD]";
      case "good":
        return "hover:bg-[#F2FCE2]";
      case "info":
        return "hover:bg-[#D3E4FD]";
      case "fault":
        return "hover:bg-[#FFDEE2]";
      default:
        return "hover:bg-[#F1F0FB]";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  return (
    <Card className={`transition-all ${getBackgroundColor()} border-l-4 border-l-black h-[140px]`}>
      <CardContent className="p-4 h-full">
        <div className="flex h-full items-start gap-4">
          <div className="flex-shrink-0 mt-1 bg-gray-100 p-2 rounded-full">
            {getIcon()}
          </div>
          
          <div className="flex-1 flex flex-col h-full">
            <div className="flex items-start justify-between">
              <div className="overflow-hidden">
                {notification.title && (
                  <h3 className="font-semibold text-base truncate">
                    {notification.title}
                  </h3>
                )}
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{notification.message}</p>
              </div>
              
              {!notification.isRead && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-8 w-8 p-0 rounded-full ml-2 flex-shrink-0"
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Mark as read</span>
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-auto text-xs">
              <span className="text-muted-foreground">
                {formatDate(notification.created_at)}
              </span>
              
              {notification.link && (
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-xs"
                  asChild
                >
                  <a href={notification.link} className="flex items-center">
                    View details
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}