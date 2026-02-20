import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { NotFoundException } from '@nestjs/common';
import { AlumniService } from './alumni.service';
import { AlumniProfile } from '../models/alumni-profile.model';
import { Promotion } from '../models/promotion.model';
import { User } from '../../users/models/user.model';

describe('AlumniService', () => {
  let service: AlumniService;
  let alumniModel: any;
  let userModel: any;

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };

  const mockSequelize = {
    transaction: jest.fn().mockResolvedValue(mockTransaction),
  };

  const mockAlumniProfileModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockPromotionModel = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  const mockUserModel = {
    update: jest.fn(),
    destroy: jest.fn(),
    findOrCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlumniService,
        {
          provide: getModelToken(AlumniProfile),
          useValue: mockAlumniProfileModel,
        },
        {
          provide: getModelToken(Promotion),
          useValue: mockPromotionModel,
        },
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: Sequelize,
          useValue: mockSequelize,
        },
      ],
    }).compile();

    service = module.get<AlumniService>(AlumniService);
    alumniModel = module.get(getModelToken(AlumniProfile));
    userModel = module.get(getModelToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return profile if found', async () => {
      const mockProfile = { id: '1', first_name: 'John' };
      alumniModel.findByPk.mockResolvedValue(mockProfile);

      const result = await service.findOne('1');
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if not found', async () => {
      alumniModel.findByPk.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update profile and user email within a transaction', async () => {
      const mockProfile = { 
        id: '1', 
        user_id: 'u1', 
        update: jest.fn().mockResolvedValue(true) 
      };
      alumniModel.findByPk.mockResolvedValue(mockProfile);

      await service.update('1', { first_name: 'Jane', email: 'jane@test.com' });

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(userModel.update).toHaveBeenCalledWith(
        { email: 'jane@test.com' },
        { where: { id: 'u1' }, transaction: mockTransaction }
      );
      expect(mockProfile.update).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const mockProfile = { 
        id: '1', 
        user_id: 'u1', 
        update: jest.fn().mockRejectedValue(new Error('Update failed')) 
      };
      alumniModel.findByPk.mockResolvedValue(mockProfile);

      await expect(service.update('1', { first_name: 'Jane' })).rejects.toThrow('Update failed');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete profile and associated user', async () => {
      const mockProfile = { 
        id: '1', 
        user_id: 'u1', 
        destroy: jest.fn().mockResolvedValue(true) 
      };
      alumniModel.findByPk.mockResolvedValue(mockProfile);

      await service.remove('1');

      expect(mockProfile.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(userModel.destroy).toHaveBeenCalledWith({ 
        where: { id: 'u1' }, 
        transaction: mockTransaction 
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });
});
