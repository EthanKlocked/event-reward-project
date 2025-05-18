// ######################## IMPORT ##########################
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

// ######################## EXPORT ##########################
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(['USER', 'OPERATOR', 'AUDITOR', 'ADMIN'], {
    message: 'Role must be one of: USER, OPERATOR, AUDITOR, ADMIN',
  })
  @IsOptional()
  role?: string = 'USER';
}
