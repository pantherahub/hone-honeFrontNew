import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownTriggerDirective } from 'src/app/directives/dropdown-trigger.directive';
import { FileSelectDirective } from 'src/app/directives/file-select.directive';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { DrawerComponent } from 'src/app/shared/components/drawer/drawer.component';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';

export interface RateFormData {
  file: File;
  observations?: string | null;
}

@Component({
  selector: 'app-rate-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DrawerComponent, TextInputComponent, ButtonComponent, PipesModule, FileSelectDirective, DropdownTriggerDirective],
  templateUrl: './rate-management.component.html',
  styleUrl: './rate-management.component.scss'
})
export class RateManagementComponent implements OnInit, OnChanges {

  @Input() isOpen: boolean = false;
  @Input() selectedRate!: any;
  @Input() initialFile: File | null = null;
  @Input() statusConfig!: Record<string, { bg: string; text: string; icon?: string; label: string }>;
  @Input() submitRate!: (data: RateFormData) => Promise<boolean>;

  @Output() isOpenChange = new EventEmitter<boolean>();

  rateForm!: FormGroup;

  @ViewChild('rateDrawer', { static: false }) rateDrawer!: DrawerComponent;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
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

  /* Rate states */
  get isPending(): boolean {
    return this.selectedRate?.currentRate?.rateStatus === 'PENDIENTE POR CARGAR';
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
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }

  onDrawerOpenChange(open: boolean) {
    this.isOpen = open;
    this.isOpenChange.emit(this.isOpen);
  }

  onDrawerClose() {
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
    const ok = await this.submitRate(this.rateForm.value);
    if (ok) this.rateDrawer.close();
  }

}
