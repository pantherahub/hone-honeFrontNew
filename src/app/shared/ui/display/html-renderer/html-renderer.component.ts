import { Component, HostListener, Input } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AlertService } from 'src/app/services/alert/alert.service';
import { getShortText } from 'src/app/utils/string-utils';

@Component({
  selector: 'app-html-renderer',
  standalone: true,
  imports: [PipesModule],
  templateUrl: './html-renderer.component.html',
  styleUrl: './html-renderer.component.scss'
})
export class HtmlRendererComponent {

  @Input() htmlContent: string = '';

  constructor(private alertService: AlertService) { }

  @HostListener('click', ['$event'])
  public async onHtmlClick(event: MouseEvent): Promise<void> {
    const target = (event.target as HTMLElement).closest('a');

    if (target && target.href && target.href.startsWith('http')) {
      event.preventDefault();

      const url = target.href;

      const html = `Estás saliendo a un sitio externo:<br>
        <span class="font-bold break-words">${getShortText(url, 80)}</span>
        <br>¿Deseas continuar?
      `;
      const confirmed = await firstValueFrom(
        this.alertService.confirm(
          'AVISO DE SEGURIDAD',
          ``,
          {
            messageHTML: html,
            confirmBtnText: 'Ir al sitio',
            cancelBtnText: 'Cancelar',

            iconVariant: 'danger',
            confirmBtnVariant: 'red',
          }
        )
      );

      if (confirmed) {
        window.open(target.href, '_blank', 'noopener noreferrer');
      }
    }
  }

}
