// ######################## IMPORT ##########################
import { IsString, IsNotEmpty } from 'class-validator';

// ######################## EXPORT ##########################
export class TokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
