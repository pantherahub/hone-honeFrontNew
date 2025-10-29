import { Pipe, PipeTransform } from '@angular/core';
import { formatFileBytes } from '../utils/string-utils';

@Pipe({
  name: 'formatFileBytes',
})
export class FormatFileBytesPipe implements PipeTransform {

  transform(bytes: number): string {
    return formatFileBytes(bytes);
  }

}
