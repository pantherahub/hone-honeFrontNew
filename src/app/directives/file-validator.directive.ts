import { Directive, HostListener, ElementRef, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AlertService } from '../services/alert/alert.service';

@Directive({
  selector: '[appFileValidator]',
  standalone: true
})
export class FileValidatorDirective implements OnInit {

  @Input() allowedExtensions: string[] = [];
  @Input() maxFileSizeMB: number = 10;
  @Output() fileValidated: EventEmitter<File> = new EventEmitter<File>();

  private extensionToMimeType: { [ext: string]: string } = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.png': 'image/png',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg'
  };
  private validMimeTypes: string[] = [];

  constructor(
    private el: ElementRef,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    // Default extensions
    if (this.allowedExtensions.length === 0) {
      this.allowedExtensions = Object.keys(this.extensionToMimeType);
    }

    this.validMimeTypes = this.allowedExtensions
      .map(ext => this.extensionToMimeType[ext])
      .filter((type): type is string => !!type);

    const inputElement: HTMLInputElement = this.el.nativeElement;
    // Set accept attribute
    inputElement.accept = this.allowedExtensions.join(',');
  }

  @HostListener('change', ['$event'])
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!this.isFileTypeValid(file)) {
      this.alertService.showAlert({
        title: '¡Error!',
        messageHTML: `Archivo no permitido.<br>
          Formatos permitidos: ${this.allowedExtensions.join(', ')}`,
        variant: 'error',
      });
      // Reset input if file is invalid
      input.value = '';
      return;
    } else if (!this.isFileSizeValid(file)) {
      this.alertService.showAlert({
        title: '¡Archivo muy pesado!',
        messageHTML: `El archivo excede el tamaño máximo de ${this.maxFileSizeMB}MB.<br>
          Puedes usar este compresor para reducir su tamaño: <a href="https://www.wecompress.com/es/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
          ir al compresor</a>.`,
        variant: 'error',
      });
      input.value = '';
      return;
    }

    this.fileValidated.emit(file);
  }

  // Validate MIME type
  isFileTypeValid(file: File): boolean {
    return this.validMimeTypes.includes(file.type);
  }

  // Validate max file size
  isFileSizeValid(file: File): boolean {
    const maxSizeBytes = this.maxFileSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

}
