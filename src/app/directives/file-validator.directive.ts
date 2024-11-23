import { Directive, HostListener, ElementRef, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appFileValidator]',
  standalone: true
})
export class FileValidatorDirective implements OnInit {

  @Input() allowedExtensions: string[] = [];
  @Output() fileValidated: EventEmitter<File> = new EventEmitter();

  private defaultExtensions: string[] = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpeg', '.jpg'
  ];

  private validMimeTypes = [
    'application/pdf',            // .pdf
    'application/msword',         // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',   // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'image/png',                  // .png
    'image/jpeg',                 // .jpeg, .jpg
  ];

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // Default extensions
    if (this.allowedExtensions.length === 0) {
      this.allowedExtensions = this.defaultExtensions;
    }

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
      alert(`Archivo no permitido: ${file.name}`);
      // Reset input if file is invalid
      input.value = '';
    }
  }

  // Validate MIME type
  isFileTypeValid(file: File): boolean {
    return this.validMimeTypes.includes(file.type);
  }

}
