import { $Enums } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { lowerCase } from 'lodash';

class ItemsDto {
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

export class CreateItemDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @Type(() => ItemsDto)
  items: ItemsDto[];
  @IsNumber()
  count: number;
}
