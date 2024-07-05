import { BadRequestException, PipeTransform } from "@nestjs/common";
/**
 * A custom pipe for validating and transforming date values.
 */
export class DateValidationPipe implements PipeTransform {
    transform(value: any) {
        try {
            if (value instanceof Date) {
                return value;
            }
            if (typeof value === 'string' || typeof value === 'number') {
                return new Date(value);
            }
        } catch (error) {
            throw new BadRequestException('Validation failed');
        }
    }
}
