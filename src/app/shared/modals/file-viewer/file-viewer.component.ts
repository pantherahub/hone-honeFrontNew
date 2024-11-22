import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { CommonModule } from '@angular/common';
import { NgZorroModule } from '../../../ng-zorro.module';

@Component({
  selector: 'app-file-viewer',
  standalone: true,
  imports: [CommonModule, NgZorroModule, NgxDocViewerModule],
  templateUrl: './file-viewer.component.html',
  styleUrl: './file-viewer.component.scss'
})
export class FileViewerComponent {
  @Input() visible: boolean = false;
  @Input() currentItem: any = null;
  @Output() close = new EventEmitter<void>();

  isImage: boolean = false;
  previewFile: string = '';
  loadingPdf: boolean = false;
  refreshDocTimer: any = null;
  retryAttempts: number = 0;
  maxRetries: number = 3;
  typeImageExtension = ['jpg', 'jpeg', 'webp', 'gif', 'tiff', 'tif', 'bmp', 'raw', 'png', 'jfif'];

  ngOnChanges() {
    if (this.visible && this.currentItem) {
      this.retryAttempts = 0;
      this.previewFile = this.currentItem?.UrlDocument || '';
      const extension = this.getExtension(this.previewFile);
      this.isImage = this.typeImageExtension.includes(extension);
      if (!this.isImage) {
        this.loadingPdf = true;
        this.startRetryTimer();
      }
    }
  }

  getExtension(url: string): string {
    return url.split('.').pop()?.toLowerCase() || '';
  }

  closeModal() {
    this.visible = false;
    this.loadingPdf = false;
    this.stopDocTimer();
    this.retryAttempts = 0;
    this.close.emit();
  }

  startRetryTimer() {
    this.stopDocTimer();

    if (this.retryAttempts >= this.maxRetries) {
      // console.error('No se pudo cargar el documento después de varios intentos.');
      // this.loadingPdf = false;
      return;
    }
    this.retryAttempts++;
    this.refreshDocTimer = setTimeout(() => {
      this.refreshDocument()
    }, 3000);
  }

  refreshDocument() {
    console.warn(`Reintentando cargar el documento... (Intento ${this.retryAttempts}/${this.maxRetries})`);
    const uniqueParam = `nocache=${Date.now()}`;
    this.previewFile = this.previewFile.includes('?')
      ? `${this.previewFile}&${uniqueParam}`
      : `${this.previewFile}?${uniqueParam}`;
    this.startRetryTimer();
  }

  onDocumentLoaded() {
    this.loadingPdf = false;
    this.stopDocTimer();
  }

  stopDocTimer() {
    if (this.refreshDocTimer) {
      clearTimeout(this.refreshDocTimer);
      this.refreshDocTimer = null;
    }
  }
}
