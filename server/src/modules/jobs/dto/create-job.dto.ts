import { IsString, IsEnum, IsOptional, IsUrl, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(['CDI', 'CDD', 'PRESTATAIRE'])
  type: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

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
  start_date: string;

  @IsUrl()
  @IsOptional()
  link?: string;
}
