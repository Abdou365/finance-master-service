import { IsEmail, IsNumber, IsString } from 'class-validator';

export class recoveryPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  password_confirmation: string;

  @IsString()
  token: string;

  @IsNumber({})
  code: number;
}
