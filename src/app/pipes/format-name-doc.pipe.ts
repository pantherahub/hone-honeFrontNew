import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNameDoc',
})
export class FormatNameDocPipe implements PipeTransform {

  private readonly documentNameOverrides: Record<number, string> = {
    136: 'Rethus-registro Sispro',
  };

  transform(value: string | undefined, idDocumentType?: number): string {
    if (!value) return '';

    if (idDocumentType && this.documentNameOverrides[idDocumentType]) {
      value = this.documentNameOverrides[idDocumentType];
    }

    const formatted = value.replace(/\s*\[SURA\]$/, '');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

}
