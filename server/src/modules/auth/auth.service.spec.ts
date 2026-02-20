import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/models/user.model';
import { MailService } from '../mail/mail.service';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;
  let mailService: any;
  let jwtService: any;

  const mockUser = {
    id: '1',
    email: 'test@test.com',
    password_hash: 'hashed_pass',
    is_active: true,
    role: 'ALUMNI',
    update: jest.fn(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findOrCreate: jest.fn(),
  };

  const mockMailService = {
    sendInvitation: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('fake_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User));
    mailService = module.get(MailService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      userModel.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser({ email: 'test@test.com', password: 'password' });

      expect(result).toEqual(mockUser);
      expect(userModel.findOne).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userModel.findOne.mockResolvedValue(null);
      await expect(service.validateUser({ email: 'wrong@test.com', password: 'password' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      userModel.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser({ email: 'test@test.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access_token and user info', async () => {
      const result = await service.login(mockUser as any);
      expect(result).toHaveProperty('access_token');
      expect(result.user.email).toBe(mockUser.email);
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });

  describe('inviteUser', () => {
    it('should create user and send mail if not exists', async () => {
      userModel.findOrCreate.mockResolvedValue([mockUser, true]);
      
      const result = await service.inviteUser('new@test.com', 'ALUMNI');

      expect(result.message).toBe('Invitation envoyée');
      expect(mailService.sendInvitation).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user already active', async () => {
      userModel.findOrCreate.mockResolvedValue([mockUser, false]); // mockUser is active
      
      await expect(service.inviteUser('active@test.com', 'ALUMNI'))
        .rejects.toThrow(BadRequestException);
    });
  });
});
