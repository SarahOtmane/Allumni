import { IsString, IsEnum, IsOptional, IsUrl, IsDateString, IsNotEmpty } from 'class-validator';

export class UpdateJobDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @IsEnum(['CDI', 'CDD', 'PRESTATAIRE'])
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  company?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsString()
  @IsOptional()
  company_description?: string;

  @IsString()
  @IsOptional()
  profile_description?: string;

  @IsString()
  @IsOptional()
  missions?: string;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsUrl()
  @IsOptional()
  link?: string;
}
