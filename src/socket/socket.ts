import { io, Socket } from 'socket.io-client';
import { MessageHistory, ChatMessage, Chat } from '@/types/ChatTypes';

const SOCKET_URL = 'https://bookback-server.harijp.tech'
//  ;

export class SocketClient {
  public socket: Socket;
  private isInitialized: boolean = false;

  constructor() {
    this.socket = io(SOCKET_URL, { 
      autoConnect: true,
      reconnection: true,   
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });
  }

  connect(): void {
    if (!this.isInitialized) {
      console.log('Initializing socket connection to:', SOCKET_URL);
      this.socket.connect();
      this.isInitialized = true;
    }
  }

  disconnect(): void {
    console.log('Socket disconnecting, id:', this.socket.id);
    this.socket.disconnect();
    this.isInitialized = false;
  }

  register(userId: string): void {
    console.log('Registering user:', userId);
    this.socket.emit('register', { userId });
  }

  getMessages(senderId: string, receiverId: string, callback: (data: MessageHistory) => void): void {
    console.log('Emitting getMessages:', { senderId, receiverId });
    this.socket.emit('getMessages', { senderId, receiverId });
    this.socket.off('messageHistory');
    this.socket.on('messageHistory', (data: MessageHistory) => {
      console.log('Received messageHistory:', data);
      callback(data);
    });
  }

  sendMessage(senderId: string, receiverId: string, content: string, mediaUrl: string, messageType: 'text' | 'media'): void {
    console.log('Emitting sendMessage:', { senderId, receiverId, content, mediaUrl, messageType });
    this.socket.emit('sendMessage', { senderId, receiverId, content, mediaUrl, messageType });
  }

  emitMessageSent(data: { senderId: string; receiverId: string }): void {
    console.log('Emitting messageSent:', data);
    this.socket.emit('messageSent', data);
  }

  // Added: Emit typing status
  emitTyping(data: { senderId: string; receiverId: string; isTyping: boolean }): void {
    console.log('Emitting typing:', data);
    this.socket.emit('typing', data);
  }

  updateMessageStatus(messageId: string, status: 'delivered' | 'read'): void {
    console.log('Emitting updateMessageStatus:', { messageId, status });
    this.socket.emit('updateMessageStatus', { messageId, status });
  }

  onReceiveMessage(callback: (data: ChatMessage) => void): void {
    this.socket.off('receiveMessage');
    this.socket.on('receiveMessage', (data: ChatMessage) => {
      console.log('Received message:', data);
      console.log('Message details:', {
        chatId: data.chatId,
        messageId: data.message._id,
        senderId: data.message.senderId,
        receiverId: data.message.receiverId,
        content: data.message.content,
      });
      callback(data);
    });
  }

  onNewChat(callback: (data: { chat: Chat }) => void): void {
    this.socket.off('newChat');
    this.socket.on('newChat', (data: { chat: Chat }) => {
      console.log('Received newChat:', data);
      callback(data);
    });
  }

  onMessageSent(callback: (data: { senderId: string; receiverId: string }) => void): void {
    this.socket.off('messageSent');
    this.socket.on('messageSent', (data: { senderId: string; receiverId: string }) => {
      console.log('Received messageSent:', data);
      callback(data);
    });
  }

  onMessageStatusUpdated(callback: (data: { messageId: string; status: 'sent' | 'delivered' | 'read' }) => void): void {
    this.socket.off('messageStatusUpdated');
    this.socket.on('messageStatusUpdated', (data: { messageId: string; status: 'sent' | 'delivered' | 'read' }) => {
      console.log('Received messageStatusUpdated:', data);
      callback(data);
    });
  }

  // Added: Listen for typing status
  onTypingStatus(callback: (data: { senderId: string; isTyping: boolean }) => void): void {
    this.socket.off('typingStatus');
    this.socket.on('typingStatus', (data: { senderId: string; isTyping: boolean }) => {
      console.log('Received typingStatus:', data);
      callback(data);
    });
  }

  onError(callback: (data: { message: string }) => void): void {
    this.socket.off('error');
    this.socket.on('error', (data: { message: string }) => {
      console.log('Socket error received:', data);
      callback(data);
    });
  }
}

export const socketClient = new SocketClient();