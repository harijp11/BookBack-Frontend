
export interface Message {
  _id:string
  messageId:string;
    chatId: string;
    senderId: User;
    receiverId: User;
    content?: string;
    mediaUrl?: string;
    status: 'sent' | 'delivered' | 'read'
    messageType: 'text' | 'media';
    created_at: Date
    updated_at:Date
  }
  
  export interface ChatMessage {
    chatId: string;
    message: Message;
  }
  
  export interface MessageHistory {
    messages: Message[];
  }
  
  export interface CloudinarySignatureResponse {
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder: string;
  }
  
  export interface UserData {
    userId: string;
    token: string;
  }
  
  export interface LoginResponse {
    success: boolean;
    data?: UserData;
    message?: string;
  }

  export interface User{
    _id:string
    Name:string
    profileImage:string
    onlineStatus:string
  }
  
  export interface Chat {
    _id:string
    chatId:string
    userId1:User
    userId2: User;
    last_message?: string;
    created_at:Date
    updated_at:Date
  }

export interface ChatPreview {
    userId: string;
    profileImage:string
    userName: string;
    onlineStatus?:string
    lastMessage?: string;
    lastMessageTime?: Date;
  }
  