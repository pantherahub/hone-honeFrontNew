import { Pipe, PipeTransform } from '@angular/core';
import { DocumentService } from '../services/documents/documents-crud.service';

@Pipe({
  name: 'formatNameDoc',
})
export class FormatNameDocPipe implements PipeTransform {

  constructor(private documentService: DocumentService) { }

  transform(value: string | undefined, idDocumentType?: number): string {
    return this.documentService.formatDocumentName(value, idDocumentType);
  }

}
