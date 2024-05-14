import { PartialType } from '@nestjs/mapped-types';
import { CreateObjcetifDto } from './create-objcetif.dto';

export class UpdateObjcetifDto extends PartialType(CreateObjcetifDto) {}
