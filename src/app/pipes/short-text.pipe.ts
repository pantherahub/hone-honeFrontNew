import { Pipe, PipeTransform } from '@angular/core';
import { getShortText } from '../utils/string-utils';

@Pipe({
  name: 'shortText',
})
export class ShortTextPipe implements PipeTransform {

  transform(text: string, maxLength: number = 100): string {
    return getShortText(text, maxLength);
  }

}
