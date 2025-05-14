import React, { useState, useEffect, useRef } from 'react';
import { socketClient } from '@/socket/socket';
import { getCloudinarySignature } from '@/services/chat/chatServices';
import { Message, CloudinarySignatureResponse } from '@/types/ChatTypes';
import { useToast } from '@/hooks/ui/toast';
import { AxiosError } from 'axios';
import { Paperclip, Send, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';

interface ChatProps {
  userId: string;
  receiverId: string;
}

const Chat: React.FC<ChatProps> = ({ userId, receiverId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [receiverName, setReceiverName] = useState(receiverId);

  const userData = useSelector((state: RootState) => state.user.User);
  
  const chatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!userId || !receiverId) {
      console.error('Invalid chat configuration: missing userId or receiverId', { userId, receiverId });
      toast.error('Invalid chat configuration');
      return;
    }

    if (userId === receiverId) {
      console.error('Invalid chat configuration: userId and receiverId are the same', { userId, receiverId });
      toast.error('Cannot open chat with yourself');
      return;
    }

    console.log('Setting up socket for chat:', { userId, receiverId });
    socketClient.connect();
    socketClient.register(userId);

    const handleMessages = ({ messages }: { messages: Message[] }) => {
      console.log('Messages received:', messages);
      if (!Array.isArray(messages)) {
        console.error('Invalid messages format: not an array', messages);
        return;
      }
      setMessages(messages);
      if (messages.length > 0 && messages[0].receiverId?._id === receiverId) {
        const possibleName = messages[0].receiverId.Name;
        if (possibleName) setReceiverName(possibleName);
      }
    };

    const handleReceiveMessage = ({ chatId, message }: { chatId: string; message: Message }) => {
      console.log('Received message:', { chatId, message });
      console.log('Checking message for chat:', {
        messageId: message.messageId,
        senderId: message.senderId._id,
        receiverId: message.receiverId._id,
        currentUserId: userId,
        currentReceiverId: receiverId,
      });

      const senderId = message.senderId?._id;
      const messageReceiverId = message.receiverId?._id;

      if (!senderId || !messageReceiverId) {
        console.log('Invalid message: missing senderId or receiverId', message);
        return;
      }

      const isMessageForCurrentChat =
        (senderId === receiverId && messageReceiverId === userId) || // Incoming message from other user
        (senderId === userId && messageReceiverId === receiverId);  // Outgoing message from current user

      if (!isMessageForCurrentChat) {
        console.log('Message ignored (wrong chat):', {
          messageId: message.messageId,
          senderId,
          receiverId: messageReceiverId,
          expectedSenderId: receiverId,
          expectedReceiverId: userId,
          messageContent: message.content,
        });
        return;
      }

      setMessages((prev) => {
        if (prev.some((msg) => msg.messageId === message.messageId)) {
          console.log('Duplicate message ignored:', message.messageId);
          return prev;
        }
        console.log('Adding message to chat:', { messageId: message.messageId, content: message.content });
        return [...prev, message];
      });
    };

    const handleError = ({ message }: { message: string }) => {
      console.error('Socket error:', message);
      toast.error(message);
    };

    const handleConnectError = (error: Error) => {
      console.error('Socket.IO connection error:', error);
      toast.error('Failed to connect to chat server');
    };

    console.log('Emitting getMessages:', { userId, receiverId });
    socketClient.getMessages(userId, receiverId, handleMessages);
    socketClient.onReceiveMessage(handleReceiveMessage);
    socketClient.onError(handleError);
    socketClient.socket.on('connect_error', handleConnectError);

    return () => {
      console.log('Cleaning up socket listeners for:', { userId, receiverId });
      socketClient.socket.off('messageHistory', handleMessages);
      socketClient.socket.off('receiveMessage', handleReceiveMessage);
      socketClient.socket.off('error', handleError);
      socketClient.socket.off('connect_error', handleConnectError);
      socketClient.disconnect();
    };
  }, [userId, receiverId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!content && !media) {
      toast.error('Please enter a message or select a media file');
      return;
    }

    try {
      let mediaUrl = '';
      if (media) {
        setIsUploading(true);
        console.log('Uploading media to Cloudinary:', media.name);
        const signatureData: CloudinarySignatureResponse = await getCloudinarySignature();
        const { signature, timestamp, cloudName, apiKey, folder } = signatureData;

        const formData = new FormData();
        formData.append('file', media);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);
        formData.append('resource_type', 'auto');

        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Media upload failed: ${errorText}`);
        }

        const uploadData = await uploadResponse.json();
        mediaUrl = uploadData.secure_url;
        console.log('Media uploaded:', mediaUrl);
      }

      console.log('Sending message:', { userId, receiverId, content, mediaUrl, messageType: media ? 'media' : 'text' });
      socketClient.sendMessage(userId, receiverId, content, mediaUrl, media ? 'media' : 'text');
      socketClient.emitMessageSent({ senderId: userId, receiverId });
      setContent('');
      setMedia(null);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        userId,
        receiverId,
        content,
        media: media?.name,
      });
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message || 'Failed to send message'
          : (error as Error).message
      );
    } finally {
      setIsUploading(false);
    }
  };

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg)$/i);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji);
  };

  const formatTime = (timestamp: string | number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-full">
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center">
        <div className="flex items-center flex-grow">
          <div className="relative">
            <img 
              src={`https://placehold.co/40x40?text=${receiverName.charAt(0).toUpperCase()}`} 
              alt={receiverName} 
              className="w-10 h-10 rounded-full"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="ml-3">
            <h2 className="font-medium text-gray-900">{receiverName}</h2>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
      </div>
      <div 
        ref={chatRef} 
        className="flex-grow p-4 overflow-y-auto bg-gray-50"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <Paperclip className="h-6 w-6 text-gray-400" />
            </div>
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const senderId = typeof msg.senderId === 'object' && msg.senderId?._id 
              ? msg.senderId._id 
              : msg.senderId;
            const isCurrentUser = senderId === userData?._id;
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const prevSenderId = prevMessage 
              ? (typeof prevMessage.senderId === 'object' && prevMessage.senderId?._id 
                  ? prevMessage.senderId._id 
                  : prevMessage.senderId)
              : null;
            const showSender = !prevMessage || prevSenderId !== senderId;

            return (
              <div 
                key={msg.messageId}
                className={`mb-4 ${isCurrentUser ? 'flex justify-end' : 'flex justify-start'}`}
              >
                <div className={`max-w-[70%]`}>
                  {msg.messageType === 'text' ? (
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? 'bg-black text-white rounded-tr-none'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'
                      }`}
                    >
                      <p className="break-words">{msg.content}</p>
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  ) : (
                    <div className={`rounded-lg overflow-hidden ${isCurrentUser ? 'ml-auto' : ''}`}>
                      {isVideo(msg.mediaUrl!) ? (
                        <video
                          src={msg.mediaUrl}
                          controls
                          className="max-w-full rounded-lg shadow-sm"
                          style={{ maxHeight: '250px' }}
                        />
                      ) : (
                        <img
                          src={msg.mediaUrl}
                          alt="chat media"
                          className="max-w-full rounded-lg shadow-sm"
                          style={{ maxHeight: '250px' }}
                        />
                      )}
                      <div className={`text-xs mt-1 ${isCurrentUser ? 'text-right text-gray-500' : 'text-gray-500'}`}>
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        {media && (
          <div className="mb-2 p-2 bg-gray-100 rounded-md flex items-center justify-between">
            <span className="text-sm truncate max-w-[200px]">{media.name}</span>
            <button
              onClick={() => setMedia(null)}
              className="text-gray-500 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        )}
        <div className="relative flex items-center">
          <button
            onClick={handleFileClick}
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              title="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-10">
                <div className="shadow-xl rounded-lg">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm"
            onChange={(e) => setMedia(e.target.files ? e.target.files[0] : null)}
            className="hidden"
          />
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow mx-2 py-2 px-4 bg-gray-100 rounded-full border border-transparent focus:outline-none focus:border-gray-300 transition-colors"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isUploading) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={isUploading || (!content && !media)}
            className={`p-2 rounded-full ${
              isUploading || (!content && !media)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } focus:outline-none transition-colors`}
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;