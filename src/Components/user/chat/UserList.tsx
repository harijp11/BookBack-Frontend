import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserChatList } from "@/services/chat/chatServices";
import { socketClient } from '@/socket/socket';
import { Chat, ChatPreview } from "@/types/ChatTypes";
import { useToast } from "@/hooks/ui/toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const UserList: React.FC = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [newMessageUsers, setNewMessageUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const userData = useSelector((state: RootState) => state.user.User);

  const fetchChats = async () => {
    try {
      const response = await fetchUserChatList();
      console.log("fetchUserChatList response:", response);
      if (response.success && Array.isArray(response.chatList)) {
        const mappedChats: ChatPreview[] = response.chatList.map(
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
            lastMessage: chat.last_message,
            lastMessageTime: chat.updated_at,
          })
        );
        setChats(mappedChats);
        console.log("mappedChats:", mappedChats);
      } else {
        setChats([]);
        toast.info("Failed to fetch chat list");
      }
    } catch (error) {
      console.error("Error fetching chat list:", error);
      setChats([]);
      // toast.error("Error fetching chat list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userData?._id) {
      toast.error("User not authenticated");
      setLoading(false);
      return;
    }

    socketClient.connect();
    socketClient.register(userData._id);

    fetchChats();

    const handleNewChat = ({ chat }: { chat: Chat }) => {
      console.log('New chat received:', chat);
      const newChat: ChatPreview = {
        userId:
          chat.userId1._id === userData._id ? chat.userId2._id : chat.userId1._id,
        userName:
          chat.userId1._id === userData._id ? chat.userId2.Name : chat.userId1.Name,
        profileImage:
          (chat.userId1._id === userData._id
            ? chat.userId2.profileImage
            : chat.userId1.profileImage) || undefined,
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
            new Date(b.lastMessageTime).getTime() -
            new Date(a.lastMessageTime).getTime()
        );
      });
      setNewMessageUsers((prev) => new Set(prev).add(newChat.userId));
    };

    const handleMessageSent = ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
      console.log('Message sent received:', { senderId, receiverId });
      const otherUserId = senderId === userData._id ? receiverId : senderId;
      setNewMessageUsers((prev) => new Set(prev).add(otherUserId));
      if (senderId === userData._id || receiverId === userData._id) {
        fetchChats();
      }
    };

    const handleError = ({ message }: { message: string }) => {
      console.error('Socket error:', message);
      toast.error(message);
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
  };

  if (loading) return <p className="p-4">Loading chats...</p>;

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2 p-4">Your Chats</h3>
      <ul className="divide-y">
        {chats.length === 0 ? (
          <li className="p-4 text-gray-500">No conversations yet</li>
        ) : (
          chats.map((chat) => (
            <li
              key={chat.userId}
              onClick={() => handleChatClick(chat.userId)}
              className={`p-4 cursor-pointer hover:bg-gray-200 flex items-center ${
                newMessageUsers.has(chat.userId) ? 'bg-blue-50' : ''
              }`}
            >
              {chat.profileImage ? (
                <img
                  src={chat.profileImage}
                  alt={chat.userName}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center mr-3">
                  {chat.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-grow">
                <div className="flex items-center">
                  <strong>{chat.userName}</strong>
                  {newMessageUsers.has(chat.userId) && (
                    <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
                {chat.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    Last: {chat.lastMessage}
                  </p>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default UserList;