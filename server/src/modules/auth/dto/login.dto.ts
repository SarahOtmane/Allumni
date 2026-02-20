import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Le mot de passe est requis' })
  password: string;
}
