import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FileValidationService } from '../services/file-validation/file-validation.service';

@Directive({
  selector: '[appFileDrop]',
  standalone: true
})
export class FileDropDirective {

  @Input() allowedExtensions: string[] = [];
  @Input() maxFileSizeMB?: number;
  @Output() fileDropped: EventEmitter<File> = new EventEmitter();

  private dragCounter = 0;

  constructor(
    private el: ElementRef,
    private validator: FileValidationService,
  ) { }

  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent) {
    event.preventDefault();
    this.dragCounter++;
    this.el.nativeElement.classList.add('dragover');
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragCounter--;

    // When it leaves all the children and the father
    if (this.dragCounter <= 0) {
      this.el.nativeElement.classList.remove('dragover');
      this.dragCounter = 0;
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragCounter = 0;
    this.el.nativeElement.classList.remove('dragover');

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    const isFileValid: boolean = this.validator.validate(file, {
      allowedExtensions: this.allowedExtensions,
      maxFileSizeMB: this.maxFileSizeMB,
    });
    if (isFileValid) this.fileDropped.emit(file);
  }

}
