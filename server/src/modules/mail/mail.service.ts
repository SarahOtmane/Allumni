import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendInvitation(email: string, token: string) {
    const url = `http://localhost:4200/auth/activate?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Bienvenue sur la plateforme Alumni !',
      template: 'invitation', // Chemin relatif au dossier templates défini dans le module
      context: {
        url: url, // On explicite la variable pour EJS
      },
    });
  }
}
