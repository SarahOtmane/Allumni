import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Conversation } from './models/conversation.model';
import { ConversationParticipant } from './models/conversation-participant.model';
import { Message } from './models/message.model';
import { ChatService } from './services/chat.service';
import { ChatController } from './controllers/chat.controller';
import { ChatGateway } from './chat.gateway';
import { User } from '../users/models/user.model';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Conversation, ConversationParticipant, Message, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') as any,
        },
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
