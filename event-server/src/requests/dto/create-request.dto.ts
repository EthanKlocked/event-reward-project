// ######################## IMPORT ##########################
import { IsNotEmpty, IsMongoId } from 'class-validator';

// ######################## EXPORT ##########################
export class CreateRequestDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  eventId: string;
}
