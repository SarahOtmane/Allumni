import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  sender: {
    id: string;
    email: string;
  };
}

export interface Conversation {
  id: string;
  participants: { id: string; email: string }[];
  messages: Message[];
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/chat`;
  private socketUrl = environment.apiUrl.replace('/api', '');
  private socket: Socket | null = null;

  private messageSubject = new Subject<Message>();

  connect() {
    if (this.socket?.connected) return;

    const token = this.authService.getToken();
    if (!token) return;

    this.socket = io(this.socketUrl, {
      auth: { token },
    });

    this.socket.on('newMessage', (message: Message) => {
      this.messageSubject.next(message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('joinRoom', conversationId);
    }
  }

  sendMessage(conversationId: string, content: string) {
    // Send via REST for better reliability
    return this.http.post<Message>(`${this.apiUrl}/messages`, { conversationId, content });
  }

  onNewMessage(): Observable<Message> {
    return this.messageSubject.asObservable();
  }

  getConversations() {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  getMessages(conversationId: string) {
    return this.http.get<Message[]>(`${this.apiUrl}/conversations/${conversationId}/messages`);
  }

  createConversation(participantId: string) {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, { participantId });
  }
}
