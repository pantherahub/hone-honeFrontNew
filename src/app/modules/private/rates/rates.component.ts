import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Dropdown, initDropdowns } from 'flowbite';
import { DropdownTriggerDirective } from 'src/app/directives/dropdown-trigger.directive';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AlertService } from 'src/app/services/alert/alert.service';
import { DownloadService } from 'src/app/services/download/download.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { ModalService } from 'src/app/services/modal/modal.service';
import { RateService } from 'src/app/services/rate/rate.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-rates',
  standalone: true,
  imports: [CommonModule, PipesModule, ButtonComponent, DropdownTriggerDirective],
  templateUrl: './rates.component.html',
  styleUrl: './rates.component.scss'
})
export class RatesComponent implements OnInit {

  user = this.eventManager.userLogged();
  clientSelected: any = this.eventManager.clientSelected();

  loadingRates: boolean = false;
  rateList: any[] = [];

  statusConfig: Record<string, { bg: string; text: string; icon?: string; label: string }> = {
    'APROBADO': { bg: 'bg-green-100', text: 'text-green-800', icon: 'check', label: 'Aprobado' },
    'RECHAZADO': { bg: 'bg-red-100', text: 'text-red-800', icon: 'close', label: 'Rechazado' },
    'EN PROCESO': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'clock', label: 'En proceso' },
    'PENDIENTE POR CARGAR': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pendiente por cargar' },
  };

  constructor(
    private eventManager: EventManagerService,
    private modalService: ModalService,
    private alertService: AlertService,
    private downloadService: DownloadService,
    private toastService: ToastService,
    private rateService: RateService,
  ) { }

  ngOnInit(): void {
    this.getRates();
  }

  getRates() {
    this.loadingRates = true;
    const { idProvider, idClientHoneSolutions } = this.clientSelected;
    this.rateService.getRates(idProvider, idClientHoneSolutions).subscribe({
      next: (res: any) => {
        this.rateList = res.data;
        this.loadingRates = false;

        this.rateList.forEach((_, i) => {
          const $trigger = document.getElementById(`rate-options-btn-${i}`);
          const $dropdown = document.getElementById(`dropdown-rate-opts-${i}`);
          if ($trigger && $dropdown) {
            new Dropdown($dropdown, $trigger);
          }
        });
      },
      error: (error: any) => {
        this.loadingRates = false;
      },
    });
  }

  uploadRateFile(rate: any) {
    // Si era pendiente por cargar entonces apenas cargue debe abrir los detalles con el formulario y el inputfile lleno

    // si dentro del modal quitan el file cuando es pendiente por cargar aparecerá el box del input file que se tienen en documentos
    // cuando de a cancelar o a cerrar el modal unicamente debe preguntar si tienen un archivo cargado en el input file, si no tiene porque lo quitó entonces no se pregunta nada.
  }

  openRateDetail(rate: any) { }

}
