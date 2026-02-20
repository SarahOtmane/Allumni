import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AlumniModule } from './modules/alumni/alumni.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { EventsModule } from './modules/events/events.module';
import { ChatModule } from './modules/chat/chat.module';
import { MailModule } from './modules/mail/mail.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ScrapingModule } from './modules/scraping/scraping.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'redis_cache'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    AlumniModule,
    JobsModule,
    EventsModule,
    ChatModule,
    MailModule,
    AdminModule,
    NotificationsModule,
    ScrapingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
