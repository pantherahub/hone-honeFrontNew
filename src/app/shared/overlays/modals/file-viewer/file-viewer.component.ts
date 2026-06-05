import { Component, Input, OnInit } from '@angular/core';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ButtonComponent } from '../../../ui/buttons/button/button.component';
import { LoaderComponent } from '../../../ui/feedback/loader/loader.component';
import { ModalComponent } from '../../../ui/overlays/modal/modal.component';

@Component({
  selector: 'app-file-viewer',
  standalone: true,
  imports: [CommonModule, NgxDocViewerModule, PipesModule, ButtonComponent, LoaderComponent],
  templateUrl: './file-viewer.component.html',
  styleUrl: './file-viewer.component.scss'
})
export class FileViewerComponent implements OnInit {
  @Input() title: string = 'Documento';
  @Input() url: string = '';

  isImage: boolean = false;
  previewFile: string = '';
  loadingPdf: boolean = false;
  refreshDocTimer: any = null;
  retryAttempts: number = 0;
  maxRetries: number = 3;
  typeImageExtension = ['jpg', 'jpeg', 'webp', 'gif', 'tiff', 'tif', 'bmp', 'raw', 'png', 'jfif'];

  constructor(
    private modalRef: ModalComponent,
  ) { }

  ngOnInit(): void {
    this.retryAttempts = 0;
    this.previewFile = this.url || '';
    const extension = this.getExtension(this.previewFile);
    this.isImage = this.typeImageExtension.includes(extension);
    if (!this.isImage) {
      this.loadingPdf = true;
      this.startRetryTimer();
    }
  }

  getExtension(url: string): string {
    return url.split('.').pop()?.toLowerCase() || '';
  }

  closeModal() {
    this.loadingPdf = false;
    this.stopDocTimer();
    this.retryAttempts = 0;
    this.modalRef.close();
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
    }, 5000);
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

  openDoc() {
    window.open(this.previewFile, '_blank');
  }

}
