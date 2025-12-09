import { Directive, HostListener, ElementRef, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FileValidationService } from '../services/file-validation/file-validation.service';

@Directive({
  selector: '[appFileSelect]',
  standalone: true
})
export class FileSelectDirective implements OnInit {

  @Input() allowedExtensions: string[] = [];
  @Input() maxFileSizeMB?: number;
  @Output() fileValidated: EventEmitter<File> = new EventEmitter();

  constructor(
    private el: ElementRef,
    private validator: FileValidationService,
  ) { }

  ngOnInit() {
    const input = this.el.nativeElement as HTMLInputElement;
    this.validator.setAcceptAttribute(input, this.allowedExtensions);
  }

  @HostListener('change', ['$event'])
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const isFileValid: boolean = this.validator.validate(file, {
      allowedExtensions: this.allowedExtensions,
      maxFileSizeMB: this.maxFileSizeMB,
    });

    if (isFileValid) this.fileValidated.emit(file);
    input.value = '';
  }

}
