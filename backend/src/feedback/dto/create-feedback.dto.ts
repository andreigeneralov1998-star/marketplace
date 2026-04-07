import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contact: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}