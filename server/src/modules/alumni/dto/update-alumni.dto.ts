import { IsString, IsEmail, IsOptional, IsInt, Min, Max, IsUrl, IsNotEmpty } from 'class-validator';

export class UpdateAlumniDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  first_name?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  last_name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUrl()
  @IsOptional()
  linkedin_url?: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  @IsOptional()
  promo_year?: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  diploma?: string;
}
