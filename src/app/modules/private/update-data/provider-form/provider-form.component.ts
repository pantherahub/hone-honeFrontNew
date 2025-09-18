import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LANGUAGES } from 'src/app/constants/languages';
import { AlertService } from 'src/app/services/alert/alert.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
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

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private eventManager: EventManagerService,
  ) { }

  get selectedForm(): FormGroup {
    return this.isEditing && this.tempForm
      ? this.tempForm
      : this.form;
  }

  goNext() {
    this.providerFormFields.forEach(field => {
      const control = this.form.get(field);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
    const invalidFields = this.providerFormFields.filter(
      field => this.form.get(field)?.invalid
    );
    if (invalidFields.length > 0) {
      this.alertService.warning(
        'Datos incompletos',
        'Por favor completa todos los campos requeridos antes de continuar.'
      );
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
  }

  cancelEdit() {
    this.tempForm = undefined;
    this.isEditing = false;
    this.eventManager.stopEditingProvider();
    if (!this.isFirstForm) {
      this.disableFields();
    }
  }

  confirmEdit() {
    if (!this.tempForm) return;

    if (this.tempForm.invalid) {
      this.tempForm.markAllAsTouched();
      return;
    }

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
