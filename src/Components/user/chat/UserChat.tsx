import React, { useState, useEffect, useRef } from 'react';
import { socketClient } from '@/socket/socket';
import { getCloudinarySignature } from '@/services/chat/chatServices';
import { Message, CloudinarySignatureResponse } from '@/types/ChatTypes';
import { useToast } from '@/hooks/ui/toast';
import { AxiosError } from 'axios';
import { Paperclip, Send, Smile, FileText } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { useFetchReceiverDetails } from '@/hooks/user/chat/useReceiverDetailsQueries';

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
  const [isReceiverTyping, setIsReceiverTyping] = useState(false); // Added for typing status
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Added for typing timeout

  const userData = useSelector((state: RootState) => state.user.User);
  
  const { data: receiverData, isLoading: isReceiverLoading, error: receiverError } = useFetchReceiverDetails(receiverId);
  const receiverName = receiverData?.receiverDetails?.Name || receiverId;
  const receiverProfileImage = receiverData?.receiverDetails?.profileImage || `https://placehold.co/40x40?text=${receiverName.charAt(0).toUpperCase()}`;
  const receiverOnlineStatus = receiverData?.receiverDetails?.onlineStatus || "offline";
 

  const chatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());
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

    if (!userData?._id) {
      console.error('User not authenticated', { userId });
      toast.error('Please log in to use chat');
      return;
    }

  
    socketClient.connect();
    socketClient.register(userId);

    const handleMessages = ({ messages }: { messages: Message[] }) => {
    
      if (!Array.isArray(messages)) {
        console.error('Invalid messages format: not an array', messages);
        return;
      }
      setMessages(messages);
    };

    const handleReceiveMessage = ({ chatId, message }: { chatId: string; message: Message }) => {
      console.log('Received message:', { chatId, message });
      console.log('Checking message for chat:', {
        messageId: message._id,
        senderId: message.senderId?._id,
        receiverId: message.receiverId?._id,
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
        (senderId === receiverId && messageReceiverId === userId) ||
        (senderId === userId && messageReceiverId === receiverId);

      if (!isMessageForCurrentChat) {
        console.log('Message ignored (wrong chat):', {
          messageId: message._id,
          senderId,
          receiverId: messageReceiverId,
          expectedSenderId: receiverId,
          expectedReceiverId: userId,
          messageContent: message.content,
        });
        return;
      }

      setMessages((prev) => {
        if (prev.some((msg) => msg._id === message._id)) {
          console.log('Duplicate message ignored:', message._id);
          return prev;
        }
        console.log('Adding message to chat:', { messageId: message._id, content: message.content });
        return [...prev, message];
      });
    };

    const handleMessageStatusUpdated = ({ messageId, status }: { messageId: string; status: 'sent' | 'delivered' | 'read' }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    };

    // Added: Handle typing status
    const handleTypingStatus = ({ senderId, isTyping }: { senderId: string; isTyping: boolean }) => {
      console.log('Typing status received:', { senderId, receiverId, isTyping });
      if (senderId === receiverId) {
        setIsReceiverTyping(isTyping);
      }
    };

    const handleError = ({ message }: { message: string }) => {
      console.error('Socket error:', message, { userId, receiverId });
      if (message === 'Failed to update message status') {
        console.warn('Suppressing toast for known status update error');
        return;
      }
      toast.error(message);
    };

    const handleConnectError = (error: Error) => {
      console.error('Socket.IO connection error:', error, { userId, receiverId });
      toast.error('Failed to connect to chat server');
    };

  
    socketClient.getMessages(userId, receiverId, handleMessages);
    socketClient.onReceiveMessage(handleReceiveMessage);
    socketClient.onMessageStatusUpdated(handleMessageStatusUpdated);
    socketClient.onTypingStatus(handleTypingStatus); // Added: Listen for typing status
    socketClient.onError(handleError);
    socketClient.socket.on('connect_error', handleConnectError);

    return () => {
   
      socketClient.socket.off('messageHistory', handleMessages);
      socketClient.socket.off('receiveMessage', handleReceiveMessage);
      socketClient.socket.off('messageStatusUpdated', handleMessageStatusUpdated);
      socketClient.socket.off('typingStatus', handleTypingStatus); // Added: Cleanup typing status
      socketClient.socket.off('error', handleError);
      socketClient.socket.off('connect_error', handleConnectError);
      socketClient.disconnect();
    };
  }, [userId, receiverId, userData?._id]);

  useEffect(() => {
    if (receiverError) {
      console.error('Receiver details fetch failed:', receiverError);
      toast.error('Failed to load receiver details');
    }
  }, [receiverError]);

  useEffect(() => {
    messages.forEach((msg) => {
      const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
      if (
        senderId === receiverId &&
        msg.status !== 'read' &&
        !processedMessageIds.current.has(msg._id) &&
        msg._id
      ) {
     
        socketClient.updateMessageStatus(msg._id, 'read');
        processedMessageIds.current.add(msg._id);
      } else if (!msg._id) {
        console.warn('Skipping invalid message for status update:', { message: msg });
      }
    });
  }, [messages, receiverId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Added: Handle typing event
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (content.trim() || showEmojiPicker) {
      socketClient.emitTyping({ senderId: userId, receiverId, isTyping: true });
      typingTimeoutRef.current = setTimeout(() => {
        socketClient.emitTyping({ senderId: userId, receiverId, isTyping: false });
      },1000);
    }
  };

  const handleSendMessage = async () => {
    if (!content && !media) {
      toast.error('Please enter a message or select a media file');
      return;
    }

    try {
      let mediaUrl = '';
      if (media) {
        setIsUploading(true);
       
        const signatureData: CloudinarySignatureResponse = await getCloudinarySignature();
        const { signature, timestamp, cloudName } = signatureData;

        const formData = new FormData();
        formData.append('file', media);
        formData.append('api_key', signatureData.apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', signatureData.folder);
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
      
      }

    
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

  const getMediaType = (url: string): 'image' | 'video' | 'pdf' | 'text' | 'unknown' => {
    const cleanUrl = url.split('?')[0];
    const extension = cleanUrl.split('.').pop()?.toLowerCase();
    if (!extension) return 'unknown';

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
    const pdfExtensions = ['pdf'];
    const textExtensions = ['txt'];

    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    if (pdfExtensions.includes(extension)) return 'pdf';
    if (textExtensions.includes(extension)) return 'text';
    return 'unknown';
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji);
  };

  const formatTime = (timestamp: Date | number | string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
const getStatusStyle = (status: string, type: string) => {
  const baseStyle = 'flex items-center gap-1 text-xs mt-1';
  const mediaStyle = type === 'media' ? 'bg-black/60 px-2 py-1 rounded-md' : '';

  let statusStyle = 'text-gray-100';

  switch (status) {
    case 'read':
      statusStyle = 'text-blue-400 font-semibold';
      break;
    case 'sent':
    case 'delivered':
    default:
      statusStyle = 'text-gray-100';
      break;
  }

  return `${baseStyle} ${mediaStyle} ${statusStyle}`;
};

  return (
    <>
      {/* Added: CSS for color-changing typing dots */}
      <style>
        {`
          @keyframes colorCycle {
            0% { background-color: #2563eb; } /* Blue-600 */
            33% { background-color: #60a5fa; } /* Blue-400 */
            66% { background-color: #bfdbfe; } /* Blue-200 */
            100% { background-color: #2563eb; } /* Blue-600 */
          }
          .dot1 {
            animation: colorCycle 1.2s infinite;
          }
          .dot2 {
            animation: colorCycle 1.2s infinite 0.4s;
          }
          .dot3 {
            animation: colorCycle 1.2s infinite 0.8s;
          }
        `}
      </style>
      <div className="flex flex-col h-[80vh] w-full max-w-full">
        <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center">
          <div className="flex items-center flex-grow">
            {isReceiverLoading ? (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="ml-3">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mt-2"></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="relative">
                  <img 
                    src={receiverProfileImage} 
                    alt={receiverName} 
                    className="w-10 h-10 rounded-full"
                  />
                  {receiverOnlineStatus === "online" ?
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    : <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 border-2 border-white rounded-full"></span>
                  }
                </div>
                <div className="ml-3">
                  <h2 className="font-medium text-gray-900">{receiverName}</h2>
                  <p className={receiverOnlineStatus === "online" ? "text-xs text-green-500" : "text-xs text-gray-500"}>
                    {receiverOnlineStatus}
                  </p>
                </div>
              </div>
            )}
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
            messages.map((msg) => {
              const senderId = typeof msg.senderId === 'object' && msg.senderId?._id 
                ? msg.senderId._id 
                : msg.senderId;
              const isCurrentUser = senderId === userData?._id;

              return (
                <div 
                  key={msg._id}
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
                        <div className="text-xs mt-1 opacity-70 text-right flex justify-end items-center gap-2">
                          <span>{formatTime(msg.created_at)}</span>
                          {isCurrentUser && (
                            <span
                              className={getStatusStyle(msg.status,msg.messageType)}
                              style={{
                                letterSpacing: msg.status !== 'sent' ? '-3px' : 'normal',
                              }}
                            >
                              {msg.status === 'sent' && '✓'}
                              {msg.status === 'delivered' && '✓✓'}
                              {msg.status === 'read' && '✓✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-lg overflow-hidden ${isCurrentUser ? 'ml-auto' : ''}`}>
                        {(() => {
                          const mediaType = getMediaType(msg.mediaUrl!);
                          switch (mediaType) {
                            case 'image':
                              return (
                                <img
                                  src={msg.mediaUrl}
                                  alt="chat media"
                                  className="max-w-full rounded-lg shadow-sm"
                                  style={{ maxHeight: '250px' }}
                                />
                              );
                            case 'video':
                              return (
                                <video
                                  src={msg.mediaUrl}
                                  controls
                                  className="max-w-full rounded-lg shadow-sm"
                                  style={{ maxHeight: '250px' }}
                                />
                              );
                            case 'pdf':
                            case 'text':
                              return (
                                <div className="flex items-center justify-center bg-gray-100 p-4 rounded-lg">
                                  <FileText className="h-8 w-8 text-gray-500 mr-2" />
                                  <a
                                    href={msg.mediaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {mediaType === 'pdf' ? 'View PDF' : 'View Text File'}
                                  </a>
                                </div>
                              );
                            default:
                              return (
                                <div className="flex items-center justify-center bg-gray-100 p-4 rounded-lg">
                                  <FileText className="h-8 w-8 text-gray-500 mr-2" />
                                  <a
                                    href={msg.mediaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    View File
                                  </a>
                                </div>
                              );
                          }
                        })()}
                        <div className={`text-xs mt-1 flex justify-end items-center gap-2 ${isCurrentUser ? 'text-right text-gray-800' : 'text-gray-800'}`}>
                          <span>{formatTime(msg.created_at)}</span>
                          {isCurrentUser && (
                            <span
                              className={getStatusStyle(msg.status,msg.messageType)}
                              style={{
                                letterSpacing: msg.status !== 'sent' ? '-3px' : 'normal',
                              }}
                            >
                              {msg.status === 'sent' && '✓'}
                              {msg.status === 'delivered' && '✓✓'}
                              {msg.status === 'read' && '✓✓'}
                            </span>
                          )}
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
          {/* Added: Typing indicator with color-changing dots */}
          {isReceiverTyping && (
            <div className="text-sm text-gray-600 italic mb-2">
              typing
              <span className="inline-flex">
                <span className="dot1 w-1 h-1.5 rounded-full mx-1" />
                <span className="dot2 w-1 h-1.5 rounded-full mx-1" />
                <span className="dot3 w-1 h-1.5 rounded-full mx-1" />
              </span>
            </div>
          )}
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
              accept="image/*,video/mp4,video/webm,application/pdf,text/plain"
              onChange={(e) => setMedia(e.target.files ? e.target.files[0] : null)}
              className="hidden"
            />
            <input
              type="text"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                handleTyping(); // Added: Trigger typing event
              }}
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
    </>
  );
};

export default Chat;