import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/models/user.model';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';
import { MailService } from '../mail/mail.service';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { Op } from 'sequelize';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private mailService: MailService,
  ) {}

  async inviteUser(email: string, role: string) {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const [user, created] = await this.userModel.findOrCreate({
      where: { email },
      defaults: {
        role,
        is_active: false,
        activation_token: token,
        token_expires_at: expiresAt,
      },
    });

    if (!created) {
      if (user.is_active) {
        throw new BadRequestException('Cet utilisateur est déjà actif');
      }
      await user.update({
        activation_token: token,
        token_expires_at: expiresAt,
        role, // Mise à jour possible du rôle si ré-invité
      });
    }

    await this.mailService.sendInvitation(email, token);
    return { message: 'Invitation envoyée' };
  }

  async activateAccount(activateDto: ActivateAccountDto) {
    const { token, password } = activateDto;

    const user = await this.userModel.findOne({
      where: {
        activation_token: token,
        token_expires_at: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    const passwordHash = await argon2.hash(password);

    await user.update({
      password_hash: passwordHash,
      is_active: true,
      activation_token: null,
      token_expires_at: null,
    });

    return { message: 'Compte activé avec succès' };
  }
}
