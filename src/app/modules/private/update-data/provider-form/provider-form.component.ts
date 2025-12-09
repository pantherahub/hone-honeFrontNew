import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LANGUAGES } from 'src/app/constants/languages';
import { AlertService } from 'src/app/services/alert/alert.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { ProviderService } from 'src/app/services/provider/provider.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';

@Component({
  selector: 'app-provider-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, TextInputComponent, InputErrorComponent, SelectComponent],
  templateUrl: './provider-form.component.html',
  styleUrl: './provider-form.component.scss'
})
export class ProviderFormComponent {

  @Input() isFirstForm: boolean = true;
  @Input() form!: FormGroup;

  @Input() providerFormFields: string[] = [];
  @Input() identificationTypes: any[] = [];

  @Input() validateProviderForm!: (form?: FormGroup) => Promise<boolean>;

  @Output() clearSectionBackendError = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  tempForm?: FormGroup;
  isEditing = false;

  languageList: any[] = LANGUAGES;

  customErrorMessagesMap: { [key: string]: any } = {
    dv: {
      invalidDigit: (error: string) => error
    },
  };

  backendError: any = null;

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private eventManager: EventManagerService,
    private cdr: ChangeDetectorRef,
    private formUtils: FormUtilsService,
    private providerService: ProviderService,
  ) { }

  get selectedForm(): FormGroup {
    return this.isEditing && this.tempForm
      ? this.tempForm
      : this.form;
  }

  controlNeedsAsterisk(controlName: string): boolean {
    const control = this.selectedForm.get(controlName);
    if (!control) return false;

    const isRequired = this.formUtils.isControlRequired(control);

    if (control.disabled && control.value != null) {
      return false;
    }
    return isRequired;
  }

  getLabel(controlName: string, baseLabel: string): string {
    return this.controlNeedsAsterisk(controlName)
      ? `* ${baseLabel}`
      : baseLabel;
  }

  async goNext() {
    if (!this.isFirstForm) {
      this.next.emit();
      return;
    }
    this.next.emit();
  }

  openEmailInfo() {
    this.alertService.info(
      "Correo único corporativo o personal del prestador.",
      "En caso de que administres o gestiones mas de un prestador, asegúrate de que el correo electrónico registrado sea el personal o corporativo correspondiente a cada uno de ellos.",
    );
  }

  startEdit() {
    // Creates an independent copy of the parent form
    this.tempForm = this.cloneSelectedFields(this.form);
    this.isEditing = true;
    this.eventManager.startEditingProvider();
    // if (!this.isFirstForm) {
    //   this.enableFields();
    // }
    // this.tempForm.updateValueAndValidity();
    // this.cdr.detectChanges();
  }

  cancelEdit() {
    this.tempForm = undefined;
    this.isEditing = false;
    this.eventManager.stopEditingProvider();
    if (!this.isFirstForm) {
      this.disableFields();
    }
    this.clearSectionBackendError.emit();
  }

  async confirmEdit() {
    if (!this.tempForm) return;

    if (this.tempForm.invalid) {
      this.tempForm.markAllAsTouched();
      return;
    }

    const isValid = await this.validateProviderForm(this.tempForm);
    if (!isValid) return;

    this.form.patchValue(this.tempForm.getRawValue());
    this.isEditing = false;
    this.eventManager.stopEditingProvider();
    this.tempForm = undefined;

    this.save.emit();
    if (!this.isFirstForm) {
      this.disableFields();
    }
  }

  private cloneSelectedFields(form: FormGroup): FormGroup {
    const group: any = {};
    this.providerFormFields.forEach(field => {
      const control = form.get(field);
      if (control) {
        group[field] = this.fb.control(
          control.value,
          control.validator,
          control.asyncValidator
        );
      }
    });
    return this.fb.group(group);
  }

  private disableFields() {
    this.providerFormFields.forEach(field => {
      this.form.get(field)?.disable({ emitEvent: false });
    });
  }

  private enableFields() {
    this.providerFormFields.forEach(field => {
      this.form.get(field)?.enable({ emitEvent: false });
    });
  }

}
