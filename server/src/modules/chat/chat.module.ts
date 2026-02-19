import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Conversation } from './models/conversation.model';
import { ConversationParticipant } from './models/conversation-participant.model';
import { Message } from './models/message.model';

@Module({
  imports: [SequelizeModule.forFeature([Conversation, ConversationParticipant, Message])],
})
export class ChatModule {}
