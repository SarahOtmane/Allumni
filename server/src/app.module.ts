import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AlumniModule } from './modules/alumni/alumni.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { EventsModule } from './modules/events/events.module';
import { ChatModule } from './modules/chat/chat.module';
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
    UsersModule,
    AuthModule,
    AlumniModule,
    JobsModule,
    EventsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
