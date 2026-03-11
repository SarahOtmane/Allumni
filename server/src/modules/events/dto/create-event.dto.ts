import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_participants?: number;
}
