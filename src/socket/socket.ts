import { io, Socket } from 'socket.io-client';
import { MessageHistory, ChatMessage, Chat } from '@/types/ChatTypes';

const SOCKET_URL = 'http://localhost:5000';

export class SocketClient {
  private socket: Socket;
  private isInitialized: boolean = false;

  constructor() {
    this.socket = io(SOCKET_URL, { 
      autoConnect: false,
      reconnection: true,   
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
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
    this.socket.off('messageHistory'); // Remove previous listeners
    this.socket.on('messageHistory', (data) => {
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

  onReceiveMessage(callback: (data: ChatMessage) => void): void {
    this.socket.off('receiveMessage'); // Remove previous listeners
    this.socket.on('receiveMessage', (data) => {
      console.log('Received message:', data);
      console.log('Message details:', {
        chatId: data.chatId,
        messageId: data.message.messageId,
        senderId: data.message.senderId,
        receiverId: data.message.receiverId,
        content: data.message.content,
      });
      callback(data);
    });
  }

  onNewChat(callback: (data: { chat: Chat }) => void): void {
    this.socket.off('newChat'); // Remove previous listeners
    this.socket.on('newChat', (data) => {
      console.log('Received newChat:', data);
      callback(data);
    });
  }

  onMessageSent(callback: (data: { senderId: string; receiverId: string }) => void): void {
    this.socket.off('messageSent'); // Remove previous listeners
    this.socket.on('messageSent', (data) => {
      console.log('Received messageSent:', data);
      callback(data);
    });
  }

  onError(callback: (data: { message: string }) => void): void {
    this.socket.off('error'); // Remove previous listeners
    this.socket.on('error', (data) => {
      console.log('Socket error received:', data);
      callback(data);
    });
  }
}

export const socketClient = new SocketClient();