import { IsEmail, IsEnum } from 'class-validator';

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsEnum(['ADMIN', 'STAFF'])
  role: string;
}
