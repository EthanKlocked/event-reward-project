// ######################## IMPORT ##########################
import {
  IsString,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConditionType } from '../../validators/condition-type.enum';

// ######################## EXPORT ##########################
export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsEnum(['ACTIVE', 'INACTIVE'], {
    message: 'Status must be either ACTIVE or INACTIVE',
  })
  @IsOptional()
  status?: string;

  @IsEnum(ConditionType, {
    message: `ConditionType must be one of: ${Object.values(ConditionType).join(', ')}`,
  })
  @IsOptional()
  conditionType?: ConditionType;

  @IsNumber()
  @Min(1)
  @IsOptional()
  conditionValue?: number;

  @IsEnum(['AUTO', 'MANUAL'], {
    message: 'Verification type must be either AUTO or MANUAL',
  })
  @IsOptional()
  verificationType?: string;
}
