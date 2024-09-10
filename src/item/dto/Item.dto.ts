import { $Enums } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsUUID,
  IsString,
  IsDateString,
  IsOptional,
  ValidateIf,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { lowerCase } from 'lodash';

export class ItemDto {
  @IsUUID()
  id: string;
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  date: string;
  @IsString()
  @IsOptional()
  category: string;
  @IsUUID()
  accountId: string;
  @IsUUID()
  userId: string;
  @IsDateString()
  createdAt: string;
  @IsDateString()
  @IsOptional()
  updatedAt: string;
  @ValidateIf(o => {
    return (
      o.status !== ($Enums.ItemStatus.deleted || $Enums.ItemStatus.archived)
    );
  })
  @IsNumber()
  @IsPositive({
    message() {
      return 'La valeur doit être positive, soit un nombre supérieur à 0';
    },
  })
  @Type(() => Number)
  value: number;
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value, obj }) => {
    if (obj.isExpense && typeof obj.isExpense === 'string') {
      return (
        obj.isExpense === 'true' ||
        lowerCase(
          obj?.isExpense.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        ) === 'depense' ||
        obj.isExpense === '1' ||
        obj.isExpense === 'yes' ||
        obj.isExpense === 'oui'
      );
    }
    return !!value;
  })
  isExpense: boolean;
  @IsEnum($Enums.ItemStatus)
  status: string;
}
