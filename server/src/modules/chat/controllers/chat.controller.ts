import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ChatService } from '../services/chat.service';
import { ChatGateway } from '../chat.gateway';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationType } from '../../notifications/models/notification.model';
import { InjectModel } from '@nestjs/sequelize';
import { ConversationParticipant } from '../models/conversation-participant.model';
import { Op } from 'sequelize';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
    private readonly notificationsService: NotificationsService,
    @InjectModel(ConversationParticipant)
    private participantModel: typeof ConversationParticipant,
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

    // Find the recipient(s) to notify
    const otherParticipants = await this.participantModel.findAll({
      where: {
        conversation_id: data.conversationId,
        user_id: { [Op.ne]: req.user.id },
      },
    });

    for (const participant of otherParticipants) {
      await this.notificationsService.create(
        participant.user_id,
        NotificationType.MESSAGE,
        'Nouveau message',
        `Vous avez reçu un nouveau message : "${data.content.substring(0, 30)}${data.content.length > 30 ? '...' : ''}"`,
        data.conversationId,
      );
    }

    // Trigger WebSocket broadcast for the chat message itself
    this.chatGateway.broadcastMessage(message, req.user);

    return message;
  }
}
