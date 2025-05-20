"use client";

import { useState, useMemo } from "react";
import { Bell, Check, Info, AlertTriangle, X, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchNotifications } from "@/hooks/user/notifications/useNotificationQueries";
import { Loader2 } from "lucide-react";
import { Pagination1 } from "@/Components/common/pagination/pagination1"; // Import the Pagination1 component
import { INotificationEntity } from "@/services/notifications/notificationService";
import { motion } from "framer-motion";

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

export interface NotificationResponse {
  response: Response;
  notifications: INotificationEntity;
  totalnotifications: number;
  totalPages: number;
  currentPage: number;
}

export default function Index() {
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
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

  const { data, isLoading, isError, error, isFetching, isSuccess } = useFetchNotifications(notificationFilter, page,6);

  const notifications: Notification[] = (data?.notifications || []).map(notification => ({
    id: notification._id || "",
    type: notification.type,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    created_at: notification.created_at,
    link: notification.navlink || undefined,
  }));

  const markAsRead = (id: string) => {
    console.log(`Marking notification ${id} as read`);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = notifications;

  const handlePagePrev = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handlePageNext = () => {
    if (data?.totalPages && page < data.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePageSelect = (selectedPage: number) => {
    setPage(selectedPage);
  };

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
      </div>

      <Card className="mb-6">
        <div className="flex overflow-x-auto scrollbar-none p-1">
          {["all", "warning", "good", "info", "fault", "normal"].map((type) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setFilter(type);
                setPage(1); // Reset to first page when changing filter
              }}
              className="mx-1 whitespace-nowrap capitalize"
            >
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
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
            onClick={() => navigate("/notification")}
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
        <div>
          <ScrollArea className="h-[60vh]">
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

          {data.totalPages > 1 && (
             <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Pagination1
                  currentPage={data.currentPage}
                  totalPages={data.totalPages}
                  onPagePrev={handlePagePrev}
                  onPageNext={handlePageNext}
                  onPageSelect={handlePageSelect}
                />
              </motion.div>
            )}
        </div>
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

  const getHoverColor = () => {
    if (!notification.isRead) return "";
    switch (notification.type) {
      case "warning":
        return "hover:bg-amber-50";
      case "good":
        return "hover:bg-emerald-50";
      case "info":
        return "hover:bg-blue-50";
      case "fault":
        return "hover:bg-red-50";
      default:
        return "hover:bg-gray-50";
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
    <Card
      className={`relative transition-all duration-200 ${getHoverColor()} h-[140px] ${
        !notification.isRead
          ? `shadow-lg brightness-110 after:w-5 after:h-5 after:bg-red-500 after:rounded-bl-md 
          after:border-l-2 after:border-b-2 after:border-white after:-translate-x-0.5 after:-translate-y-0.5 border-l-4 border-black`
          : "border-l-4 border-gray-400"
      }`}
    >
      <CardContent className="p-4 h-full">
        <div className="flex h-full items-start gap-4">
          <div className="flex-shrink-0 mt-1 bg-gray-100 p-2 rounded-full">
            {getIcon()}
          </div>
          <div className="flex-1 flex flex-col h-full">
            <div className="flex items-start justify-between">
              <div className="overflow-hidden">
                {notification.title && (
                  <h3
                    className={`font-semibold text-base truncate ${
                      !notification.isRead ? "text-gray-900 font-bold" : ""
                    }`}
                  >
                    {notification.title}
                  </h3>
                )}
                <p
                  className={`text-sm text-gray-700 mt-1 line-clamp-2 ${
                     !notification.isRead ? "font-medium" : ""
                  }`}
                >
                  {notification.message}
                </p>
              </div>
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