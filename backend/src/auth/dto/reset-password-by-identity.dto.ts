import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordByIdentityDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}