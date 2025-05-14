import { io, Socket } from 'socket.io-client';
import { MessageHistory, ChatMessage } from '@/types/ChatTypes';

const SOCKET_URL = 'http://localhost:5000';

export class SocketClient {
  private socket: Socket;

  constructor() {
    this.socket = io(SOCKET_URL, { 
      autoConnect: false,
      reconnection: true,   
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  connect(): void {
    console.log('Attempting socket connection to:', SOCKET_URL);
    this.socket.connect();
  }

  disconnect(): void {
    console.log('Socket disconnecting, id:', this.socket.id);
    this.socket.disconnect();
  }

  register(userId: string): void {
    console.log('Registering user:', userId);
    this.socket.emit('register', { userId });
  }

  getMessages(senderId: string, receiverId: string, callback: (data: MessageHistory) => void): void {
    console.log('Emitting getMessages:', { senderId, receiverId });
    this.socket.emit('getMessages', { senderId, receiverId });
    this.socket.once('messageHistory', (data) => {
      console.log('Received messageHistory:', data);
      callback(data);
    });
  }

  sendMessage(senderId: string, receiverId: string, content: string, mediaUrl: string, messageType: 'text' | 'media'): void {
    console.log('Emitting sendMessage:', { senderId, receiverId, content, mediaUrl, messageType });
    this.socket.emit('sendMessage', { senderId, receiverId, content, mediaUrl, messageType });
  }

  onReceiveMessage(callback: (data: ChatMessage) => void): void {
    this.socket.on('receiveMessage', (data) => {
      console.log('Received message:', data);
      callback(data);
    });
  }

  onError(callback: (data: { message: string }) => void): void {
    this.socket.on('error', (data) => {
      console.log('Socket error received:', data);
      callback(data);
    });
  }
}

export const socketClient = new SocketClient();