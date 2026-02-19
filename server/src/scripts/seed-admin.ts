import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersModule } from '../modules/users/users.module';
import { User } from '../modules/users/models/user.model';
import { getModelToken } from '@nestjs/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../modules/mail/mail.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const email = process.argv[2];
  if (!email) {
    console.error('Veuillez fournir un email : npm run seed:admin <email>');
    process.exit(1);
  }

  const userModel = app.get<typeof User>(getModelToken(User));
  const mailService = app.get(MailService);

  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  try {
    const [user, created] = await userModel.findOrCreate({
      where: { email },
      defaults: {
        role: 'ADMIN',
        is_active: false,
        activation_token: token,
        token_expires_at: expiresAt,
      },
    });

    if (!created) {
      console.log("L'utilisateur existe déjà. Mise à jour du token...");
      await user.update({
        activation_token: token,
        token_expires_at: expiresAt,
      });
    }

    await mailService.sendInvitation(email, token);
    console.log(`Succès ! Invitation envoyée à ${email}`);
  } catch (error) {
    console.error('Erreur lors de la création de l\'admin:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
