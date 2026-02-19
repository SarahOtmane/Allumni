import { IsString, MinLength } from 'class-validator';

export const MIN_PASSWORD_LENGTH = 8;

export class ActivateAccountDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`,
  })
  password: string;
}
