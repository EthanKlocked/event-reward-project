// ######################## IMPORT ##########################
import { IsString, IsNotEmpty } from 'class-validator';

// ######################## EXPORT ##########################
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
