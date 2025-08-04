import { Pipe, PipeTransform } from '@angular/core';
import { pluralize } from '../utils/string-utils';

@Pipe({
  name: 'pluralize'
})
export class PluralizePipe implements PipeTransform {

  transform(count: number, singular: string, plural: string): string {
    return pluralize(singular, plural, count);
  }

}
