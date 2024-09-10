import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { ItemDto } from './Item.dto';

export class CreateItemDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @Type(() => ItemDto)
  items: ItemDto[];
  @IsNumber()
  count: number;
}
