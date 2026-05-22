import { CommonModule } from '@angular/common';
import { booleanAttribute, Component, EventEmitter, Input, Output } from '@angular/core';
import { StoredFile } from 'src/app/interfaces/file.interface';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ButtonComponent } from '../../buttons/button/button.component';

export type FileItemFile = File | StoredFile | {
  name: string;
  size: number;
};

@Component({
  selector: 'app-file-item',
  standalone: true,
  imports: [CommonModule, PipesModule, ButtonComponent],
  templateUrl: './file-item.component.html',
  styleUrl: './file-item.component.scss',
  host: {
    class: 'block max-w-full min-w-0'
  }
})
export class FileItemComponent {

  @Input() file: FileItemFile | null = null;
  @Input({ transform: booleanAttribute }) isInteractive: boolean = false;
  @Input({ transform: booleanAttribute }) isMultipleFiles: boolean = false;
  @Input() showSize?: boolean;
  @Input() customClass: string = '';

  @Output() onRemove = new EventEmitter<void>();
  @Output() onChange = new EventEmitter<void>();

  get fileName(): string {
    if (!this.file) return 'Archivo';

    const file = this.file as Partial<StoredFile> & Partial<File>;
    return file.nameOriginal || file.name || 'Archivo';
  }

  get fileSize(): number | null {
    if (!this.file || typeof this.file.size !== 'number') return null;
    return this.file.size;
  }

  get shouldShowSize(): boolean {
    return (this.showSize ?? !this.isMultipleFiles) && this.fileSize !== null;
  }

  get containerClasses(): string {
    const classes = [
      'max-w-full',
      'min-w-0',
      'flex',
      'items-center',
      'gap-2',
      'flex-wrap',
      'rounded-md',
      'ring-[1px]',
      'ring-inset',
      'ring-gray-200',
      'bg-white',
      this.isMultipleFiles ? 'p-3' : 'p-4',
    ];

    if (this.customClass) {
      classes.push(this.customClass);
    }

    return classes.join(' ');
  }

  emitRemove(): void {
    this.onRemove.emit();
  }

  emitChange(): void {
    this.onChange.emit();
  }

}
