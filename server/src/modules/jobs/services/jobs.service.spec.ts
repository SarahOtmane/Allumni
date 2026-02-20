import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobOffer } from '../models/job-offer.model';
import { NotificationsService } from '../../notifications/services/notifications.service';

describe('JobsService', () => {
  let service: JobsService;
  let jobModel: any;
  let notificationsService: any;

  const mockJobOfferModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };

  const mockNotificationsService = {
    notifyAllAlumni: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getModelToken(JobOffer),
          useValue: mockJobOfferModel,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobModel = module.get(getModelToken(JobOffer));
    notificationsService = module.get(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a job and notify alumni', async () => {
      const createDto = { title: 'Developer', company: 'Google', location: 'Paris', description: 'desc' };
      const authorId = 'admin-1';
      const mockJob = { id: 'job-1', ...createDto };
      jobModel.create.mockResolvedValue(mockJob);

      const result = await service.create(createDto as any, authorId);

      expect(result).toEqual(mockJob);
      expect(jobModel.create).toHaveBeenCalledWith({ ...createDto, author_id: authorId });
      expect(notificationsService.notifyAllAlumni).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a job if found', async () => {
      const mockJob = { id: 'job-1', title: 'Developer' };
      jobModel.findByPk.mockResolvedValue(mockJob);

      const result = await service.findOne('job-1');
      expect(result).toEqual(mockJob);
    });

    it('should throw NotFoundException if not found', async () => {
      jobModel.findByPk.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
