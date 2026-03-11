import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UsersController } from './controllers/users.controller';
import { AuthModule } from '../auth/auth.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [SequelizeModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  exports: [SequelizeModule],
})
export class UsersModule {}
