import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { AdminService } from './admin.service';
import { User } from '../../users/models/user.model';
import { AlumniProfile } from '../../alumni/models/alumni-profile.model';
import { Event } from '../../events/models/event.model';
import { JobOffer } from '../../jobs/models/job-offer.model';

describe('AdminService', () => {
  let service: AdminService;

  const mockUserModel = {
    count: jest.fn(),
  };
  const mockAlumniProfileModel = {
    count: jest.fn(),
  };
  const mockEventModel = {
    count: jest.fn(),
  };
  const mockJobOfferModel = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(AlumniProfile),
          useValue: mockAlumniProfileModel,
        },
        {
          provide: getModelToken(Event),
          useValue: mockEventModel,
        },
        {
          provide: getModelToken(JobOffer),
          useValue: mockJobOfferModel,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return aggregated stats from all models', async () => {
      // Setup mocks
      mockAlumniProfileModel.count.mockResolvedValue(5); // promotionsCount
      mockUserModel.count
        .mockResolvedValueOnce(100) // totalAlumni
        .mockResolvedValueOnce(80) // activeAlumni
        .mockResolvedValueOnce(10) // staffCount
        .mockResolvedValueOnce(2); // adminCount
      mockEventModel.count.mockResolvedValue(15);
      mockJobOfferModel.count.mockResolvedValue(25);

      const result = await service.getStats();

      expect(result).toEqual({
        promotionsCount: 5,
        alumni: {
          total: 100,
          active: 80,
          inactive: 20,
        },
        staffCount: 10,
        adminCount: 2,
        eventsCount: 15,
        jobsCount: 25,
      });

      expect(mockAlumniProfileModel.count).toHaveBeenCalledWith({
        distinct: true,
        col: 'promo_year',
      });
      expect(mockUserModel.count).toHaveBeenCalledTimes(4);
    });
  });
});
