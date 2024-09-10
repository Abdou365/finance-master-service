import { $Enums } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsPositive,
  IsBoolean,
  Min,
} from 'class-validator';

export class ObjectifDto {
  @IsUUID()
  id: string;
  @IsUUID()
  accountId: string;
  @IsUUID()
  userId: string;
  @IsString()
  title: string;
  @IsString()
  @IsOptional()
  description: string;
  @IsDateString()
  @IsOptional()
  from: string;
  @IsDateString()
  @IsOptional()
  to: string;
  @IsNumber()
  @IsPositive()
  targetAmount: number;
  @IsString({ each: true })
  categories: string[];
  @IsBoolean()
  @IsOptional()
  isRecurrent: boolean;
  @IsString()
  @IsOptional()
  @Transform(({ value, obj }) => {
    if (obj.isRecurrent) {
      return value || 'daily';
    }
    return null;
  })
  recurrence: $Enums.Recurrence;
  @IsNumber()
  @IsPositive()
  @Min(1)
  @IsOptional()
  @Transform(({ value, obj }) => {
    if (obj.isRecurrent) {
      return value || 1;
    }
    return null;
  })
  recurrenceInterval: number;
  @IsString()
  type: $Enums.ObjectifType;
  @IsString()
  status: $Enums.ObjectifStatus;
}
