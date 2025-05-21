import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNameDoc',
})
export class FormatNameDocPipe implements PipeTransform {

  private readonly documentNameOverrides: Record<number, string> = {
    136: 'Rethus-registro Sispro',
  };

  transform(value: string | undefined, idTypeDocuments?: number): string {
    if (!value) return '';

    if (idTypeDocuments && this.documentNameOverrides[idTypeDocuments]) {
      value = this.documentNameOverrides[idTypeDocuments];
    }

    const formatted = value.replace(/\s*\[SURA\]$/, '');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

}
