import { Directive, HostListener, ElementRef, Input, OnInit, Output, EventEmitter, booleanAttribute } from '@angular/core';
import { FileValidationService } from '../services/file-validation/file-validation.service';

@Directive({
  selector: '[appFileSelect]',
  standalone: true
})
export class FileSelectDirective implements OnInit {

  @Input() allowedExtensions: string[] = [];
  @Input() maxFileSizeMB?: number;
  @Input({ transform: booleanAttribute }) multiple: boolean = false;
  @Output() fileValidated: EventEmitter<File> = new EventEmitter();
  @Output() filesValidated: EventEmitter<File[]> = new EventEmitter();

  constructor(
    private el: ElementRef,
    private validator: FileValidationService,
  ) { }

  ngOnInit() {
    const input = this.el.nativeElement as HTMLInputElement;
    this.validator.setAcceptAttribute(input, this.allowedExtensions);
    input.multiple = this.multiple;
  }

  @HostListener('change', ['$event'])
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    const validatorOptions = {
      allowedExtensions: this.allowedExtensions,
      maxFileSizeMB: this.maxFileSizeMB,
    };

    if (this.multiple) {
      const areFilesValid: boolean = this.validator.validateFiles(files, validatorOptions);
      if (areFilesValid) this.filesValidated.emit(files);
      input.value = '';
      return;
    }

    const file = files[0];
    const isFileValid: boolean = this.validator.validate(file, validatorOptions);
    if (isFileValid) this.fileValidated.emit(file);
    input.value = '';
  }

}
