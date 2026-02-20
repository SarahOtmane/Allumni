import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ChatService } from '../services/chat.service';
import { ChatGateway } from '../chat.gateway';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get('conversations')
  @Roles('ALUMNI', 'ADMIN', 'STAFF')
  getConversations(@Request() req) {
    return this.chatService.getConversations(req.user.id);
  }

  @Get('conversations/:id/messages')
  @Roles('ALUMNI', 'ADMIN', 'STAFF')
  getMessages(@Param('id') id: string, @Request() req) {
    return this.chatService.getMessages(id, req.user.id);
  }

  @Post('conversations')
  @Roles('ALUMNI', 'ADMIN', 'STAFF')
  async createConversation(@Body('participantId') participantId: string, @Request() req) {
    const conversation = await this.chatService.findOrCreateConversation(req.user.id, participantId);
    return conversation;
  }

  @Post('messages')
  @Roles('ALUMNI', 'ADMIN', 'STAFF')
  async sendMessage(@Body() data: { conversationId: string; content: string }, @Request() req) {
    const message = await this.chatService.saveMessage(data.conversationId, req.user.id, data.content);

    // Trigger WebSocket broadcast
    this.chatGateway.broadcastMessage(message, req.user);

    return message;
  }
}
