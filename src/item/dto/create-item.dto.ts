import { $Enums } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsString, IsUUID, Min, MinLength, ValidateNested } from "class-validator";

class ItemsDto {
        @IsUUID()
    id: string;
    @IsString()
    title: string;
    @IsString()
    description: string;
    @IsString()
    @Transform(({ value }) =>{ 
        console.log(value);
        return new Date(value).toISOString()
    }, 
    { toClassOnly: true })
    date : string;
    category: string;
    @IsUUID()
    accountId: string;
    @IsUUID()
    userId: string;
    @IsDate()
    createdAt: Date;
    @IsDate()
    updatedAt: Date;
    @IsNumber()
    value: number;
    @IsBoolean()
    isExpense: boolean;
    @IsEnum($Enums.ItemStatus)
    status:string;
}

export class CreateItemDto {
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @ArrayMaxSize(200)
    items: ItemsDto[];
    @IsNumber()
    count: number;
}

