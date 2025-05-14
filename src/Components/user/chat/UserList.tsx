import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserChatList } from "@/services/chat/chatServices";
import { Chat, ChatPreview } from "@/types/ChatTypes";
import { useToast } from "@/hooks/ui/toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const UserList: React.FC = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const userData = useSelector((state: RootState) => state.user.User);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [userData?._id]);

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
              onClick={() => navigate(`/chats/${chat.userId}`)}
              className="p-4 cursor-pointer hover:bg-gray-200 flex items-center"
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
              <div>
                <strong>{chat.userName}</strong>
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
