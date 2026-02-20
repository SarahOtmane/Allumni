import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';
import { ConversationParticipant } from '../models/conversation-participant.model';
import { User } from '../../users/models/user.model';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation)
    private conversationModel: typeof Conversation,
    @InjectModel(Message)
    private messageModel: typeof Message,
    @InjectModel(ConversationParticipant)
    private participantModel: typeof ConversationParticipant,
    private sequelize: Sequelize,
  ) {}

  async getConversations(userId: string) {
    return this.conversationModel.findAll({
      include: [
        {
          model: User,
          where: { id: { [Op.ne]: userId } },
          through: { attributes: [] },
          attributes: ['id', 'email'],
        },
        {
          model: Message,
          limit: 1,
          order: [['created_at', 'DESC']],
          attributes: ['content', 'created_at'],
        },
      ],
      where: {
        id: {
          [Op.in]: this.sequelize.literal(`(
            SELECT conversation_id FROM conversation_participants WHERE user_id = '${userId}'
          )`),
        },
      },
    });
  }

  async getMessages(conversationId: string, userId: string) {
    const isParticipant = await this.participantModel.findOne({
      where: { conversation_id: conversationId, user_id: userId },
    });

    if (!isParticipant) {
      throw new ForbiddenException('Vous ne participez pas à cette conversation');
    }

    return this.messageModel.findAll({
      where: { conversation_id: conversationId },
      order: [['created_at', 'ASC']],
      include: [{ model: User, attributes: ['id', 'email'] }],
    });
  }

  async findOrCreateConversation(userId1: string, userId2: string) {
    // Find if a conversation already exists between these two users
    const existingConversation = await this.conversationModel.findOne({
      where: {
        id: {
          [Op.in]: this.sequelize.literal(`(
            SELECT cp1.conversation_id 
            FROM conversation_participants cp1
            JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
            WHERE cp1.user_id = '${userId1}' AND cp2.user_id = '${userId2}'
          )`),
        },
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const transaction = await this.sequelize.transaction();
    try {
      const conversation = await this.conversationModel.create({}, { transaction });
      await this.participantModel.bulkCreate(
        [
          { conversation_id: conversation.id, user_id: userId1 },
          { conversation_id: conversation.id, user_id: userId2 },
        ],
        { transaction },
      );
      await transaction.commit();
      return conversation;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async saveMessage(conversationId: string, senderId: string, content: string) {
    return this.messageModel.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    });
  }
}
