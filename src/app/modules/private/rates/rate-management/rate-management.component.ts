import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownTriggerDirective } from 'src/app/directives/dropdown-trigger.directive';
import { FileSelectDirective } from 'src/app/directives/file-select.directive';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ButtonComponent } from 'src/app/shared/ui/buttons/button/button.component';
import { DrawerComponent } from 'src/app/shared/ui/overlays/drawer/drawer.component';
import { TextInputComponent } from 'src/app/shared/ui/forms/text-input/text-input.component';
import { BadgeConfig } from 'src/app/types/badge-config.type';
import { BackendErrorsComponent } from 'src/app/shared/ui/feedback/backend-errors/backend-errors.component';

@Component({
  selector: 'app-rate-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DrawerComponent, TextInputComponent, ButtonComponent, PipesModule, FileSelectDirective, DropdownTriggerDirective, BackendErrorsComponent],
  templateUrl: './rate-management.component.html',
  styleUrl: './rate-management.component.scss'
})
export class RateManagementComponent implements OnInit, OnChanges {

  @Input() isOpen: boolean = false;
  @Input() selectedRate!: any;
  @Input() initialFile: File | null = null;
  @Input() statusConfig!: Record<string, BadgeConfig>;

  @Output() isOpenChange = new EventEmitter<boolean>();

  rateForm!: FormGroup;
  backendError: any = null;

  @ViewChild('rateDrawer', { static: false }) rateDrawer!: DrawerComponent;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.initRateForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialFile']?.currentValue &&
      changes['initialFile']?.previousValue !== undefined) {
      this.updateFile(changes['initialFile'].currentValue);
    }

    if (changes['isOpen'] &&
      changes['isOpen']?.previousValue !== undefined) {

      if (changes['isOpen'].currentValue) {
        this.rateDrawer.open();
      } else {
        this.rateDrawer.close();
      }
    }
  }

  initRateForm() {
    this.rateForm = this.fb.group({
      file: [null, Validators.required],
      observations: [null],
    });
  }

  get selectedFile() {
    return this.rateForm.get('file')?.value
  }

  updateFile(file: File | null) {
    this.rateForm.patchValue({
      file: file
    });
    this.rateForm.get('file')?.markAsDirty();
    this.rateForm.get('file')?.markAsTouched();
  }

  clearFile() {
    this.updateFile(null);
  }

  getRateStatus(rate: any): string {
    if (!rate) return 'PENDIENTE POR CARGAR';
    return rate.rateStatus;
  }

  /* Rate states */
  get isPending(): boolean {
    return !this.selectedRate?.currentRate || this.selectedRate?.currentRate?.rateStatus === 'PENDIENTE POR CARGAR';
  }
  get isRejected(): boolean {
    return this.selectedRate?.currentRate?.rateStatus === 'RECHAZADO';
  }
  get isApproved(): boolean {
    return this.selectedRate?.currentRate?.rateStatus === 'APROBADO';
  }
  get isProcessing(): boolean {
    return this.selectedRate?.currentRate?.rateStatus === 'EN PROCESO';
  }

  get showFooter(): boolean {
    return (
      this.isPending && (this.rateForm.dirty || this.rateForm.touched)
    );
  }

  close() {
    this.backendError = null;
    this.rateForm.reset();
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }

  downloadReport() { }

  triggerFileInput() {
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  uploadRateFile(uploadedFile: any) {
    const file = uploadedFile as File;
    if (!file) return;

    if (this.isPending) {
      this.updateFile(file);
    } else {
      this.onSubmit();
    }
  }

  async onSubmit() {
    this.backendError = null;
    if (!this.selectedRate) return;

    const file = this.rateForm.get('file')?.value;
    const observations = this.rateForm.get('observations')?.value;

    if (!file) {
      this.alertService.warning(
        '¡Acción requerida!',
        'Debes seleccionar un documento.',
      );
      return;
    }

    const reqData = new FormData();
    reqData.append('archivo', file, file.name);
    if (observations) reqData.append('observations', observations);

    this.rateDrawer.close();
    // this.rateService.uploadRate(formData).subscribe({
    //   next: (res) => {
    //     this.rateDrawer.close();
    //   },
    //   error: (err) => {
    //     if (err.status == 422) this.backendError = err.error;
    //   }
    // });
  }

}
