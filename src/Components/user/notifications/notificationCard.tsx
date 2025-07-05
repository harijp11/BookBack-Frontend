import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { AlertTriangle, ArrowRight, Bell, Check, Info, X } from "lucide-react";


interface Notification {
  _id: string;
  type: "warning" | "good" | "info" | "fault" | "normal";
  title?: string;
  message: string;
  isRead: boolean;
  created_at: string | Date;
  link?: string;
}

interface NotificationCardProps {
  notification: Notification;
  clearNotification: () => void;
}

export function NotificationCard({
  notification,
  clearNotification,
}: NotificationCardProps) {
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

  const formatDate = (dateString: string | Date) => {
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
        <Button
          variant="ghost"
          size="icon"
          onClick={clearNotification}
          className="group absolute top-2 right-2 h-5 w-5 rounded-full bg-transparent hover:bg-black transition-colors duration-200 opacity-70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          aria-label={`Clear ${notification.title || "notification"}`}
        >
          <X className="h-3.5 w-3.5 text-gray-600 group-hover:text-white transition-colors duration-200" />
        </Button>

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
                <Button variant="link" className="h-auto p-0 text-xs" asChild>
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
