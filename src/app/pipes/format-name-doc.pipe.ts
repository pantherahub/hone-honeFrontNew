import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNameDoc',
})
export class FormatNameDocPipe implements PipeTransform {

  transform(value: string | undefined): string {
    if (!value) return '';
    const formatted = value.replace(/\s*\[SURA\]$/, '');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

}
