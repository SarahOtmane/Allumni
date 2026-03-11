import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  let mailerService: any;

  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendInvitation', () => {
    it('should call mailerService.sendMail with correct parameters', async () => {
      const email = 'test@example.com';
      const token = 'fake-token';
      const expectedUrl = `http://localhost:4200/auth/activate?token=${token}`;

      await service.sendInvitation(email, token);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Bienvenue sur la plateforme Alumni !',
        template: 'invitation',
        context: {
          url: expectedUrl,
        },
      });
    });
  });
});
