import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): SequelizeModuleOptions => ({
  dialect: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASS'),
  database: configService.get<string>('DB_NAME'),
  autoLoadModels: true,
  synchronize: false, // Always use migrations for production-ready code
  define: {
    timestamps: true,
    underscored: true, // Use snake_case for columns
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});
