import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DropdownTriggerDirective } from 'src/app/directives/dropdown-trigger.directive';
import { FileSelectDirective } from 'src/app/directives/file-select.directive';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AlertService } from 'src/app/services/alert/alert.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { RateService } from 'src/app/services/rate/rate.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { RateManagementComponent } from './rate-management/rate-management.component';
import { BadgeConfig } from 'src/app/types/badge-config.type';

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

  statusConfig: Record<string, BadgeConfig> = {
    'APROBADO': {
      bgClass: 'bg-green-100',
      textClass: 'text-green-800',
      icon: 'check',
      label: 'Aprobado'
    },
    'RECHAZADO': {
      bgClass: 'bg-red-100',
      textClass: 'text-red-800',
      icon: 'close',
      label: 'Rechazado'
    },
    'EN PROCESO': {
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800',
      icon: 'clock',
      label: 'En proceso'
    },
    'PENDIENTE POR CARGAR': {
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-800',
      label: 'Pendiente por cargar'
    },
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

  getRateStatus(rate: any): string {
    if (!rate) return 'PENDIENTE POR CARGAR';
    return rate.rateStatus;
  }

  triggerFileTableInput(index: number) {
    this.fileTableInputs.toArray()[index].nativeElement.value = '';
    this.fileTableInputs.toArray()[index].nativeElement.click();
  }

  uploadRateFile(uploadedFile: any, rate: any) {
    const file = uploadedFile as File;
    if (!file) return;

    if (this.getRateStatus(rate.currentRate) === 'PENDIENTE POR CARGAR') {
      if (this.isRateDrawerOpen) return;
      this.initialFile = file;
      this.openRateDetail(rate);
    } else {
      this.onSubmitRate(file, rate);
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

  onSubmitRate(file: File, rate: any) {
    if (!file || !rate) return;

    const reqData = new FormData();
    reqData.append('archivo', file, file.name);
    // this.rateService.uploadRate(formData).subscribe({
    //   next: (res) => {
    //   },
    //   error: (err) => {
    //     console.error(err);
    //   }
    // });
  }

  deleteRate(rate: any) {
    this.alertService.confirmDelete(
      '¿Estas seguro de eliminar la tarifa?',
      'En caso de eliminar la tarifa se perderá y no podrá recuperarse'
    ).subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      // this.rateService.deleteRate(formData).subscribe({
      //   next: (res) => {
      //   },
      //   error: (err) => {
      //     console.error(err);
      //   }
      // });
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
