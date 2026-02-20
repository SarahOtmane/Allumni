import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from '../models/notification.model';
import { User } from '../../users/models/user.model';
import { NotificationsGateway } from '../gateways/notifications.gateway';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationModel: any;
  let userModel: any;
  let gateway: any;

  const mockNotificationModel = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn(),
  };

  const mockUserModel = {
    findAll: jest.fn(),
  };

  const mockGateway = {
    sendToUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(Notification),
          useValue: mockNotificationModel,
        },
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: NotificationsGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationModel = module.get(getModelToken(Notification));
    userModel = module.get(getModelToken(User));
    gateway = module.get(NotificationsGateway);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return notifications for a specific user', async () => {
      const userId = 'user-123';
      const mockResult = [{ id: '1', title: 'Test' }];
      notificationModel.findAll.mockResolvedValue(mockResult);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockResult);
      expect(notificationModel.findAll).toHaveBeenCalledWith({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 20,
      });
    });
  });

  describe('create', () => {
    it('should create a notification and send it via gateway', async () => {
      const userId = 'user-1';
      const type = NotificationType.JOB;
      const title = 'New Job';
      const content = 'Check it out';
      const mockResult = { id: 'notif-1', user_id: userId, title };
      notificationModel.create.mockResolvedValue(mockResult);

      const result = await service.create(userId, type, title, content);

      expect(result).toEqual(mockResult);
      expect(notificationModel.create).toHaveBeenCalled();
      expect(gateway.sendToUser).toHaveBeenCalledWith(userId, 'newNotification', mockResult);
    });
  });

  describe('notifyAllAlumni', () => {
    it('should create notifications for all alumni and notify via gateway', async () => {
      const type = NotificationType.EVENT;
      const title = 'Big Event';
      const content = "Don't miss it";
      const mockAlumni = [{ id: 'alumni-1' }, { id: 'alumni-2' }];
      userModel.findAll.mockResolvedValue(mockAlumni);
      notificationModel.bulkCreate.mockResolvedValue([{ id: 'n1' }, { id: 'n2' }]);

      await service.notifyAllAlumni(type, title, content);

      expect(userModel.findAll).toHaveBeenCalledWith({ where: { role: 'ALUMNI' } });
      expect(notificationModel.bulkCreate).toHaveBeenCalledWith(expect.any(Array));
      expect(gateway.sendToUser).toHaveBeenCalledTimes(2);
    });
  });
});
