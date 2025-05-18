// ######################## IMPORT ##########################
import { IsNotEmpty, IsEnum, IsMongoId, IsOptional } from 'class-validator';

// ######################## EXPORT ##########################
export class ProcessRequestDto {
  @IsEnum(['APPROVED', 'REJECTED'], {
    message: 'Status must be either APPROVED or REJECTED',
  })
  @IsNotEmpty()
  status: string;

  @IsMongoId()
  @IsOptional()
  processedBy?: string;
}
