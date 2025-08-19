import { Injectable } from '@angular/core';

export interface DocumentConfig {
  files: { url: string; name: string }[];
  displayName: string;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor() { }

  /**
   * Recibe la url de donde se toman los documentos locales y los descarga
   * @param url - ruta de los assets/container a descargar
   * @param name - nombre del archivo que se muestra en la descarga
   * @param onComplete - callback opcional para cuando se complete la descarga
   */
  saveFile(url: any, name: any, onComplete?: () => void) {
    if (url.startsWith('http')) {
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Error al descargar el archivo');
          return response.blob();
        })
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = name;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(error => console.error('Error descargando el archivo:', error))
        .finally(() => {
          if (onComplete) onComplete();
        });
      return;
    }

    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (onComplete) onComplete();
  }

}
