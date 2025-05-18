// ######################## IMPORT ##########################
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsMongoId,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConditionType } from '../../validators/condition-type.enum';

// ######################## EXPORT ##########################
export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @IsEnum(['ACTIVE', 'INACTIVE'], {
    message: 'Status must be either ACTIVE or INACTIVE',
  })
  @IsOptional()
  status?: string = 'ACTIVE';

  @IsEnum(ConditionType, {
    message: `ConditionType must be one of: ${Object.values(ConditionType).join(', ')}`,
  })
  @IsNotEmpty()
  conditionType: ConditionType;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  conditionValue: number;

  @IsEnum(['AUTO', 'MANUAL'], {
    message: 'Verification type must be either AUTO or MANUAL',
  })
  @IsOptional()
  verificationType?: string = 'AUTO';

  @IsMongoId()
  @IsNotEmpty()
  createdBy: string;
}
