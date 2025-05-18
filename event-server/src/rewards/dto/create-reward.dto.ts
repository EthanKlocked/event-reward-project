// ######################## IMPORT ##########################
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsMongoId,
  Min,
} from 'class-validator';

// ######################## EXPORT ##########################
export class CreateRewardDto {
  @IsMongoId()
  @IsNotEmpty()
  eventId: string;

  @IsEnum(['POINT', 'ITEM', 'COUPON'], {
    message: 'Type must be one of: POINT, ITEM, COUPON',
  })
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}
