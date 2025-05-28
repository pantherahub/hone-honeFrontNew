import { Directive, HostListener, ElementRef, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AlertService } from '../services/alerts/alert.service';

@Directive({
  selector: '[appFileValidator]',
  standalone: true
})
export class FileValidatorDirective implements OnInit {

  @Input() allowedExtensions: string[] = [];
  @Output() fileValidated: EventEmitter<File> = new EventEmitter();

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

    if (this.isFileTypeValid(file)) {
      this.fileValidated.emit(file);
    } else {
      this.alertService.error(
        'Oops...',
        `Archivo no permitido: "${file.name}".<br>
        Formatos permitidos: ${this.allowedExtensions.join(', ')}`
      );
      // Reset input if file is invalid
      input.value = '';
    }
  }

  // Validate MIME type
  isFileTypeValid(file: File): boolean {
    return this.validMimeTypes.includes(file.type);
  }

}
