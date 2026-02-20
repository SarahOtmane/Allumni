import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from '../models/event.model';
import { EventRegistration } from '../models/event-registration.model';

describe('EventsService', () => {
  let service: EventsService;
  let eventModel: any;
  let registrationModel: any;

  const mockEventModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };

  const mockRegistrationModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  };

  const mockNotificationsService = {
    notifyAllAlumni: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getModelToken(Event),
          useValue: mockEventModel,
        },
        {
          provide: getModelToken(EventRegistration),
          useValue: mockRegistrationModel,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventModel = module.get(getModelToken(Event));
    registrationModel = module.get(getModelToken(EventRegistration));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a user if not already registered and capacity available', async () => {
      const eventId = 'e1';
      const userId = 'u1';
      const mockEvent = { 
        id: eventId, 
        max_participants: 10, 
        participants: [], 
      };
      
      eventModel.findByPk.mockResolvedValue(mockEvent);
      registrationModel.findOne.mockResolvedValue(null);
      registrationModel.create.mockResolvedValue({ id: 'r1', event_id: eventId, user_id: userId });

      const result = await service.register(eventId, userId);

      expect(result).toHaveProperty('id');
      expect(registrationModel.create).toHaveBeenCalledWith({ event_id: eventId, user_id: userId });
    });

    it('should throw ConflictException if already registered', async () => {
      const eventId = 'e1';
      const userId = 'u1';
      const mockEvent = { id: eventId, max_participants: 10, participants: [] };
      
      eventModel.findByPk.mockResolvedValue(mockEvent);
      registrationModel.findOne.mockResolvedValue({ id: 'r1' });

      await expect(service.register(eventId, userId)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if event is full', async () => {
      const eventId = 'e1';
      const userId = 'u1';
      const mockEvent = { id: eventId, max_participants: 1, participants: [{ id: 'u2' }] };
      
      eventModel.findByPk.mockResolvedValue(mockEvent);

      await expect(service.register(eventId, userId)).rejects.toThrow(ConflictException);
    });
  });
});
