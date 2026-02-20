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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
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
      if (!token) {
        throw new UnauthorizedException();
      }
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      console.log(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (e) {
      console.log(`Connection failed: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() conversationId: string, @ConnectedSocket() client: Socket) {
    client.join(conversationId);
    console.log(`User ${client.data.user.sub} joined room ${conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { conversationId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.user.sub;
    const message = await this.chatService.saveMessage(data.conversationId, senderId, data.content);

    // Broadcast to the room
    this.server.to(data.conversationId).emit('newMessage', {
      id: message.id,
      content: message.content,
      sender_id: message.sender_id,
      conversation_id: message.conversation_id,
      created_at: message.createdAt,
      sender: {
        id: senderId,
        email: client.data.user.email,
      },
    });
  }
}
