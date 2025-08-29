import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DropdownTriggerDirective } from 'src/app/directives/dropdown-trigger.directive';
import { FileSelectDirective } from 'src/app/directives/file-select.directive';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AlertService } from 'src/app/services/alert/alert.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { RateService } from 'src/app/services/rate/rate.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { RateFormData, RateManagementComponent } from './rate-management/rate-management.component';

@Component({
  selector: 'app-rates',
  standalone: true,
  imports: [CommonModule, PipesModule, ButtonComponent, DropdownTriggerDirective, FileSelectDirective, RateManagementComponent],
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

  selectedRate: any = null;
  isRateDrawerOpen: boolean = false;
  initialFile: File | null = null;

  isSmall: boolean = window.innerWidth < 640;

  @ViewChildren('fileTableInput') fileTableInputs!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(
    private eventManager: EventManagerService,
    private alertService: AlertService,
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
      },
      error: (error: any) => {
        this.loadingRates = false;
      },
    });
  }

  triggerFileTableInput(index: number) {
    this.fileTableInputs.toArray()[index].nativeElement.value = '';
    this.fileTableInputs.toArray()[index].nativeElement.click();
  }

  uploadRateFile(uploadedFile: any, rate: any) {
    const file = uploadedFile as File;
    if (!file) return;

    if (rate.currentRate.rateStatus === 'PENDIENTE POR CARGAR') {
      if (this.isRateDrawerOpen) return;
      this.initialFile = file;
      this.openRateDetail(rate);
    } else {
      const data = { file };
      this.onSubmitRate(data, rate);
    }
  }

  openRateDetail(rate: any) {
    if (!rate) return;
    this.selectedRate = rate;
    this.isRateDrawerOpen = true;
  }

  onDrawerOpenChange(open: boolean) {
    this.isRateDrawerOpen = open;
    if (!open) this.onDrawerClose();
  }

  onDrawerClose() {
    this.selectedRate = null;
    this.initialFile = null;
  }

  onSubmitRate = async (rateForm: RateFormData, rate?: any): Promise<boolean> => {
    return new Promise((resolve) => {
      const targetRate = rate ?? this.selectedRate;
      if (!targetRate) resolve(false);

      if (!rateForm?.file) {
        this.alertService.warning(
          '¡Aviso!',
          'Debe seleccionar un documento.',
        );
        resolve(false);
      }

      const reqData = new FormData();
      reqData.append('archivo', rateForm.file, rateForm.file.name);
      if (rateForm.observations) reqData.append('observations', rateForm.observations);

      resolve(true);
      // this.serviceMethod(formData).subscribe({
      //   next: (res) => {
      //     resolve(true);
      //   },
      //   error: (err) => {
      //     resolve(false);
      //   }
      // });
    });
  }

  deleteRate() {
    this.alertService.confirmDelete(
      '¿Estas seguro de eliminar la tarifa?',
      'En caso de eliminar la tarifa se perderá y no podrá recuperarse'
    ).subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.alertService.success(
        '¡Tarifa eliminada!',
        'La tarifa se eliminó correctamente.'
      );
      // this.alertService.error(
      //   'Error',
      //   'Lo sentimos, no se pudo eliminar la tarifa.'
      // );
    });
  }

}
