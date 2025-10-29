import { Injectable } from '@angular/core';
import { AlertService } from '../alert/alert.service';

export interface FileValidatorOptions {
  allowedExtensions?: string[];
  maxFileSizeMB?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FileValidationService {

  extensionToMimeType: { [ext: string]: string } = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.png': 'image/png',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
  };

  constructor(
    private alertService: AlertService,
  ) { }

  validate(file: File, options?: FileValidatorOptions): boolean {
    if (!this.isFileTypeValid(file, options)) {
      return false;
    }

    if (!this.isFileSizeValid(file, options)) {
      return false;
    }

    return true;
  }

  isFileTypeValid(file: File, options?: FileValidatorOptions): boolean {
    const allowedExt = options?.allowedExtensions?.length
      ? options.allowedExtensions
      : Object.keys(this.extensionToMimeType);

    const validMimeTypes = allowedExt
      .map(ext => this.extensionToMimeType[ext])
      .filter((type): type is string => !!type);

    if (!validMimeTypes.includes(file.type)) {
      this.alertService.showAlert({
        title: '¡Error!',
        messageHTML: `Archivo no permitido.<br>
          Formatos permitidos: ${allowedExt.join(', ')}`,
        variant: 'error',
      });
      return false;
    }

    return true;
  }

  isFileSizeValid(file: File, options?: FileValidatorOptions): boolean {
    const maxSizeMB = options?.maxFileSizeMB;
    if (!maxSizeMB) return true; // File size optional

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.alertService.showAlert({
        title: '¡Archivo muy pesado!',
        messageHTML: `El archivo excede el tamaño máximo de ${maxSizeMB}MB.<br>
          Puedes usar este compresor para reducir su tamaño: <a href="https://www.wecompress.com/es/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
          ir al compresor</a>.`,
        variant: 'error',
      });
      return false;
    }

    return true;
  }

}
