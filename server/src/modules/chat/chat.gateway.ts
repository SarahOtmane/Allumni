import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './services/chat.service';
import { Message } from './models/message.model';
import { User } from '../users/models/user.model';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) throw new UnauthorizedException();
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      console.log(`WS Connected: ${client.id} (User: ${payload.sub})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`WS Disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() conversationId: string, @ConnectedSocket() client: Socket) {
    client.join(conversationId);
  }

  broadcastMessage(message: Message, sender: User) {
    this.server.to(message.conversation_id).emit('newMessage', {
      id: message.id,
      content: message.content,
      sender_id: message.sender_id,
      conversation_id: message.conversation_id,
      created_at: message.get('createdAt'),
      sender: {
        id: sender.id,
        email: sender.email,
      },
    });
  }
}
