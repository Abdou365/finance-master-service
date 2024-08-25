import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { parse, format } from 'date-fns';

@Injectable()
export class ItemPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && value.date) {
      try {
        const parsedDate = parse(value.date, 'MM/dd/yyyy', new Date());
        value.date = format(parsedDate, 'MM/yyyy');
      } catch (error) {
        throw new BadRequestException('Invalid date format');
      }
    }
    return value;
  }
}
