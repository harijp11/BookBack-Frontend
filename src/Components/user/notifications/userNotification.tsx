"use client";

import { useState, useMemo } from "react";
import {
  Bell,
  X,
  ArrowLeft,
} from "lucide-react";
import { Card,} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useFetchNotifications } from "@/hooks/user/notifications/useNotificationQueries";
import { Loader2 } from "lucide-react";
import { Pagination1 } from "@/Components/common/pagination/pagination1";
import { INotificationEntity } from "@/services/notifications/notificationService";
import { motion } from "framer-motion";
import {
  useClearNotifications,
  useClearNotificationById,
} from "@/hooks/user/notifications/useClearNotifications"; // Added import
import { NotificationCard } from "./notificationCard";

// Type definitions for notifications
interface Notification {
  _id: string;
  type: "warning" | "good" | "info" | "fault" | "normal";
  title?: string;
  message: string;
  isRead: boolean;
  created_at: string | Date;
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
  const [filter, setFilter] = useState<string>("unread");
  const [page, setPage] = useState<number>(1);
  const navigate = useNavigate();

  // Added hooks
  const { mutate: clearAll } = useClearNotifications();
  const { mutate: clearById } = useClearNotificationById();

  const notificationFilter = useMemo(
    () =>
      filter === "all"
        ? {}
        : filter === "unread"
        ? { isRead: false }
        : filter === "read"
        ? { isRead: true }
        : { type: filter as "warning" | "info" | "fault" | "good" | "normal" },
    [filter]
  );

  const { data, isLoading, isError, error, isFetching, isSuccess } =
    useFetchNotifications(notificationFilter, page, 8);

  const notifications: Notification[] =
    data?.notifications.map((notification) => ({
      _id: notification._id || "",
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      created_at: notification.created_at,
      link: notification.navlink || undefined,
    })) || [];

  const unreadCount = notifications.filter((n) => !n.isRead).length;
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
        {/* Added Clear All button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => clearAll()}
          disabled={notifications.length === 0}
        >
          Clear All
        </Button>
      </div>
      <Card className="mb-6">
      
        <div className="flex overflow-x-auto scrollbar-none p-1">
          {[
            "all",
            "read",
            "unread",
            "warning",
            "good",
            "info",
            "fault",
            "normal",
          ].map((type) => (
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
              {type === "all"
                ? "All"
                : type.charAt(0).toUpperCase() + type.slice(1)}
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
          <p className="text-muted-foreground">
            Unable to load notifications. Please try again.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/notifications")}
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
                    key={notification._id}
                    notification={notification}
                    clearNotification={() => clearById(notification._id)} // Added prop
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
                currentPage={page}
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

