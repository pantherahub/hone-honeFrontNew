import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { DrawerComponent } from 'src/app/shared/components/drawer/drawer.component';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';

@Component({
  selector: 'app-rates',
  standalone: true,
  imports: [CommonModule, PipesModule, ButtonComponent, DropdownTriggerDirective, DrawerComponent, TextInputComponent],
  templateUrl: './rates.component.html',
  styleUrl: './rates.component.scss'
})
export class RatesComponent implements OnInit, AfterViewInit {

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

  @ViewChild('dropdownFormatsBtn', { static: true, read: ElementRef }) dropdownFormatsBtn!: ElementRef<any>;

  selectedRate: any = null;
  isRateDrawerOpen: boolean = false;

  rateForm!: FormGroup;

  @ViewChild('fileTableInput') fileTableInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private eventManager: EventManagerService,
    private modalService: ModalService,
    private alertService: AlertService,
    private downloadService: DownloadService,
    private toastService: ToastService,
    private rateService: RateService,
  ) { }

  ngOnInit(): void {
    this.getRates();
    this.initRateForm();
  }

  ngAfterViewInit(): void {
    const btn = this.dropdownFormatsBtn.nativeElement;
    const isSmall = window.innerWidth < 640; // sm breakpoint
    btn.setAttribute('data-dropdown-placement', isSmall ? 'bottom' : 'bottom-end');
    initDropdowns();
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

  initRateForm() {
    this.rateForm = this.fb.group({
      description: [null],
      file: [null, Validators.required],
    });
  }

  get selectedFile() {
    return this.rateForm.get('file')?.value
  }

  triggerFileTableInput() {
    this.fileTableInput.nativeElement.value = '';
    this.fileTableInput.nativeElement.click();
  }

  uploadRateFile(uploadedFile: any, rate: any) {
    const file = uploadedFile as File;
    if (!file) return;

    this.rateForm.patchValue({ file });
    // Si era pendiente por cargar entonces apenas cargue debe abrir los detalles con el formulario y el inputfile lleno

    if (rate.currentRate.rateStatus === 'PENDIENTE POR CARGAR') {
      if (!this.isRateDrawerOpen) return;
      this.openRateDetail(rate);
    } else {
      this.onSubmitRate(rate);
    }

    // si dentro del modal quitan el file cuando es pendiente por cargar aparecerá el box del input file que se tienen en documentos
    // cuando de a cancelar o a cerrar el modal unicamente debe preguntar si tienen un archivo cargado en el input file, si no tiene porque lo quitó entonces no se pregunta nada.
  }

  openRateDetail(rate: any) {
    if (!rate) return;
    this.selectedRate = rate;
    this.isRateDrawerOpen = true;
  }

  onDrawerClose() {
    console.log("onClose.isRateDrawerOpen", this.isRateDrawerOpen);
    this.selectedRate = null;
    this.rateForm.reset();
  }

  onSubmitRate(rate: any) {
    if (!this.selectedFile) {
      this.alertService.warning(
        '¡Aviso!',
        'Debe seleccionar un documento.',
      );
      return;
    }

    const description = this.rateForm.get('description')?.value;

    const reqData = new FormData();
    reqData.append('archivo', this.selectedFile, this.selectedFile.name);
    if (description) reqData.append('description', description);
  }

}
