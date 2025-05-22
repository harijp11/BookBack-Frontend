import { UserAxiosInstance } from "@/APIs/user_axios";


export interface NotificationFilter {
  isRead?: boolean;
  type?: 'warning' | 'info' | 'fault' | 'good' | 'normal';
}

interface Response {
    success:boolean,
    message:string
}

export interface INotificationEntity {
    _id?: string; 
    userId: string; 
    title: string; 
    message: string; 
    type: "warning" | "info" | "fault" | "good" | "normal"; 
    isRead: boolean; 
    navlink: string; 
    created_at: Date; 
    updated_at: Date; 
  }

export interface NotificationResponse {
    response:Response,
    notifications:INotificationEntity[],
                        totalnotifications:number,
                        totalPages:number,
                        currentPage:number,
}

export interface UnreadCountsResponse {
  success: boolean;
  message: string;
  unReadMessagesCount: number;
  unReadNotificationsCount: number;
}

export const fetchUserNotifications = async (
  filter: NotificationFilter = {},
  page: number = 1,
  limit: number = 5
):Promise<NotificationResponse> => {
  try {
    const response = await UserAxiosInstance.get('/user/notifications', {
      params: {
        filter,
        page,
        limit,
      },
    })

    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const fetchUnreadCounts = async (): Promise<UnreadCountsResponse | null> =>{
      const response = await UserAxiosInstance.get<UnreadCountsResponse>('/user/chat-notifications/unread-count');
      return response.data
  }
