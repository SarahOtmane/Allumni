import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';
import { ConversationParticipant } from '../models/conversation-participant.model';

describe('ChatService', () => {
  let service: ChatService;
  let participantModel: any;
  let messageModel: any;

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };

  const mockSequelize = {
    transaction: jest.fn().mockResolvedValue(mockTransaction),
    literal: jest.fn().mockReturnValue('literal-sql'),
  };

  const mockConversationModel = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockMessageModel = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  const mockParticipantModel = {
    findOne: jest.fn(),
    bulkCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken(Conversation),
          useValue: mockConversationModel,
        },
        {
          provide: getModelToken(Message),
          useValue: mockMessageModel,
        },
        {
          provide: getModelToken(ConversationParticipant),
          useValue: mockParticipantModel,
        },
        {
          provide: Sequelize,
          useValue: mockSequelize,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    participantModel = module.get(getModelToken(ConversationParticipant));
    messageModel = module.get(getModelToken(Message));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMessages', () => {
    it('should return messages if user is a participant', async () => {
      const convId = 'c1';
      const userId = 'u1';
      participantModel.findOne.mockResolvedValue({ conversation_id: convId, user_id: userId });
      messageModel.findAll.mockResolvedValue([{ id: 'm1', content: 'hello' }]);

      const result = await service.getMessages(convId, userId);

      expect(result).toHaveLength(1);
      expect(messageModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { conversation_id: convId },
        }),
      );
    });

    it('should throw ForbiddenException if user is not a participant', async () => {
      participantModel.findOne.mockResolvedValue(null);
      await expect(service.getMessages('c1', 'u1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('saveMessage', () => {
    it('should create a new message', async () => {
      const mockMsg = { id: 'm1', content: 'hi' };
      messageModel.create.mockResolvedValue(mockMsg);

      const result = await service.saveMessage('c1', 'u1', 'hi');

      expect(result).toEqual(mockMsg);
      expect(messageModel.create).toHaveBeenCalledWith({
        conversation_id: 'c1',
        sender_id: 'u1',
        content: 'hi',
      });
    });
  });
});
