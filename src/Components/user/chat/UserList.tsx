import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socketClient } from '@/socket/socket';
import { Chat, ChatPreview } from "@/types/ChatTypes";
import { useToast } from "@/hooks/ui/toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { MessageSquare, User, CircleDot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUserChatList } from "@/hooks/user/chat/useFetchChatUserListQueries"; // Import the new hook

interface UserListProps {
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserList: React.FC<UserListProps> = ({ onClose }) => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [newMessageUsers, setNewMessageUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const userData = useSelector((state: RootState) => state.user.User);
  const { receiverId } = useParams();
  
  // Use the new query hook
  const { refetch: refetchChats } = useUserChatList();

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await refetchChats(); // Trigger the query manually
      const data = response.data;
  
      if (data?.success && Array.isArray(data.chatList)) {
        const mappedChats: ChatPreview[] = data.chatList.map(
          (chat: Chat) => ({
            userId:
              chat.userId1._id === userData?._id
                ? chat.userId2._id
                : chat.userId1._id,
            userName:
              chat.userId1._id === userData?._id
                ? chat.userId2.Name
                : chat.userId1.Name,
            profileImage:
              chat.userId1._id === userData?._id
                ? chat.userId2.profileImage
                : chat.userId1.profileImage,
            onlineStatus: chat.userId1._id === userData?._id
                ? chat.userId2.onlineStatus
                : chat.userId1.onlineStatus,    
            lastMessage: chat.last_message,
            lastMessageTime: chat.updated_at,
          })
        );
        setChats(mappedChats);
       
      } else {
        setChats([]);
        toast.info("No Chats available");
      }
    } catch (error) {
      console.error("Error fetching chat list:", error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userData?._id) {
      toast.error("Please log in to view chats");
      setLoading(false);
      return;
    }

    socketClient.connect();
    socketClient.register(userData._id);

    fetchChats();

    const handleNewChat = ({ chat }: { chat: Chat }) => {
  
      const newChat: ChatPreview = {
        userId:
          chat.userId1._id === userData._id ? chat.userId2._id : chat.userId1._id,
        userName:
          chat.userId1._id === userData._id ? chat.userId2.Name : chat.userId1.Name,
        profileImage:
          (chat.userId1._id === userData._id
            ? chat.userId2.profileImage
            : chat.userId1.profileImage),
        lastMessage: chat.last_message,
        lastMessageTime: chat.updated_at,
      };
      setChats((prev) => {
        if (prev.some((c) => c.userId === newChat.userId)) {
          return prev.map((c) =>
            c.userId === newChat.userId ? newChat : c
          );
        }
        return [newChat, ...prev].sort(
          (a, b) =>
            new Date(b.lastMessageTime || 0).getTime() -
            new Date(a.lastMessageTime || 0).getTime()
        );
      });
      setNewMessageUsers((prev) => new Set(prev).add(newChat.userId));
    };

    const handleMessageSent = ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
    
      const otherUserId = senderId === userData._id ? receiverId : senderId;
      setNewMessageUsers((prev) => new Set(prev).add(otherUserId));
      if (senderId === userData._id || receiverId === userData._id) {
        fetchChats();
      }
    };

    const handleError = ({ message }: { message: string }) => {
      console.error('Socket error:', message);
    };

    socketClient.onNewChat(handleNewChat);
    socketClient.onMessageSent(handleMessageSent);
    socketClient.onError(handleError);

    return () => {
      socketClient.socket.off('newChat', handleNewChat);
      socketClient.socket.off('messageSent', handleMessageSent);
      socketClient.socket.off('error', handleError);
      socketClient.disconnect();
    };
  }, [userData?._id]);

  const handleChatClick = (userId: string) => {
    setNewMessageUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
    navigate(`/chats/${userId}`);
    onClose(false);
  };
  
  const formatMessageTime = (time: string | Date) => {
    try {
      return formatDistanceToNow(new Date(time), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting time:', error);
      return "";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col w-full max-w-sm px-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto">
      <div className=" bg-white dark:bg-black p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            <span>Messages</span>
          </h3>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-1">No conversations yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Start a new conversation to get connected</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.userId}
              onClick={() => handleChatClick(chat.userId)}
              className={`p-4 cursor-pointer transition-colors duration-150 
                ${chat.userId === receiverId 
                  ? 'bg-gray-100 dark:bg-gray-900' 
                  : newMessageUsers.has(chat.userId) 
                    ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
                }`}
            >
              <div className="flex items-center">
                <div className="relative">
                  {chat.profileImage ? (
                    <>
                    <img
                      src={chat.profileImage}
                      alt={chat.userName}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    {chat.onlineStatus === "online" ?
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      : <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 border-2 border-white rounded-full"></span>
                    }
                    </>
                  ) : (
                    <>
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-medium">
                      {chat.userName.charAt(0).toUpperCase()}
                    </div>
                    {chat.onlineStatus === "online" ?
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      : <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 border-2 border-white rounded-full"></span>
                    }
                    </>
                  )}
                  {newMessageUsers.has(chat?.userId) && (
                    <div className="absolute -top-1 -right-1">
                      <CircleDot className="h-5 w-5 text-blue-500 fill-blue-500 stroke-white dark:stroke-black" />
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[180px]">
                      {chat?.userName}
                    </h4>
                    {chat?.lastMessageTime && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatMessageTime(chat?.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  
                  {chat.lastMessage ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1 pr-2">
                      {chat.lastMessage}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic mt-1">
                      No messages yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;